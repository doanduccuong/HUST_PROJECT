import sys
import os
import struct
import json
import cv2
import numpy as np

# Add parent path so we can import the deepface package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from deepfacev2 import DeepFace

def make_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(v) for v in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return make_serializable(obj.tolist())
    else:
        return obj

def load_image_safely(path):
    if not path or not os.path.exists(path):
        return None
    try:
        # Read the file bytes and decode with OpenCV to handle Unicode paths safely
        with open(path, "rb") as f:
            file_bytes = np.frombuffer(f.read(), dtype=np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

def calculate_msr(region):
    left_eye = region.get("left_eye")
    right_eye = region.get("right_eye")
    nose = region.get("nose")
    mouth_left = region.get("mouth_left")
    mouth_right = region.get("mouth_right")
    
    if not left_eye or not right_eye or not nose:
        return 1.0
        
    x_nose = nose[0]
    
    # Eye pair symmetry term
    d_left_eye = abs(left_eye[0] - x_nose)
    d_right_eye = abs(right_eye[0] - x_nose)
    sum_eye = d_left_eye + d_right_eye
    term_eye = abs(d_left_eye - d_right_eye) / sum_eye if sum_eye > 0 else 0.0
    
    terms = [term_eye]
    
    # Mouth pair symmetry term
    if mouth_left and mouth_right:
        d_left_mouth = abs(mouth_left[0] - x_nose)
        d_right_mouth = abs(mouth_right[0] - x_nose)
        sum_mouth = d_left_mouth + d_right_mouth
        term_mouth = abs(d_left_mouth - d_right_mouth) / sum_mouth if sum_mouth > 0 else 0.0
        terms.append(term_mouth)
        
    msr = 1.0 - sum(terms) / len(terms)
    return float(msr)

def calculate_cs(emotions):
    p_happy = emotions.get("happy", 0.0) / 100.0
    p_neutral = emotions.get("neutral", 0.0) / 100.0
    p_surprise = emotions.get("surprise", 0.0) / 100.0
    p_sad = emotions.get("sad", 0.0) / 100.0
    p_angry = emotions.get("angry", 0.0) / 100.0
    p_fear = emotions.get("fear", 0.0) / 100.0
    p_disgust = emotions.get("disgust", 0.0) / 100.0
    
    score = p_happy + 0.7 * p_neutral + 0.3 * p_surprise - 0.5 * p_sad - 0.8 * p_angry - 0.6 * p_fear - 0.4 * p_disgust
    cs = 100.0 * max(0.0, min(1.0, score))
    return float(cs)


def extract_patch(img, bbox, region_type):
    x1, y1, x2, y2 = bbox
    w = x2 - x1
    h = y2 - y1
    img_h, img_w = img.shape[:2]
    
    if region_type == "eyes":
        px1 = max(0, x1)
        py1 = max(0, y1)
        px2 = min(img_w, x2)
        py2 = min(img_h, y1 + int(h * 0.55))
    elif region_type == "nose":
        px1 = max(0, x1 + int(w * 0.15))
        py1 = max(0, y1 + int(h * 0.35))
        px2 = min(img_w, x1 + int(w * 0.85))
        py2 = min(img_h, y1 + int(h * 0.75))
    elif region_type == "mouth":
        px1 = max(0, x1)
        py1 = max(0, y1 + int(h * 0.60))
        px2 = min(img_w, x2)
        py2 = min(img_h, y2)
    else:
        return img[max(0, y1):min(img_h, y2), max(0, x1):min(img_w, x2)]
        
    return img[py1:py2, px1:px2]

def get_embedding(img):
    if img is None or img.size == 0:
        return None
    try:
        res = DeepFace.represent(img_path=img, model_name="VGG-Face", detector_backend="skip", enforce_detection=False)
        if res and len(res) > 0:
            return res[0]["embedding"]
    except Exception as e:
        sys.stderr.write(f"[Python Log] Embedding extraction failed: {str(e)}\n")
        sys.stderr.flush()
    return None

def cosine_distance(v1, v2):
    if v1 is None or v2 is None:
        return 1.0
    v1 = np.array(v1)
    v2 = np.array(v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 1.0
    return float(1.0 - np.dot(v1, v2) / (norm1 * norm2))

def main():
    # Write ready signal to stderr so Go backend knows we've initialized
    sys.stderr.write("BRIDGE_READY\n")
    sys.stderr.flush()

    while True:
        try:
            # Peek first character to see if it is JSON (starts with '{' -> 0x7B)
            # We read 1 byte first
            first_byte = sys.stdin.buffer.read(1)
            if not first_byte:
                break
                
            if first_byte == b'{':
                # --- JSON PROTOCOL MODE ---
                # Read the rest of the line until '\n'
                rest = sys.stdin.buffer.readline()
                line = (first_byte + rest).decode('utf-8')
                
                request = json.loads(line)
                cmd = request.get("cmd")
                
                if cmd == "detect":
                    img_path = request.get("img_path")
                    img = load_image_safely(img_path)
                    if img is None:
                        response = {"status": "error", "message": f"Image path '{img_path}' not found or could not be decoded"}
                    else:
                        # Call DeepFace.analyze with numpy array
                        # Set enforce_detection=False to avoid raising exceptions
                        results = DeepFace.analyze(
                            img_path=img,
                            actions=("emotion", "age", "gender", "race"),
                            enforce_detection=False,
                            silent=True
                        )
                        if not results or len(results) == 0:
                            response = {
                                "status": "success",
                                "data": {
                                    "face_detected": False,
                                    "mask_detected": False,
                                    "mask_probability": 0.0,
                                    "bbox": [0, 0, 0, 0],
                                    "landmarks": [],
                                    "age": 0,
                                    "gender": "unknown",
                                    "race": "unknown",
                                    "emotions": {},
                                    "cs_score": 0.0,
                                    "msr_score": 1.0
                                }
                            }
                        else:
                            res = results[0] if isinstance(results, list) else results
                            region = res.get("region", {})
                            x = region.get("x", 0)
                            y = region.get("y", 0)
                            w = region.get("w", 0)
                            h = region.get("h", 0)
                            
                            # Extract landmarks from region
                            left_eye = region.get("left_eye")
                            right_eye = region.get("right_eye")
                            nose = region.get("nose")
                            mouth_left = region.get("mouth_left")
                            mouth_right = region.get("mouth_right")
                            
                            landmarks_list = []
                            if left_eye: landmarks_list.append([int(left_eye[0]), int(left_eye[1])])
                            if right_eye: landmarks_list.append([int(right_eye[0]), int(right_eye[1])])
                            if nose: landmarks_list.append([int(nose[0]), int(nose[1])])
                            if mouth_left: landmarks_list.append([int(mouth_left[0]), int(mouth_left[1])])
                            if mouth_right: landmarks_list.append([int(mouth_right[0]), int(mouth_right[1])])
                            
                            emotions = res.get("emotion", {})
                            cs_score = calculate_cs(emotions)
                            msr_score = calculate_msr(region)
                            
                            response = {
                                "status": "success",
                                "data": {
                                    "face_detected": True,
                                    "mask_detected": False,
                                    "mask_probability": 0.0,
                                    "bbox": [int(x), int(y), int(x + w), int(y + h)],
                                    "landmarks": landmarks_list,
                                    "age": int(res.get("age", 0)),
                                    "gender": res.get("dominant_gender", "unknown"),
                                    "race": res.get("dominant_race", "unknown"),
                                    "emotions": emotions,
                                    "cs_score": cs_score,
                                    "msr_score": msr_score
                                }
                            }
                            
                elif cmd == "verify":
                    img_path = request.get("img_path")
                    gallery_path = request.get("gallery_path")
                    threshold = request.get("threshold", 0.65)
                    
                    img1 = load_image_safely(img_path)
                    img2 = load_image_safely(gallery_path)
                    
                    if img1 is None:
                        response = {"status": "error", "message": f"Target image path '{img_path}' not found or could not be decoded"}
                    elif img2 is None:
                        response = {"status": "error", "message": f"Gallery image path '{gallery_path}' not found or could not be decoded"}
                    else:
                        result = DeepFace.verify_adaptive_patch(
                            img1_path=img1,
                            img2_path=img2
                        )
                        response = {
                            "status": "success",
                            "data": result
                        }
                else:
                    response = {"status": "error", "message": f"Unknown command '{cmd}'"}
                    
            else:
                # --- BINARY STREAM PROTOCOL MODE ---
                remaining_len_bytes = sys.stdin.buffer.read(3)
                if len(remaining_len_bytes) < 3:
                    break
                length_bytes = first_byte + remaining_len_bytes
                length = struct.unpack(">I", length_bytes)[0]
                
                payload = sys.stdin.buffer.read(length)
                if len(payload) < length:
                    break
                    
                nparr = np.frombuffer(payload, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    response = {"status": "error", "message": "Failed to decode image frame"}
                else:
                    results = DeepFace.analyze(
                        img_path=img,
                        actions=("emotion", "age", "gender", "race"),
                        enforce_detection=False,
                        silent=True
                    )
                    if not results or len(results) == 0:
                        response = {
                            "status": "success",
                            "data": {
                                "face_detected": False,
                                "mask_detected": False,
                                "mask_probability": 0.0,
                                "bbox": [0, 0, 0, 0],
                                "landmarks": [],
                                "age": 0,
                                "gender": "unknown",
                                "race": "unknown",
                                "emotions": {},
                                "cs_score": 0.0,
                                "msr_score": 1.0
                            }
                        }
                    else:
                        res = results[0] if isinstance(results, list) else results
                        region = res.get("region", {})
                        x = region.get("x", 0)
                        y = region.get("y", 0)
                        w = region.get("w", 0)
                        h = region.get("h", 0)
                        
                        # Extract landmarks from region
                        left_eye = region.get("left_eye")
                        right_eye = region.get("right_eye")
                        nose = region.get("nose")
                        mouth_left = region.get("mouth_left")
                        mouth_right = region.get("mouth_right")
                        
                        landmarks_list = []
                        if left_eye: landmarks_list.append([int(left_eye[0]), int(left_eye[1])])
                        if right_eye: landmarks_list.append([int(right_eye[0]), int(right_eye[1])])
                        if nose: landmarks_list.append([int(nose[0]), int(nose[1])])
                        if mouth_left: landmarks_list.append([int(mouth_left[0]), int(mouth_left[1])])
                        if mouth_right: landmarks_list.append([int(mouth_right[0]), int(mouth_right[1])])
                        
                        emotions = res.get("emotion", {})
                        cs_score = calculate_cs(emotions)
                        msr_score = calculate_msr(region)
                        
                        response = {
                            "status": "success",
                            "data": {
                                "face_detected": True,
                                "mask_detected": False,
                                "mask_probability": 0.0,
                                "bbox": [int(x), int(y), int(x + w), int(y + h)],
                                "landmarks": landmarks_list,
                                "age": int(res.get("age", 0)),
                                "gender": res.get("dominant_gender", "unknown"),
                                "race": res.get("dominant_race", "unknown"),
                                "emotions": emotions,
                                "cs_score": cs_score,
                                "msr_score": msr_score
                            }
                        }
            
            # Send single line JSON response to stdout
            sys.stdout.write(json.dumps(make_serializable(response)) + "\n")
            sys.stdout.flush()
            
        except Exception as e:
            err_resp = {"status": "error", "message": str(e)}
            sys.stdout.write(json.dumps(make_serializable(err_resp)) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
