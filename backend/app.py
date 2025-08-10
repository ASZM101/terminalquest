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

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: fastapi.WebSocket):
    await websocket.accept()
    try:
        sock = socket.create_connection((HOST, PORT), timeout=5)
        sock.settimeout(None)  
    except Exception as e:
        await websocket.send_text(f"Failed to connect to worker: {e}")
        await websocket.close()
        return


    loop = asyncio.get_running_loop()
    reader = threading.Thread(target=read_from_terminal, args=(sock, websocket, loop), daemon=True)
    reader.start()

    try:
        while True:
            data = await websocket.receive_text()
            print("FROM WEBSOCKET:", data)
            
            import json
            try:
                data_json = json.loads(data)
            except Exception:
                data_json = {"type": "text", "content": data}

            if data_json["type"] == "command":
                try:
                    sock.sendall(data_json["content"].encode() + b"\n")
                except Exception as e:
                    await websocket.send_text(f"Worker send error: {e}")
            else:
                
                await websocket.send_text(f"echo: {data_json.get('content', data)}")
    except fastapi.WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error:", e)
    finally:
        try:
            sock.shutdown(socket.SHUT_RDWR)
        except Exception:
            pass
        try:
            sock.close()
        except Exception:
            pass







