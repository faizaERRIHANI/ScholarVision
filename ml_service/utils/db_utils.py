import os, uuid
import psycopg2, psycopg2.extras
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://scolaire:scolaire123@localhost:5432/gestion_scolaire")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def store_embedding(person_id, person_type, embedding, photo_url, angle, model_version="arcface_buffalo_l", confidence=1.0):
    try:
        conn = get_connection()
        cur = conn.cursor()
        embedding_str = "[" + ",".join(map(str, embedding)) + "]"
        cur.execute("""
            INSERT INTO face_embeddings (id, person_id, person_type, photo_url, angle, embedding, model_version, confidence, is_active)
            VALUES (%s, %s, %s, %s, %s, %s::vector, %s, %s, TRUE)
        """, (str(uuid.uuid4()), person_id, person_type, photo_url, angle, embedding_str, model_version, confidence))
        conn.commit(); cur.close(); conn.close()
        return True
    except Exception as e:
        print(f"[DB] Erreur store_embedding : {e}")
        return False

def search_nearest(query_embedding, threshold=0.75, limit=1):
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        max_distance = 1.0 - threshold
        cur.execute("""
            SELECT id, person_id, person_type, photo_url, angle, confidence,
                   (embedding <=> %s::vector) AS distance
            FROM face_embeddings WHERE is_active = TRUE
            ORDER BY distance ASC LIMIT %s
        """, (embedding_str, limit))
        rows = cur.fetchall(); cur.close(); conn.close()
        results = []
        for row in rows:
            dist = float(row["distance"])
            if dist <= max_distance:
                results.append({
                    "person_id": str(row["person_id"]),
                    "person_type": row["person_type"],
                    "distance": dist,
                    "confidence": 1.0 - dist
                })
        return results
    except Exception as e:
        print(f"[DB] Erreur search_nearest : {e}")
        return []

def delete_embeddings(person_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE face_embeddings SET is_active = FALSE WHERE person_id = %s", (person_id,))
        conn.commit(); cur.close(); conn.close()
        return True
    except Exception as e:
        print(f"[DB] Erreur delete_embeddings : {e}")
        return False

def count_embeddings(person_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM face_embeddings WHERE person_id = %s AND is_active = TRUE", (person_id,))
        count = cur.fetchone()[0]; cur.close(); conn.close()
        return int(count)
    except Exception as e:
        return 0

def get_all_persons():
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT person_id, person_type, COUNT(*) as photo_count, MAX(created_at) as last_enrolled
            FROM face_embeddings WHERE is_active = TRUE
            GROUP BY person_id, person_type ORDER BY last_enrolled DESC
        """)
        rows = cur.fetchall(); cur.close(); conn.close()
        return [{"person_id": str(r["person_id"]), "person_type": r["person_type"],
                 "photo_count": r["photo_count"]} for r in rows]
    except Exception as e:
        print(f"[DB] Erreur get_all_persons : {e}")
        return []

def test_connection():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1"); cur.close(); conn.close()
        return True
    except:
        return False
