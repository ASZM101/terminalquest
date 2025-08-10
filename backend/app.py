import fastapi
from fastapi import FastAPI
import threading
import socket
import asyncio

app = FastAPI()


HOST = "worker"  # Docker service name
PORT = 9000                  # socat's TCP port

    



def read_from_terminal(sock, websocket: fastapi.WebSocket = None, loop: asyncio.AbstractEventLoop = None):
    while True:
        data = sock.recv(1024)
        if not data:
            break
        msg = data.decode(errors="ignore")
        print("FROM TERMINAL:", msg)
        if websocket and loop:
            try:
                # Schedule the async send on the FastAPI event loop
                asyncio.run_coroutine_threadsafe(websocket.send_text(msg), loop)
            except Exception as e:
                print("WebSocket error:", e)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: fastapi.WebSocket):
    await websocket.accept()

    # Start a per-connection reader that can send back to this websocket
    loop = asyncio.get_running_loop()
    threading.Thread(target=read_from_terminal, args=(s, websocket, loop), daemon=True).start()

    try:
        while True:
            data = await websocket.receive_text()
            print("FROM WEBSOCKET:", data)
            # If data is JSON, parse it
            import json
            try:
                data_json = json.loads(data)
            except Exception:
                data_json = {"type": "text", "content": data}
            if data_json["type"] == "command":
                s.sendall(data_json["content"].encode() + b"\n")
    except fastapi.WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error:", e)







