import numpy as np

from services.face_analysis import _quality


def test_sharp_well_lit_high_confidence_face_is_accepted():
    checkerboard = np.indices((160, 160)).sum(axis=0) % 2
    image = np.repeat((checkerboard * 255).astype(np.uint8)[:, :, None], 3, axis=2)

    result = _quality(image, 0.95)

    assert result["accepted"] is True
    assert result["reasons"] == []


def test_blurry_face_is_rejected_even_when_confidence_is_high():
    image = np.full((160, 160, 3), 127, dtype=np.uint8)

    result = _quality(image, 0.95)

    assert result["accepted"] is False
    assert "IMAGE_BLURRY" in result["reasons"]


def test_dark_face_is_rejected():
    checkerboard = np.indices((160, 160)).sum(axis=0) % 2
    image = np.repeat((checkerboard * 40).astype(np.uint8)[:, :, None], 3, axis=2)

    result = _quality(image, 0.95)

    assert result["accepted"] is False
    assert "IMAGE_TOO_DARK" in result["reasons"]


def test_bright_face_is_rejected():
    checkerboard = np.indices((160, 160)).sum(axis=0) % 2
    image = np.repeat((220 + checkerboard * 35).astype(np.uint8)[:, :, None], 3, axis=2)

    result = _quality(image, 0.95)

    assert result["accepted"] is False
    assert "IMAGE_TOO_BRIGHT" in result["reasons"]


def test_low_detection_confidence_is_rejected_at_same_threshold_as_reason():
    checkerboard = np.indices((160, 160)).sum(axis=0) % 2
    image = np.repeat((checkerboard * 255).astype(np.uint8)[:, :, None], 3, axis=2)

    result = _quality(image, 0.79)

    assert result["accepted"] is False
    assert "LOW_FACE_CONFIDENCE" in result["reasons"]


def test_accepted_result_never_contains_reject_reasons():
    checkerboard = np.indices((160, 160)).sum(axis=0) % 2
    image = np.repeat((checkerboard * 255).astype(np.uint8)[:, :, None], 3, axis=2)

    for confidence in (0.0, 0.70, 0.79, 0.80, 0.95, 1.0):
        result = _quality(image, confidence)
        assert result["accepted"] is (len(result["reasons"]) == 0)


def test_combined_low_scores_include_aggregate_quality_reason():
    image = np.zeros((160, 160, 3), dtype=np.uint8)

    result = _quality(image, 0.0)

    assert result["accepted"] is False
    assert "LOW_QUALITY_SCORE" in result["reasons"]
