import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple, Union

# Seeded random projection matrix for deterministic mock embeddings
# Projects 256 grayscale pixel values to 512-dimensional embedding space
np.random.seed(42)
_PROJECTION_MATRIX = np.random.normal(0.0, 1.0, (256, 512))

def _generate_mock_embedding(region_img: np.ndarray) -> np.ndarray:
    """
    Generates a deterministic 512-D unit vector from an image region.
    Guarantees that identical images produce identical vectors, and similar images
    produce highly correlated vectors, making mock verification realistic.
    """
    # Downsample to 16x16 and convert to grayscale
    resized = cv2.resize(region_img, (16, 16), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    
    # Flatten and normalize to [0, 1]
    flat = gray.flatten().astype(np.float32) / 255.0
    
    # Project to 512 dimensions
    proj = np.dot(flat, _PROJECTION_MATRIX)
    
    # L2 Normalization
    norm = np.linalg.norm(proj)
    if norm > 0:
        proj = proj / norm
    return proj

def represent_face(
    face_img: np.ndarray,
    landmarks: Optional[List[Tuple[int, int]]] = None,
    mask_detected: bool = False
) -> Dict[str, np.ndarray]:
    """
    Extracts static region embeddings and dynamic FACS features.
    
    Args:
        face_img (np.ndarray): Normalized face image (BGR, 224x224).
        landmarks (list): 5 facial landmark points.
        mask_detected (bool): Whether a mask is worn (skips middle and lower regions if True).
        
    Returns:
        Dict[str, np.ndarray]: Dictionary containing region embeddings and FACS features.
    """
    h, w, _ = face_img.shape
    
    # 1. Slice Static Multi-regions
    # Upper Face: Forehead and eyes (top 35%)
    upper_region = face_img[0:int(h * 0.35), :]
    e_upper = _generate_mock_embedding(upper_region)
    
    e_middle = np.zeros(512, dtype=np.float32)
    e_lower = np.zeros(512, dtype=np.float32)
    
    if not mask_detected:
        # Middle Face: Nose and upper cheeks (35% to 65%)
        middle_region = face_img[int(h * 0.35):int(h * 0.65), :]
        e_middle = _generate_mock_embedding(middle_region)
        
        # Lower Face: Mouth and chin (bottom 35%)
        lower_region = face_img[int(h * 0.65):h, :]
        e_lower = _generate_mock_embedding(lower_region)

    # 2. Extract Dynamic FACS (Facial Action Coding System) Features
    # Using eye/mouth distance ratio as simple facial expression indicators
    e_dynamic = np.zeros(128, dtype=np.float32)
    
    if landmarks and len(landmarks) >= 5:
        # Left eye (0), right eye (1), nose (2), mouth left (3), mouth right (4)
        le, re, nose, ml, mr = landmarks[0], landmarks[1], landmarks[2], landmarks[3], landmarks[4]
        
        # Eye width
        eye_dist = np.sqrt((re[0] - le[0])**2 + (re[1] - le[1])**2)
        # Mouth width
        mouth_width = np.sqrt((mr[0] - ml[0])**2 + (mr[1] - ml[1])**2)
        # Nose to mouth height
        nose_mouth_dist = np.sqrt(((ml[0]+mr[0])/2.0 - nose[0])**2 + ((ml[1]+mr[1])/2.0 - nose[1])**2)
        
        # Ratios (independent of face distance)
        mouth_ratio = mouth_width / eye_dist if eye_dist > 0 else 1.0
        exp_ratio = nose_mouth_dist / eye_dist if eye_dist > 0 else 1.0
        
        # Populate dynamic embedding
        e_dynamic[0] = float(mouth_ratio)
        e_dynamic[1] = float(exp_ratio)
        
        # Add a deterministic random projection to fill up the 128 vector
        np.random.seed(int(mouth_ratio * 1000) % 1000)
        e_dynamic[2:] = np.random.normal(0.0, 0.1, 126)
        
        # L2 normalize e_dynamic
        norm = np.linalg.norm(e_dynamic)
        if norm > 0:
            e_dynamic = e_dynamic / norm
            
    return {
        "e_upper": e_upper,
        "e_middle": e_middle,
        "e_lower": e_lower,
        "e_dynamic": e_dynamic
    }
