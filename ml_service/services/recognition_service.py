import os, numpy as np
from models.face_detector import FaceDetector
from models.face_embedder import FaceEmbedder
from utils import db_utils
from utils.image_utils import resize_face, save_face_photo

class RecognitionService:
    def __init__(self, confidence_threshold=None, upload_dir=None):
        self.confidence_threshold = confidence_threshold or float(os.getenv("ML_CONFIDENCE_THRESHOLD", "0.75"))
        self.upload_dir = upload_dir or os.getenv("UPLOAD_DIR", "./data/uploads")
        self.detector = FaceDetector(confidence_threshold=0.5)
        self.embedder = FaceEmbedder()
        print(f"[RecognitionService] ✅ Seuil={self.confidence_threshold}")

    def recognize_face(self, image_array: np.ndarray) -> dict:
        detections = self.detector.detect_faces(image_array)
        if not detections:
            return {"found": False, "person_id": None, "person_type": "unknown",
                    "person_name": "Aucun visage", "confidence": 0.0, "bbox": None}
        best = max(detections, key=lambda d: (d["bbox"][2]-d["bbox"][0])*(d["bbox"][3]-d["bbox"][1]))
        return self._identify_face(best["face_crop"], best["bbox"])

    def process_camera_frame(self, frame: np.ndarray) -> list:
        return [self._identify_face(d["face_crop"], d["bbox"]) for d in self.detector.detect_from_frame(frame)]

    def _identify_face(self, face_crop, bbox):
        try:
            face_resized = resize_face(face_crop)
            embedding = self.embedder.get_embedding(face_resized)
            if np.all(embedding == 0):
                return self._unknown(bbox, "Embedding vide")
            matches = db_utils.search_nearest(embedding.tolist(), self.confidence_threshold)
            if matches:
                m = matches[0]
                return {"found": True, "person_id": m["person_id"], "person_type": m["person_type"],
                        "person_name": "", "confidence": float(m["confidence"]), "bbox": bbox}
            return self._unknown(bbox, "Aucune correspondance")
        except Exception as e:
            return self._unknown(bbox, str(e))

    def _unknown(self, bbox, reason=""):
        return {"found": False, "person_id": None, "person_type": "unknown",
                "person_name": "Inconnu", "confidence": 0.0, "bbox": bbox, "reason": reason}

    def enroll_person(self, person_id, person_type, photos_list, angles=None):
        if not photos_list:
            return {"success": False, "embeddings_stored": 0, "message": "Aucune photo"}
        if angles is None:
            angles = ["face"] * len(photos_list)
        stored, errors = 0, []
        for i, (photo, angle) in enumerate(zip(photos_list, angles)):
            try:
                dets = self.detector.detect_faces(photo)
                if not dets: errors.append(f"Photo {i+1}: aucun visage"); continue
                face = max(dets, key=lambda d: d["confidence"])["face_crop"]
                photo_url = save_face_photo(face, person_id, angle, self.upload_dir)
                emb = self.embedder.get_embedding(resize_face(face))
                if np.all(emb == 0): errors.append(f"Photo {i+1}: embedding vide"); continue
                if db_utils.store_embedding(person_id, person_type, emb.tolist(), photo_url, angle):
                    stored += 1
            except Exception as e:
                errors.append(f"Photo {i+1}: {e}")
        total = db_utils.count_embeddings(person_id)
        msg = f"{stored}/{len(photos_list)} embeddings stockés"
        if errors: msg += f" | {'; '.join(errors)}"
        return {"success": stored > 0, "embeddings_stored": stored, "total_for_person": total, "message": msg}

    def delete_person_embeddings(self, person_id): return db_utils.delete_embeddings(person_id)

    def get_status(self):
        return {"yolo_loaded": self.detector.model_loaded, "yolo_version": self.detector.model_version,
                "arcface_loaded": self.embedder.model_loaded, "arcface_model": self.embedder.model_name,
                "db_connected": db_utils.test_connection(), "confidence_threshold": self.confidence_threshold}
