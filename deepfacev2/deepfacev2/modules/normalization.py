import cv2
import numpy as np

def normalize_face(
    face_img: np.ndarray,
    mask_detected: bool = False
) -> np.ndarray:
    """
    Applies lighting normalization and skin smoothing.
    
    Args:
        face_img (np.ndarray): Cropped and aligned face image (BGR format).
        mask_detected (bool): Whether the face has a mask (affects skin smoothing region).
        
    Returns:
        np.ndarray: Normalized and smoothed face image.
    """
    if face_img is None or face_img.size == 0:
        return face_img

    # 1. Illumination Normalization using LAB CLAHE
    # Convert from BGR to LAB color space
    lab = cv2.cvtColor(face_img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to the L channel (lightness)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    
    # Merge channels and convert back to BGR
    limg = cv2.merge((cl, a, b))
    illum_normalized = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    # 2. Skin Smoothing using Bilateral Filter
    # Bilateral filtering preserves edges while smoothing flat skin regions
    # d=9 (pixel diameter), sigmaColor=75 (color similarity), sigmaSpace=75 (coordinate distance)
    smoothed = cv2.bilateralFilter(illum_normalized, d=9, sigmaColor=75, sigmaSpace=75)
    
    if mask_detected:
        # If mask is detected, we can optionally mask out the lower face so we only smooth 
        # actual exposed skin (forehead and eyes) and keep the surgical mask texture crisp.
        # However, bilateral filtering naturally keeps mask borders sharp, so a full filter is 
        # also safe. Let's merge them nicely.
        h, w, _ = face_img.shape
        # Create a mask where top 60% (eyes/forehead) is smoothed, and bottom 40% (mask) is unchanged
        blend_mask = np.zeros((h, w, 1), dtype=np.float32)
        blend_mask[:int(h * 0.6), :] = 1.0
        
        # Soft transition border
        cv2.GaussianBlur(blend_mask, (15, 15), 0, dst=blend_mask)
        blend_mask = blend_mask[:, :, np.newaxis] if len(blend_mask.shape) == 2 else blend_mask
        
        normalized = (smoothed * blend_mask + illum_normalized * (1.0 - blend_mask)).astype(np.uint8)
        return normalized

    return smoothed
