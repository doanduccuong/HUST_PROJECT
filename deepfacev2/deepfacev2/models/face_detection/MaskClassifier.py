import os
import sys
import cv2
import numpy as np

class MaskClassifier:
    def __init__(self, model_path: str = "assets/models/mask_classifier.onnx") -> None:
        self.model_path = model_path
        self.session = None
        self.has_model = False
        
        if os.path.exists(model_path):
            try:
                # pyrefly: ignore [missing-import]
                import onnxruntime as ort
                self.session = ort.InferenceSession(model_path)
                self.has_model = True
                print(f"[MaskClassifier] Loaded ONNX model from {model_path}", file=sys.stderr)
            except Exception as e:
                print(f"[MaskClassifier] Failed to load ONNX model: {e}. Falling back to color heuristic.", file=sys.stderr)
        else:
            print(f"[MaskClassifier] Model file not found at '{model_path}'. Running in Color Heuristic fallback mode.", file=sys.stderr)

    def predict_mask(self, face_img: np.ndarray) -> float:
        """
        Predicts the probability of wearing a mask.
        
        Args:
            face_img (np.ndarray): Cropped face image in BGR format.
            
        Returns:
            float: Probability of wearing a mask (0.0 to 1.0)
        """
        if face_img is None or face_img.size == 0:
            return 0.0
            
        if self.has_model:
            return self._predict_onnx(face_img)
        else:
            return self._predict_heuristic(face_img)

    def _predict_heuristic(self, face_img: np.ndarray) -> float:
        h, w, _ = face_img.shape
        # Focus on the lower-middle face region (mouth and chin)
        mouth_region = face_img[int(h * 0.65):int(h * 0.95), int(w * 0.25):int(w * 0.75)]
        
        if mouth_region.size == 0:
            return 0.0
            
        # Calculate average BGR colors
        avg_bgr = np.mean(mouth_region, axis=(0, 1))
        b, g, r = avg_bgr[0], avg_bgr[1], avg_bgr[2]
        
        # Skin tones typically have a high R channel compared to B (R - B > 25)
        # Surgical masks are usually light blue/green or white.
        # White/light grey masks will have high intensity in all channels.
        # Black masks will have extremely low intensity in all channels.
        
        r_b_diff = r - b
        brightness = (r + g + b) / 3.0
        
        # Heuristic rules:
        # 1. Standard skin tone check (R is dominant over B)
        if r_b_diff > 22.0 and brightness < 200:
            # Most likely skin tone (no mask)
            # Probability of mask is low
            return float(np.clip(1.0 - (r_b_diff / 80.0), 0.02, 0.15))
        
        # 2. Check for light blue/green surgical mask (B and G channels are higher)
        if b > r and b > 100:
            return 0.96
            
        # 3. Check for white mask (very high brightness, low difference between channels)
        if brightness > 185 and r_b_diff < 15.0:
            return 0.98
            
        # 4. Check for black/dark mask (very dark region)
        if brightness < 45:
            return 0.94
            
        # Default fallback
        return 0.90 if r_b_diff < 15.0 else 0.10

    def _predict_onnx(self, face_img: np.ndarray) -> float:
        # MobileNetV2 input size 224x224
        target_size = 224
        resized = cv2.resize(face_img, (target_size, target_size), interpolation=cv2.INTER_LINEAR)
        
        # Normalize to [0, 1] and standard ImageNet scale if needed
        input_data = resized.astype(np.float32) / 255.0
        
        # HWC to CHW
        input_data = np.transpose(input_data, (2, 0, 1))
        input_data = np.expand_dims(input_data, axis=0)
        
        # Run inference
        outputs = self.session.run(None, {"input_image": input_data})
        # outputs[0] shape is [1, 2] representing [prob_no_mask, prob_mask]
        probs = outputs[0][0]
        
        # Softmax if raw logits are returned
        if np.abs(np.sum(probs) - 1.0) > 1e-4:
            exp_probs = np.exp(probs - np.max(probs))
            probs = exp_probs / np.sum(exp_probs)
            
        return float(probs[1]) # Return mask probability
