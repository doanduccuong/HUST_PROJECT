from typing import Dict, List

from pydantic import BaseModel


class ExpressionResult(BaseModel):
    dominant: str
    confidence: float
    probabilities: Dict[str, float]


class FaceQualityResult(BaseModel):
    score: float
    blurScore: float
    brightnessScore: float
    detectionConfidence: float
    accepted: bool
    reasons: List[str]


class FaceRegion(BaseModel):
    x: int
    y: int
    width: int
    height: int


class AnalyzedFace(BaseModel):
    region: FaceRegion
    expression: ExpressionResult
    quality: FaceQualityResult


class FaceAnalysisResponse(BaseModel):
    traceId: str
    modelVersion: str
    inferenceMs: int
    faceCount: int
    primaryFace: AnalyzedFace
