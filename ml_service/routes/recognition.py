import os, time, requests
from flask import Blueprint, request, jsonify, current_app
from utils.image_utils import decode_base64_image, load_image_from_bytes, encode_image_base64, draw_boxes
from utils import db_utils

recognition_bp = Blueprint("recognition", __name__)

def get_service():
    return current_app.config["RECOGNITION_SERVICE"]

@recognition_bp.route("/recognize", methods=["POST"])
def recognize():
    start = time.time()
    service = get_service()
    try:
        image = _get_image_from_request()
        results = service.process_camera_frame(image)
        unknown_count = sum(1 for r in results if not r["found"])
        return jsonify({
            "recognized": results,
            "total_faces": len(results),
            "unknown_count": unknown_count,
            "processing_time_ms": round((time.time() - start) * 1000, 2)
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"[/recognize] {e}")
        return jsonify({"error": "Erreur interne"}), 500

@recognition_bp.route("/recognize-frame", methods=["POST"])
def recognize_frame():
    start = time.time()
    service = get_service()
    data = request.get_json()
    if not data or "frame" not in data:
        return jsonify({"error": "Champ 'frame' manquant"}), 400
    try:
        image = decode_base64_image(data["frame"])
        results = service.process_camera_frame(image)
        annotated_frame = None
        if data.get("return_annotated", False):
            annotated = draw_boxes(image, [
                {**r, "name": r.get("person_name") or ("Inconnu" if not r["found"] else r["person_id"][:8])}
                for r in results
            ])
            annotated_frame = encode_image_base64(annotated)
        response = {
            "recognized": results,
            "total_faces": len(results),
            "unknown_count": sum(1 for r in results if not r["found"]),
            "processing_time_ms": round((time.time() - start) * 1000, 2)
        }
        if annotated_frame:
            response["annotated_frame"] = annotated_frame
        return jsonify(response)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recognition_bp.route("/enroll", methods=["POST"])
def enroll():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Corps JSON manquant"}), 400
    person_id = data.get("person_id")
    person_type = data.get("person_type")
    if not person_id or not person_type:
        return jsonify({"error": "person_id et person_type requis"}), 400
    if person_type not in ("student", "staff"):
        return jsonify({"error": "person_type doit être 'student' ou 'staff'"}), 400
    existing = db_utils.count_embeddings(person_id)
    return jsonify({"success": True, "person_id": person_id,
                    "person_type": person_type, "existing_photos": existing})

@recognition_bp.route("/enroll-photos", methods=["POST"])
def enroll_photos():
    service = get_service()
    person_id = request.form.get("person_id")
    person_type = request.form.get("person_type", "student")
    angle = request.form.get("angle", "face")
    if not person_id:
        return jsonify({"error": "person_id requis"}), 400
    files = request.files.getlist("photos") or ([request.files.get("photo")] if request.files.get("photo") else [])
    if not files:
        return jsonify({"error": "Aucune photo fournie"}), 400
    photos, angles_list = [], []
    for i, file in enumerate(files[:5]):
        try:
            photos.append(load_image_from_bytes(file.read()))
            angles_list.append(angle if i == 0 else f"{angle}_{i}")
        except Exception as e:
            return jsonify({"error": f"Erreur photo {i+1}: {e}"}), 400
    result = service.enroll_person(person_id, person_type, photos, angles_list)
    return jsonify({"success": result["success"], "embeddings_added": result["embeddings_stored"],
                    "total_for_person": result.get("total_for_person", 0),
                    "message": result["message"]}), 200 if result["success"] else 422

@recognition_bp.route("/persons/<person_id>", methods=["DELETE"])
def delete_person(person_id):
    service = get_service()
    success = service.delete_person_embeddings(person_id)
    if success:
        return jsonify({"success": True, "message": f"Embeddings de {person_id} supprimés"})
    return jsonify({"success": False, "message": "Erreur suppression"}), 500

@recognition_bp.route("/persons", methods=["GET"])
def list_persons():
    persons = db_utils.get_all_persons()
    return jsonify({"persons": persons, "total": len(persons)})

@recognition_bp.route("/batch-attendance", methods=["POST"])
def batch_attendance():
    data = request.get_json()
    if not data or "detections" not in data:
        return jsonify({"error": "Champ 'detections' manquant"}), 400
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
    api_key = os.getenv("BACKEND_API_KEY", "")
    results = []
    for det in data["detections"]:
        if not det.get("person_id"): continue
        try:
            resp = requests.post(f"{backend_url}/api/attendance/facial",
                json={"person_id": det["person_id"], "person_type": det["person_type"],
                      "confidence_score": det.get("confidence", 0),
                      "detection_method": "facial"},
                headers={"X-ML-API-Key": api_key}, timeout=5)
            results.append({"person_id": det["person_id"],
                            "status": "ok" if resp.status_code == 200 else "error"})
        except Exception as e:
            results.append({"person_id": det["person_id"], "status": "error", "message": str(e)})
    return jsonify({"processed": len(results), "results": results})

def _get_image_from_request():
    content_type = request.content_type or ""
    if "multipart" in content_type:
        file = request.files.get("image")
        if not file: raise ValueError("Champ 'image' manquant")
        return load_image_from_bytes(file.read())
    elif "application/json" in content_type:
        data = request.get_json()
        if not data or "image" not in data: raise ValueError("Champ 'image' base64 manquant")
        return decode_base64_image(data["image"])
    else:
        img_bytes = request.data
        if img_bytes: return load_image_from_bytes(img_bytes)
        raise ValueError("Format de requête non supporté")
