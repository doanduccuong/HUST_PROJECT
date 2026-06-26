import cv2
import numpy as np
from typing import Any, List, Optional, Tuple
from deepfacev2.models.Detector import FacialAreaRegion

def align_face(
    img: np.ndarray,
    facial_area: FacialAreaRegion,
    target_size: Tuple[int, int] = (224, 224)
) -> np.ndarray:
    """
    Aligns and crops the face based on mask detection status.
    
    Args:
        img (np.ndarray): Input image in BGR format.
        facial_area (FacialAreaRegion): Metadata containing landmarks and mask probability.
        target_size (tuple): Width and height of the aligned output image.
        
    Returns:
        np.ndarray: Aligned and cropped face image.
    """
    if img is None or img.size == 0:
        return img
        
    left_eye = facial_area.left_eye
    right_eye = facial_area.right_eye
    mask_detected = facial_area.mask_detected
    
    # Fallback to standard crop if eyes are not found
    if left_eye is None or right_eye is None:
        x, y, w, h = facial_area.x, facial_area.y, facial_area.w, facial_area.h
        h_orig, w_orig, _ = img.shape
        x1 = max(0, x)
        y1 = max(0, y)
        x2 = min(w_orig, x + w)
        y2 = min(h_orig, y + h)
        cropped = img[y1:y2, x1:x2]
        if cropped.size > 0:
            return cv2.resize(cropped, target_size, interpolation=cv2.INTER_LINEAR)
        return np.zeros((target_size[1], target_size[0], 3), dtype=np.uint8)

    # 1. Normal Mode / Default Alignment: Eye-based Affine Transform
    # We calculate the angle between the eyes to rotate the face straight
    left_eye_x, left_eye_y = left_eye
    right_eye_x, right_eye_y = right_eye
    
    d_y = right_eye_y - left_eye_y
    d_x = right_eye_x - left_eye_x
    angle = np.degrees(np.arctan2(d_y, d_x))
    
    # In case of mirror or flipped eye coordinates, ensure rotation is reasonable
    if angle > 90:
        angle -= 180
    elif angle < -90:
        angle += 180

    # Center is the midpoint between the eyes
    eye_center = (float((left_eye_x + right_eye_x) / 2.0), float((left_eye_y + right_eye_y) / 2.0))
    
    # Compute rotation matrix
    M = cv2.getRotationMatrix2D(eye_center, angle, scale=1.0)
    
    # Rotate the original image
    h_img, w_img, _ = img.shape
    rotated_img = cv2.warpAffine(img, M, (w_img, h_img), flags=cv2.INTER_CUBIC)
    
    # Crop the aligned face region from the rotated image
    # We estimate a box around the eye center
    box_w = int(facial_area.w * 1.2)
    box_h = int(facial_area.h * 1.2)
    
    # Refined coordinates centered around eye_center
    x1 = int(eye_center[0] - box_w * 0.5)
    y1 = int(eye_center[1] - box_h * 0.4) # Eyes are usually at 40% height of face box
    
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(w_img, x1 + box_w)
    y2 = min(h_img, y1 + box_h)
    
    cropped_aligned = rotated_img[y1:y2, x1:x2]
    if cropped_aligned.size > 0:
        return cv2.resize(cropped_aligned, target_size, interpolation=cv2.INTER_LINEAR)
        
    return np.zeros((target_size[1], target_size[0], 3), dtype=np.uint8)

def weighted_procrustes_alignment(
    img: np.ndarray,
    landmarks: np.ndarray, # Shape [N, 2] (e.g., 468 landmarks)
    ref_landmarks: np.ndarray, # Shape [N, 2]
    weights: np.ndarray, # Shape [N] (e.g., 0 for masked regions, 1 for eyes/forehead)
    target_size: Tuple[int, int] = (224, 224)
) -> np.ndarray:
    """
    Performs Weighted Procrustes Alignment using SVD to align points
    under partial occlusion (like face mask covering mouth/nose).
    """
    # Ensure weights are normalized
    w = weights / np.sum(weights)
    w = w[:, np.newaxis] # Shape [N, 1]
    
    # 1. Weighted Centroids
    c_l = np.sum(landmarks * w, axis=0)
    c_r = np.sum(ref_landmarks * w, axis=0)
    
    # 2. Translate points to centroid origins
    l_prime = landmarks - c_l
    r_prime = ref_landmarks - c_r
    
    # 3. Covariance Matrix H = L^T * W * R
    H = np.dot((l_prime * w).T, r_prime)
    
    # 4. SVD of H
    U, S, Vt = np.linalg.svd(H)
    
    # 5. Rotation Matrix R = V * U^T
    R = np.dot(Vt.T, U.T)
    
    # Special reflection check
    if np.linalg.det(R) < 0:
        Vt[-1, :] *= -1
        R = np.dot(Vt.T, U.T)
        
    # 6. Estimate scale factor
    var_l = np.sum(w * np.sum(l_prime**2, axis=1, keepdims=True))
    s = np.sum(S) / var_l if var_l > 0 else 1.0
    
    # 7. Affine transformation matrix
    # T = s * R, translation = c_r - T * c_l
    T = s * R
    translation = c_r - np.dot(T, c_l)
    
    M = np.hstack([T, translation[:, np.newaxis]])
    
    h_img, w_img, _ = img.shape
    aligned_img = cv2.warpAffine(img, M, target_size, flags=cv2.INTER_CUBIC)
    return aligned_img
