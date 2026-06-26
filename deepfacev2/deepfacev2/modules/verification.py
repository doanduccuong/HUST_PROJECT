import numpy as np
from typing import Dict, Any

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """Calculates cosine similarity between two 1D vectors."""
    dot = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 > 0 and norm2 > 0:
        return float(dot / (norm1 * norm2))
    return 0.0

def verify_adaptive(
    current_embeddings: Dict[str, np.ndarray],
    gallery_embeddings: Dict[str, np.ndarray],
    mask_detected: bool,
    threshold: float = 0.65
) -> Dict[str, Any]:
    """
    Computes adaptive multi-level cosine similarities and weights them.
    
    Args:
        current_embeddings (dict): Embeddings of current face.
        gallery_embeddings (dict): Embeddings of gallery reference face.
        mask_detected (bool): Mask-wearing status.
        threshold (float): Similarity threshold for verification.
        
    Returns:
        dict: Detailed verification results and weights.
    """
    # 1. Cosine Similarities for each region
    s_upper = cosine_similarity(current_embeddings["e_upper"], gallery_embeddings["e_upper"])
    
    s_middle = 0.0
    s_lower = 0.0
    if not mask_detected:
        s_middle = cosine_similarity(current_embeddings["e_middle"], gallery_embeddings["e_middle"])
        s_lower = cosine_similarity(current_embeddings["e_lower"], gallery_embeddings["e_lower"])
        
    s_dynamic = cosine_similarity(current_embeddings["e_dynamic"], gallery_embeddings["e_dynamic"])

    # 2. Adaptive Weight Configuration
    if mask_detected:
        # Masked: only use upper face and dynamic FACS
        alpha_1 = 0.70 # Upper face weight
        alpha_2 = 0.00 # Middle face (nose) weight -> 0
        alpha_3 = 0.00 # Lower face (mouth) weight -> 0
        beta = 0.30    # Dynamic FACS weight
    else:
        # Normal unmasked: balanced weight configuration
        alpha_1 = 0.30
        alpha_2 = 0.25
        alpha_3 = 0.25
        beta = 0.20

    # 3. Decision Fusion Score
    score = (alpha_1 * s_upper) + (alpha_2 * s_middle) + (alpha_3 * s_lower) + (beta * s_dynamic)
    
    # Force float type conversion
    score = float(score)

    return {
        "verified": score >= threshold,
        "matching_score": score,
        "applied_weights": {
            "alpha_1_upper": alpha_1,
            "alpha_2_middle": alpha_2,
            "alpha_3_lower": alpha_3,
            "beta_dynamic": beta
        },
        "similarities": {
            "upper_face": s_upper,
            "middle_face": s_middle,
            "lower_face": s_lower,
            "dynamic_facs": s_dynamic
        }
    }
