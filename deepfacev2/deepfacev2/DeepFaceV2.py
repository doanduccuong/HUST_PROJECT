import cv2
import numpy as np
from typing import Dict, Any, List, Union

from deepfacev2.modules.detection import detect_face_and_mask
from deepfacev2.modules.alignment import align_face
from deepfacev2.modules.normalization import normalize_face
from deepfacev2.modules.representation import represent_face
from deepfacev2.modules.verification import verify_adaptive

class DeepFaceV2:
    @staticmethod
    def load_image(img_path: Union[str, np.ndarray]) -> np.ndarray:
        """Helper to load image path or return numpy array."""
        if isinstance(img_path, str):
            img = cv2.imread(img_path)
            if img is None:
                raise ValueError(f"Could not load image from '{img_path}'")
            return img
        elif isinstance(img_path, np.ndarray):
            return img_path
        else:
            raise TypeError("Image must be a path string or numpy array (BGR)")

    @staticmethod
    def verify(
        img_path: Union[str, np.ndarray],
        gallery_path: Union[str, np.ndarray],
        retinaface_model_path: str = "assets/models/retinaface.onnx",
        mask_model_path: str = "assets/models/mask_classifier.onnx",
        threshold: float = 0.65
    ) -> Dict[str, Any]:
        """
        Runs the full 5-stage adaptive face verification pipeline.
        
        Args:
            img_path: Path to target image or numpy array (BGR).
            gallery_path: Path to reference image or numpy array (BGR).
            retinaface_model_path (str): Optional path to RetinaFace ONNX weights.
            mask_model_path (str): Optional path to Mask Classifier ONNX weights.
            threshold (float): Verification match threshold.
            
        Returns:
            Dict[str, Any]: Verification result dictionary.
        """
        # Load images
        img_target = DeepFaceV2.load_image(img_path)
        img_gallery = DeepFaceV2.load_image(gallery_path)
        
        # Stage 1: DETECT
        faces_target = detect_face_and_mask(img_target, retinaface_model_path, mask_model_path)
        faces_gallery = detect_face_and_mask(img_gallery, retinaface_model_path, mask_model_path)
        
        if len(faces_target) == 0:
            raise ValueError("No face detected in the target image.")
        if len(faces_gallery) == 0:
            raise ValueError("No face detected in the reference/gallery image.")
            
        face_t = faces_target[0]
        face_g = faces_gallery[0]
        
        # Stage 2: ALIGN
        aligned_t = align_face(img_target, face_t)
        aligned_g = align_face(img_gallery, face_g)
        
        # Stage 3: NORMALIZE
        normalized_t = normalize_face(aligned_t, face_t.mask_detected)
        normalized_g = normalize_face(aligned_g, face_g.mask_detected)
        
        # Stage 4: REPRESENT
        embeddings_t = represent_face(normalized_t, face_t.landmarks, face_t.mask_detected)
        embeddings_g = represent_face(normalized_g, face_g.landmarks, face_g.mask_detected)
        
        # Stage 5: VERIFY (Using target mask status to adapt weights)
        result = verify_adaptive(embeddings_t, embeddings_g, face_t.mask_detected, threshold)
        
        # Append metadata
        result["mask_detected"] = face_t.mask_detected
        result["mask_probability"] = face_t.mask_probability
        
        # Bbox and landmarks coordinates for frontend drawing
        result["target_bbox"] = [int(face_t.x), int(face_t.y), int(face_t.x + face_t.w), int(face_t.y + face_t.h)]
        result["target_landmarks"] = [[int(pt[0]), int(pt[1])] for pt in face_t.landmarks] if face_t.landmarks else []
        result["gallery_bbox"] = [int(face_g.x), int(face_g.y), int(face_g.x + face_g.w), int(face_g.y + face_g.h)]
        result["gallery_landmarks"] = [[int(pt[0]), int(pt[1])] for pt in face_g.landmarks] if face_g.landmarks else []
        
        # Dimensions of original images so frontend can scale coordinates
        result["target_dims"] = [int(img_target.shape[1]), int(img_target.shape[0])]
        result["gallery_dims"] = [int(img_gallery.shape[1]), int(img_gallery.shape[0])]
        
        return result
