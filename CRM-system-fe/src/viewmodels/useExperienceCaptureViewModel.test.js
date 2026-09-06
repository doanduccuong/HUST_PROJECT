import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExperienceCaptureViewModel } from "./useExperienceCaptureViewModel";

function videoElement() {
  return {
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    load: vi.fn(),
    removeAttribute: vi.fn(),
    readyState: 2,
    videoWidth: 1280,
    videoHeight: 720,
    src: "",
    srcObject: null,
  };
}

function canvasElement() {
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({ drawImage: vi.fn() })),
    toBlob: vi.fn((callback) => callback(new Blob(["frame"], { type: "image/jpeg" }))),
  };
}

function api(resultOverrides = {}) {
  return {
    startSession: vi.fn().mockResolvedValue({
      sessionId: "session-1",
      sourceType: "VIDEO_FILE",
      status: "OPEN",
    }),
    analyzeFrame: vi.fn().mockResolvedValue({
      sequence: 1,
      stateChanged: true,
      previousState: "NEUTRAL",
      experienceState: "DELIGHTED",
      ...resultOverrides,
    }),
    closeSession: vi.fn().mockResolvedValue({
      sessionId: "session-1",
      status: "CLOSED",
      totalFrames: 1,
      acceptedFrames: 1,
      rejectedFrames: 0,
      transitionCount: 1,
      finalState: "DELIGHTED",
    }),
  };
}

describe("useExperienceCaptureViewModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:demo-video"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("runs a video session, analyzes a frame and closes it", async () => {
    const fakeApi = api();
    const { result, unmount } = renderHook(() => useExperienceCaptureViewModel(fakeApi));
    result.current.videoRef.current = videoElement();
    result.current.canvasRef.current = canvasElement();

    act(() => result.current.selectVideoFile(new File(["video"], "demo.mp4", { type: "video/mp4" })));
    await act(() => result.current.startSession({ cameraId: "CAM-01", zone: "PRODUCT" }));

    expect(fakeApi.startSession).toHaveBeenCalledWith({
      cameraId: "CAM-01",
      zone: "PRODUCT",
      customerId: null,
      sourceType: "VIDEO_FILE",
    });
    expect(fakeApi.analyzeFrame).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("RUNNING");
    expect(result.current.transitions).toHaveLength(1);

    await act(() => result.current.stopSession());

    expect(fakeApi.closeSession).toHaveBeenCalledWith("session-1");
    expect(result.current.status).toBe("CLOSED");
    expect(result.current.summary.finalState).toBe("DELIGHTED");
    unmount();
  });

  it("does not append timeline item when state did not change", async () => {
    const fakeApi = api({ stateChanged: false });
    const { result, unmount } = renderHook(() => useExperienceCaptureViewModel(fakeApi));
    result.current.videoRef.current = videoElement();
    result.current.canvasRef.current = canvasElement();

    act(() => result.current.selectVideoFile(new File(["video"], "demo.mp4", { type: "video/mp4" })));
    await act(() => result.current.startSession({ cameraId: "CAM-01", zone: "ENTRANCE" }));

    expect(result.current.transitions).toHaveLength(0);
    unmount();
  });

  it("reports missing browser webcam support", async () => {
    vi.stubGlobal("navigator", {});
    const { result } = renderHook(() => useExperienceCaptureViewModel(api()));
    result.current.videoRef.current = videoElement();

    await act(() => result.current.openWebcam());

    expect(result.current.error).toBe("Trình duyệt không hỗ trợ webcam.");
  });

  it("reports webcam permission denial without starting a session", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")) },
    });
    const fakeApi = api();
    const { result } = renderHook(() => useExperienceCaptureViewModel(fakeApi));
    result.current.videoRef.current = videoElement();

    await act(() => result.current.openWebcam());

    expect(result.current.status).toBe("ERROR");
    expect(result.current.error).toBe("Permission denied");
    expect(fakeApi.startSession).not.toHaveBeenCalled();
  });

  it("stops webcam tracks after closing the session", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] };
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    const fakeApi = api();
    const { result } = renderHook(() => useExperienceCaptureViewModel(fakeApi));
    result.current.videoRef.current = videoElement();
    result.current.canvasRef.current = canvasElement();

    await act(() => result.current.openWebcam());
    await act(() => result.current.startSession({ cameraId: "CAM-01", zone: "WAITING" }));
    await act(() => result.current.stopSession());

    expect(stop).toHaveBeenCalledTimes(1);
    expect(fakeApi.closeSession).toHaveBeenCalledWith("session-1");
  });

  it("keeps the capture page running when one frame request fails", async () => {
    const fakeApi = api();
    fakeApi.analyzeFrame.mockRejectedValueOnce(new Error("AI timeout"));
    const { result, unmount } = renderHook(() => useExperienceCaptureViewModel(fakeApi));
    result.current.videoRef.current = videoElement();
    result.current.canvasRef.current = canvasElement();

    act(() => result.current.selectVideoFile(new File(["video"], "demo.mp4", { type: "video/mp4" })));
    await act(() => result.current.startSession({ cameraId: "CAM-01", zone: "PRODUCT" }));

    expect(result.current.status).toBe("RUNNING");
    expect(result.current.error).toBe("AI timeout");
    expect(result.current.latestResult).toBeNull();
    unmount();
  });
});
