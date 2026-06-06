import base64, os, time
import numpy as np
import cv2

def decode_base64_image(b64_string: str) -> np.ndarray:
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    img_bytes = base64.b64decode(b64_string.strip())
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Impossible de décoder l'image base64")
    return image

def encode_image_base64(image_array: np.ndarray, format: str = "jpeg") -> str:
    success, buffer = cv2.imencode(f".{format}", image_array)
    if not success:
        raise ValueError("Impossible d'encoder l'image")
    return base64.b64encode(buffer).decode("utf-8")

def resize_face(face_array: np.ndarray, size: tuple = (112, 112)) -> np.ndarray:
    if face_array is None or face_array.size == 0:
        raise ValueError("Face array vide")
    return cv2.resize(face_array, size, interpolation=cv2.INTER_LINEAR)

def draw_boxes(frame: np.ndarray, detections: list) -> np.ndarray:
    output = frame.copy()
    for det in detections:
        bbox = det.get("bbox", [])
        name = det.get("name", "Inconnu")
        confidence = det.get("confidence", 0.0)
        person_type = det.get("person_type", "unknown")
        if len(bbox) < 4:
            continue
        x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
        color = (0, 100, 255) if person_type == "unknown" else (0, 220, 100) if confidence >= 0.80 else (0, 165, 255)
        cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
        label = f"{name}  {confidence*100:.1f}%"
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
        cv2.rectangle(output, (x1, y1 - text_h - 10), (x1 + text_w + 8, y1), color, -1)
        cv2.putText(output, label, (x1 + 4, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
    return output

def save_face_photo(face_array: np.ndarray, person_id: str, angle: str, upload_dir: str) -> str:
    os.makedirs(upload_dir, exist_ok=True)
    person_dir = os.path.join(upload_dir, person_id)
    os.makedirs(person_dir, exist_ok=True)
    timestamp = int(time.time() * 1000)
    filepath = os.path.join(person_dir, f"{angle}_{timestamp}.jpg")
    cv2.imwrite(filepath, face_array)
    return filepath

def load_image_from_bytes(file_bytes: bytes) -> np.ndarray:
    img_array = np.frombuffer(file_bytes, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Impossible de décoder les bytes en image")
    return image

def crop_face(image: np.ndarray, bbox: list, padding: float = 0.1) -> np.ndarray:
    h, w = image.shape[:2]
    x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
    pad_x = int((x2 - x1) * padding)
    pad_y = int((y2 - y1) * padding)
    x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
    x2, y2 = min(w, x2 + pad_x), min(h, y2 + pad_y)
    return image[y1:y2, x1:x2]
