import fastapi
from fastapi import FastAPI
import threading
import socket
import asyncio
import re
from typing import Optional, Set
import json

app = FastAPI()


HOST = "worker"  # Docker service name
PORT = 9000                  # socat's TCP port

ANSI_ESCAPE_RE = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def strip_ansi(s: str) -> str:
    return ANSI_ESCAPE_RE.sub('', s)

# Globals for shared terminal
clients: Set[fastapi.WebSocket] = set()
worker_sock: Optional[socket.socket] = None
reader_thread: Optional[threading.Thread] = None
sock_lock = threading.Lock()
worker_lock = threading.Lock()
event_loop: Optional[asyncio.AbstractEventLoop] = None

def broadcast_json(payload: dict):
    global event_loop
    if not event_loop:
        return
    text = json.dumps(payload)
    # Copy to avoid mutation during iteration
    for ws in list(clients):
        try:
            asyncio.run_coroutine_threadsafe(ws.send_text(text), event_loop)
        except Exception:
            try:
                clients.discard(ws)
            except Exception:
                pass

def ensure_worker_connection():
    global worker_sock, reader_thread
    with worker_lock:
        if worker_sock is not None:
            return
        try:
            s = socket.create_connection((HOST, PORT), timeout=5)
            s.settimeout(None)
            worker_sock = s
            # Start single reader thread that broadcasts to all clients
            reader_thread = threading.Thread(target=read_from_terminal, args=(worker_sock,), daemon=True)
            reader_thread.start()
        except Exception as e:
            broadcast_json({"type": "output", "value": f"Failed to connect to worker: {e}\n"})

def read_from_terminal(sock):
    while True:
        try:
            data = sock.recv(4096)
            if not data:
                break
            msg = data.decode(errors="ignore")
            msg = strip_ansi(msg)  # keep or remove depending on your frontend
            broadcast_json({"type": "output", "value": msg})
        except Exception as e:
            broadcast_json({"type": "output", "value": f"\n[worker error] {e}\n"})
            break
    # On exit mark socket as closed
    global worker_sock
    try:
        sock.close()
    except Exception:
        pass
    worker_sock = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: fastapi.WebSocket):
    await websocket.accept()
    # Register client
    clients.add(websocket)
    global event_loop
    if event_loop is None:
        event_loop = asyncio.get_running_loop()
    # Ensure shared worker connection exists
    ensure_worker_connection()
    try:
        while True:
            data = await websocket.receive_text()
            print("FROM WEBSOCKET:", data)
            try:
                data_json = json.loads(data)
            except Exception:
                data_json = {"type": "text", "content": data}

            if data_json.get("type") == "input":
                value = data_json.get("value", "")
                try:
                    with sock_lock:
                        if worker_sock is None:
                            raise RuntimeError("worker not connected")
                        worker_sock.sendall(value.encode() + b"\n")
                except Exception as e:
                    await websocket.send_text(json.dumps({"type": "output", "value": f"[send error] {e}\n"}))
            else:
                await websocket.send_text(json.dumps({"type": "output", "value": f"echo: {data_json.get('content','')}\n"}))
    except fastapi.WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error:", e)
    finally:
        # Unregister client
        try:
            clients.discard(websocket)
        except Exception:
            pass
        # Optional: close worker when no clients remain
        if not clients and worker_sock is not None:
            try:
                with sock_lock:
                    try:
                        worker_sock.shutdown(socket.SHUT_RDWR)
                    except Exception:
                        pass
                    try:
                        worker_sock.close()
                    except Exception:
                        pass
            except Exception:
                pass


