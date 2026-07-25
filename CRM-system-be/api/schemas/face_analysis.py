from typing import Dict, List

from pydantic import BaseModel


class FaceEmbeddings(BaseModel):
    upper: List[float]
    mid: List[float]
    lower: List[float]


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


class AnalyzedFace(BaseModel):
    embeddings: FaceEmbeddings
    expression: ExpressionResult
    quality: FaceQualityResult


class FaceAnalysisResponse(BaseModel):
    traceId: str
    modelVersion: str
    faceCount: int
    primaryFace: AnalyzedFace
