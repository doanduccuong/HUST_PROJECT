# End-to-end detector + FER benchmark

Decision: **opencv + CNN FER 7-class**

> opencv + CNN FER 7-class satisfies all gates and has the highest Macro-F1 (0.3328) among eligible end-to-end runs.

| Combination | Detection Rate | Macro-F1 | Accuracy | No Result Rate | p95 (ms) | Eligible | Selected |
|---|---:|---:|---:|---:|---:|---|---|
| opencv + CNN FER 7-class | 1.0000 | 0.3328 | 0.6099 | 0.0000 | 29.27 | True | True |
| mtcnn + CNN FER 7-class | 1.0000 | 0.2867 | 0.5714 | 0.0000 | 361.02 | True | False |
| retinaface + CNN FER 7-class | 1.0000 | 0.3249 | 0.5714 | 0.0000 | 1126.42 | True | False |
