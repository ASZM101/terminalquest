
# **How to use the backend api :D**

## ** /ws (WebSocket)**

This is the main WebSocket connection for the terminal and chat features.
You connect to it once, and then both sides can send and receive messages at any time.

---

### **How to Connect**

```js

const socket = new WebSocket("ws://localhost:5000/ws");

socket.onopen = () => {
  console.log("Connected to backend!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};
```

---

### **Message Format**

Every message is **JSON** and has a `type` field that tells you what it’s for.

---

### **Messages you send TO the backend**

| Type    | Description          | Example                                                         |
| ------- | -------------------- | --------------------------------------------------------------- |
| `input` | Send terminal input. | `{"type": "input", "value": "o"}`                               |
| `chat`  | Send a chat message. | `{"type": "chat", "name": "William", "message": "Hello World"}` |

---

### **Messages you get FROM the backend**

| Type      | Description                | Example                                                              |
| --------- | -------------------------- | -------------------------------------------------------------------- |
| `output`  | Terminal output.           | `{"type": "output", "value": "Output of command"}`                   |
| `message` | Chat message from someone. | `{"type": "message", "name": "William Daniel", "message": "Orph is nice!"}` |

---

**Tips when working with websockets**

* Always `JSON.parse()` incoming messages.
* Always `JSON.stringify()` when sending.
* Check `type` first to know what to do with the message.
