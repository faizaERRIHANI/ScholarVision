import os, numpy as np
from pathlib import Path

try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError as e:
    print(f"[YOLO] non disponible : {e}")
    ULTRALYTICS_AVAILABLE = False

class FaceDetector:
    FACE_MODEL_URL = "https://github.com/akanametov/yolo-face/releases/download/v0.0.0/yolov8n-face.pt"

    def __init__(self, model_path=None, confidence_threshold=0.5):
        self._model = None
        self._model_loaded = False
        self._model_version = "yolov8n-face"
        self._confidence = confidence_threshold
        if not ULTRALYTICS_AVAILABLE:
            return
        if model_path is None:
            model_path = os.getenv("YOLO_MODEL_PATH", "./data/yolov8n-face.pt")
        self._load_model(model_path)

    def _load_model(self, model_path):
        try:
            if not os.path.exists(model_path):
                print(f"[YOLO] Téléchargement de yolov8n-face.pt...")
                os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
                import urllib.request
                urllib.request.urlretrieve(self.FACE_MODEL_URL, model_path)
            self._model = YOLO(model_path)
            self._model_loaded = True
            self._model_version = Path(model_path).stem
            print(f"[YOLO] ✅ Modèle chargé : {self._model_version}")
        except Exception as e:
            print(f"[YOLO] ❌ {e} — tentative fallback yolov8n.pt")
            try:
                self._model = YOLO("yolov8n.pt")
                self._model_loaded = True
                self._model_version = "yolov8n-fallback"
            except:
                self._model_loaded = False

    @property
    def model_loaded(self): return self._model_loaded
    @property
    def model_version(self): return self._model_version

    def detect_faces(self, image_array: np.ndarray) -> list:
        if not self._model_loaded:
            return self._mock_detection(image_array)
        try:
            results = self._model(image_array, conf=self._confidence, verbose=False)
            detections = []
            for result in results:
                if result.boxes is None: continue
                for box in result.boxes:
                    if "fallback" in self._model_version and int(box.cls[0]) != 0: continue
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    x1, y1 = max(0, int(x1)), max(0, int(y1))
                    x2, y2 = min(image_array.shape[1], int(x2)), min(image_array.shape[0], int(y2))
                    face_crop = image_array[y1:y2, x1:x2]
                    if face_crop.size == 0: continue
                    detections.append({"bbox": [x1,y1,x2,y2], "confidence": float(box.conf[0]), "face_crop": face_crop})
            return detections
        except Exception as e:
            print(f"[YOLO] Erreur : {e}")
            return []

    def detect_from_frame(self, frame): return self.detect_faces(frame)
    def detect_from_file(self, file_path):
        import cv2
        image = cv2.imread(file_path)
        if image is None: raise FileNotFoundError(f"Image introuvable : {file_path}")
        return self.detect_faces(image)

    def _mock_detection(self, image_array):
        h, w = image_array.shape[:2]
        cx, cy = w//2, h//2
        size = min(w,h)//3
        return [{"bbox": [cx-size, cy-size, cx+size, cy+size], "confidence": 0.91,
                 "face_crop": image_array[max(0,cy-size):cy+size, max(0,cx-size):cx+size]}]
