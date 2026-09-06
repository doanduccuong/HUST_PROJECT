import { describe, expect, it, vi } from "vitest";
import { calculateFrameSize, canvasToJpegBlob } from "./frameSampling";

describe("calculateFrameSize", () => {
  it("keeps a small frame at its original size", () => {
    expect(calculateFrameSize(320, 240)).toEqual({ width: 320, height: 240 });
  });

  it("scales a large frame to 640 pixels while preserving aspect ratio", () => {
    expect(calculateFrameSize(1920, 1080)).toEqual({ width: 640, height: 360 });
  });

  it("returns zero dimensions before video metadata is ready", () => {
    expect(calculateFrameSize(0, 0)).toEqual({ width: 0, height: 0 });
  });
});

describe("canvasToJpegBlob", () => {
  it("resolves the JPEG blob produced by canvas", async () => {
    const blob = new Blob(["frame"], { type: "image/jpeg" });
    const canvas = { toBlob: vi.fn((callback, type) => callback(blob)) };

    await expect(canvasToJpegBlob(canvas)).resolves.toBe(blob);
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/jpeg", 0.82);
  });

  it("rejects when canvas cannot produce a blob", async () => {
    const canvas = { toBlob: vi.fn((callback) => callback(null)) };

    await expect(canvasToJpegBlob(canvas)).rejects.toThrow("Không tạo được JPEG frame");
  });
});
