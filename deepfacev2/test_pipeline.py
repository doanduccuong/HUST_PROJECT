import os
import sys

# Add the package root directory to PYTHONPATH dynamically for local testing
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from deepfacev2 import DeepFaceV2

def run_test():
    # Paths to sample images in face_recognition_be/data/
    img1_path = "../face_recognition_be/data/unmasked_test1.jpg"
    img2_path = "../face_recognition_be/data/unmasked_test2.jpg"
    
    # Resolve absolute paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    img1_abs = os.path.abspath(os.path.join(base_dir, img1_path))
    img2_abs = os.path.abspath(os.path.join(base_dir, img2_path))
    
    print(f"Testing Face Verification...")
    print(f"Image 1: {img1_abs} (exists: {os.path.exists(img1_abs)})")
    print(f"Image 2: {img2_abs} (exists: {os.path.exists(img2_abs)})")
    
    if not os.path.exists(img1_abs) or not os.path.exists(img2_abs):
        print("Error: Test images not found. Make sure paths are correct.")
        return
        
    try:
        # Run verification using our adaptive pipeline (it will run in fallback cascade + color heuristic mode)
        result = DeepFaceV2.verify(img1_abs, img2_abs)
        
        print("\n--- PIPELINE EXECUTION SUCCESSFUL ---")
        print(f"Verified (Matched): {result['verified']}")
        print(f"Matching Fusion Score: {result['matching_score']:.4f}")
        print(f"Mask Detected: {result['mask_detected']} (Prob: {result['mask_probability']:.4f})")
        print("\nRegion Similarities:")
        for region, sim in result['similarities'].items():
            print(f" - {region}: {sim:.4f}")
            
        print("\nApplied Decision Weights:")
        for weight, val in result['applied_weights'].items():
            print(f" - {weight}: {val:.2f}")
            
    except Exception as e:
        print(f"\nPipeline failed with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
