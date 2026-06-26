from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, List, Optional, Tuple
from numpy.typing import NDArray

class Detector(ABC):
    @abstractmethod
    def detect_faces(self, img: NDArray[Any]) -> List["FacialAreaRegion"]:
        """
        Interface to detect and align faces.
        
        Args:
            img (np.ndarray): Image as numpy array (BGR format)
            
        Returns:
            List[FacialAreaRegion]: A list of detected facial areas and landmarks.
        """
        pass

@dataclass
class FacialAreaRegion:
    """
    Metadata representation of a detected facial area.
    
    Attributes:
        x (int): Top-left x coordinate.
        y (int): Top-left y coordinate.
        w (int): Width.
        h (int): Height.
        left_eye (tuple): (x, y) coordinates of the left eye.
        right_eye (tuple): (x, y) coordinates of the right eye.
        nose (tuple): (x, y) coordinates of the nose tip.
        mouth_left (tuple): (x, y) coordinates of the left mouth corner.
        mouth_right (tuple): (x, y) coordinates of the right mouth corner.
        confidence (float): Bounding box detection confidence score.
        landmarks (list): 5 landmarks coordinates [(x1,y1), ..., (x5,y5)].
        mask_detected (bool): True if wearing a mask.
        mask_probability (float): Mask prediction probability.
    """
    x: int
    y: int
    w: int
    h: int
    left_eye: Optional[Tuple[int, int]] = None
    right_eye: Optional[Tuple[int, int]] = None
    nose: Optional[Tuple[int, int]] = None
    mouth_left: Optional[Tuple[int, int]] = None
    mouth_right: Optional[Tuple[int, int]] = None
    confidence: Optional[float] = None
    landmarks: Optional[List[Tuple[int, int]]] = None
    mask_detected: Optional[bool] = None
    mask_probability: Optional[float] = None

@dataclass
class DetectedFace:
    img: NDArray[Any]
    facial_area: FacialAreaRegion
    confidence: float
