# DeepFaceV2

DeepFaceV2 is an adaptive 5-stage face analysis and verification Python library designed for beauty clinics and medical spas. It dynamically adapts its alignment, preprocessing, and representation algorithms based on whether the customer is wearing a face mask.

## 5-Stage Pipeline Architecture

1. **DETECT**: RetinaFace (face bounding boxes and landmarks) + MobileNetV2 Mask Classifier.
2. **ALIGN**: Dynamic rotation alignment (using standard Affine transform or Weighted Procrustes on 468 MediaPipe landmarks for masked faces).
3. **NORMALIZE**: Light normalization using LAB CLAHE + skin denoising using Bilateral Filtering.
4. **REPRESENT**: Multi-region static face embeddings (upper, middle, lower) + dynamic facial expression (FACS) features.
5. **VERIFY**: Multilevel verification decision using an Adaptive Decision Fusion Classifier.

## Installation

Install in development mode:
```bash
cd deepfacev2
pip install -e .
```

## Basic Usage

```python
from deepfacev2 import DeepFaceV2

# Run full adaptive verification
result = DeepFaceV2.verify(
    img_path="live_frame.jpg",
    gallery_path="registered_photo.jpg"
)

print("Verified:", result["verified"])
print("Match Score:", result["matching_score"])
print("Is Wearing Mask:", result["mask_detected"])
```
