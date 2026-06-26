import sys
import os
import struct
import json
import cv2
import numpy as np

# Add local path to sys.path so we can import deepfacev2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from deepfacev2.DeepFaceV2 import DeepFaceV2
from deepfacev2.modules.detection import detect_face_and_mask

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
                    if not os.path.exists(img_path):
                        response = {"status": "error", "message": f"Image path '{img_path}' not found"}
                    else:
                        img = cv2.imread(img_path)
                        faces = detect_face_and_mask(img)
                        if len(faces) == 0:
                            response = {
                                "status": "success",
                                "data": {
                                    "face_detected": False,
                                    "mask_detected": False,
                                    "mask_probability": 0.0,
                                    "bbox": [0, 0, 0, 0],
                                    "landmarks": []
                                }
                            }
                        else:
                            face = faces[0]
                            response = {
                                "status": "success",
                                "data": {
                                    "face_detected": True,
                                    "mask_detected": bool(face.mask_detected),
                                    "mask_probability": float(face.mask_probability),
                                    "bbox": [int(face.x), int(face.y), int(face.x + face.w), int(face.y + face.h)],
                                    "landmarks": [[int(pt[0]), int(pt[1])] for pt in face.landmarks] if face.landmarks else []
                                }
                            }
                            
                elif cmd == "verify":
                    img_path = request.get("img_path")
                    gallery_path = request.get("gallery_path")
                    threshold = request.get("threshold", 0.65)
                    
                    if not os.path.exists(img_path):
                        response = {"status": "error", "message": f"Target image path '{img_path}' not found"}
                    elif not os.path.exists(gallery_path):
                        response = {"status": "error", "message": f"Gallery image path '{gallery_path}' not found"}
                    else:
                        # Run full 5-stage verification
                        result = DeepFaceV2.verify(img_path, gallery_path, threshold=threshold)
                        response = {
                            "status": "success",
                            "data": result
                        }
                else:
                    response = {"status": "error", "message": f"Unknown command '{cmd}'"}
                    
            else:
                # --- BINARY STREAM PROTOCOL MODE ---
                # Since we already read 1 byte of the 4-byte length prefix, 
                # we read the remaining 3 bytes
                remaining_len_bytes = sys.stdin.buffer.read(3)
                if len(remaining_len_bytes) < 3:
                    break
                length_bytes = first_byte + remaining_len_bytes
                length = struct.unpack(">I", length_bytes)[0]
                
                # Read payload bytes
                payload = sys.stdin.buffer.read(length)
                if len(payload) < length:
                    break
                    
                nparr = np.frombuffer(payload, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    response = {"status": "error", "message": "Failed to decode image frame"}
                else:
                    faces = detect_face_and_mask(img)
                    if len(faces) == 0:
                        response = {
                            "status": "success",
                            "data": {
                                "face_detected": False,
                                "mask_detected": False,
                                "mask_probability": 0.0,
                                "bbox": [0, 0, 0, 0],
                                "landmarks": []
                            }
                        }
                    else:
                        face = faces[0]
                        response = {
                            "status": "success",
                            "data": {
                                "face_detected": True,
                                "mask_detected": bool(face.mask_detected),
                                "mask_probability": float(face.mask_probability),
                                "bbox": [int(face.x), int(face.y), int(face.x + face.w), int(face.y + face.h)],
                                "landmarks": [[int(pt[0]), int(pt[1])] for pt in face.landmarks] if face.landmarks else []
                            }
                        }
            
            # Send single line JSON response to stdout
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
            
        except Exception as e:
            err_resp = {"status": "error", "message": str(e)}
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
