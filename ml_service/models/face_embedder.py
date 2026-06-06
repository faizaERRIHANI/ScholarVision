import os, numpy as np

try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError as e:
    print(f"[ArcFace] non disponible : {e}")
    INSIGHTFACE_AVAILABLE = False

class FaceEmbedder:
    def __init__(self, model_name=None, model_root=None):
        self._model = None
        self._model_loaded = False
        self._model_name = model_name or os.getenv("ARCFACE_MODEL_NAME", "buffalo_l")
        self._model_root = model_root or os.getenv("INSIGHTFACE_ROOT", "./data/insightface")
        if not INSIGHTFACE_AVAILABLE:
            print("[ArcFace] Mode dégradé activé")
            return
        self._load_model()

    def _load_model(self):
        try:
            os.makedirs(self._model_root, exist_ok=True)
            print(f"[ArcFace] Chargement : {self._model_name} (premier lancement = téléchargement ~300MB)")
            self._model = FaceAnalysis(name=self._model_name, root=self._model_root,
                                        providers=["CPUExecutionProvider"])
            self._model.prepare(ctx_id=-1, det_size=(640, 640))
            self._model_loaded = True
            print(f"[ArcFace] ✅ Modèle chargé")
        except Exception as e:
            print(f"[ArcFace] ❌ {e}")
            self._model_loaded = False

    @property
    def model_loaded(self): return self._model_loaded
    @property
    def model_name(self): return self._model_name

    def get_embedding(self, face_image_array: np.ndarray) -> np.ndarray:
        if not self._model_loaded:
            return self._mock_embedding()
        try:
            faces = self._model.get(face_image_array)
            if not faces:
                return np.zeros(512, dtype=np.float32)
            best = max(faces, key=lambda f: f.det_score)
            return best.normed_embedding.astype(np.float32)
        except Exception as e:
            print(f"[ArcFace] Erreur : {e}")
            return np.zeros(512, dtype=np.float32)

    def get_embeddings_batch(self, faces_list):
        return [self.get_embedding(f) for f in faces_list]

    def normalize_embedding(self, embedding):
        norm = np.linalg.norm(embedding)
        return embedding if norm == 0 else embedding / norm

    def embedding_to_list(self, embedding): return embedding.tolist()

    def _mock_embedding(self):
        emb = np.random.randn(512).astype(np.float32)
        return self.normalize_embedding(emb)
