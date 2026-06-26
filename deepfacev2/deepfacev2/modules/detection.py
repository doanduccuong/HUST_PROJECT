import numpy as np
from typing import Any, Dict, List, Optional, Tuple
from deepfacev2.models.face_detection.RetinaFace import RetinaFaceClient
from deepfacev2.models.face_detection.MaskClassifier import MaskClassifier
from deepfacev2.models.Detector import FacialAreaRegion

# Caching instances to prevent reloading models on every frame
_detector_instance: Optional[RetinaFaceClient] = None
_classifier_instance: Optional[MaskClassifier] = None

def get_detector(model_path: str = "assets/models/retinaface.onnx") -> RetinaFaceClient:
    global _detector_instance
    if _detector_instance is None or _detector_instance.model_path != model_path:
        _detector_instance = RetinaFaceClient(model_path)
    return _detector_instance

def get_classifier(model_path: str = "assets/models/mask_classifier.onnx") -> MaskClassifier:
    global _classifier_instance
    if _classifier_instance is None or _classifier_instance.model_path != model_path:
        _classifier_instance = MaskClassifier(model_path)
    return _classifier_instance

def detect_face_and_mask(
    img: np.ndarray,
    retinaface_model_path: str = "assets/models/retinaface.onnx",
    mask_model_path: str = "assets/models/mask_classifier.onnx",
    threshold: float = 0.8
) -> List[FacialAreaRegion]:
    """
    Detect all faces and predict their mask status.
    
    Args:
        img (np.ndarray): Input image in BGR format.
        retinaface_model_path (str): Path to RetinaFace ONNX weights.
        mask_model_path (str): Path to Mask Classifier ONNX weights.
        threshold (float): Threshold to classify mask-wearing.
        
    Returns:
        List[FacialAreaRegion]: List of facial regions with bounding box, landmarks and mask status.
    """
    if img is None or img.size == 0:
        return []
        
    detector = get_detector(retinaface_model_path)
    classifier = get_classifier(mask_model_path)
    
    faces = detector.detect_faces(img)
    h_orig, w_orig, _ = img.shape
    
    for face in faces:
        # Crop the face with a small margin for classification
        margin_x = int(face.w * 0.1)
        margin_y = int(face.h * 0.1)
        
        x1 = max(0, face.x - margin_x)
        y1 = max(0, face.y - margin_y)
        x2 = min(w_orig, face.x + face.w + margin_x)
        y2 = min(h_orig, face.y + face.h + margin_y)
        
        cropped_face = img[y1:y2, x1:x2]
        
        # Predict mask status
        mask_prob = classifier.predict_mask(cropped_face)
        face.mask_probability = mask_prob
        face.mask_detected = mask_prob > threshold
        
    return faces
