import logging
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import verify_access_token

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}
    async def connect(self, ws: WebSocket, uid: str):
        await ws.accept()
        self.active.setdefault(uid, []).append(ws)
    def disconnect(self, ws: WebSocket, uid: str):
        if uid in self.active:
            try: self.active[uid].remove(ws)
            except ValueError: pass
            if not self.active[uid]: del self.active[uid]
    async def broadcast_all(self, message: str):
        for conns in list(self.active.values()):
            for ws in conns[:]:
                try: await ws.send_text(message)
                except Exception: pass
    async def send_personal(self, message: str, uid: str):
        for ws in self.active.get(uid, [])[:]:
            try: await ws.send_text(message)
            except Exception: pass

manager = ConnectionManager()

@router.websocket("/ws/attendance")
async def ws_attendance(ws: WebSocket, token: str = Query(...)):
    payload = verify_access_token(token)
    if not payload: await ws.close(code=4001); return
    uid = payload.get("sub")
    await manager.connect(ws, uid)
    try:
        while True:
            data = await ws.receive_text()
            if data == "ping": await ws.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(ws, uid)

@router.websocket("/ws/notifications")
async def ws_notifications(ws: WebSocket, token: str = Query(...)):
    payload = verify_access_token(token)
    if not payload: await ws.close(code=4001); return
    uid = payload.get("sub")
    await manager.connect(ws, uid)
    try:
        while True:
            data = await ws.receive_text()
            if data == "ping": await ws.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(ws, uid)
