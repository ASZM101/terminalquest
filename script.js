const socket = new WebSocket("ws://localhost:5000/ws");

socket.onopen = () => {
  console.log("Connected to backend!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  parseRequest(data)
};

function parseRequest(data) {
    switch (data.type) {
        case "output":
            break;
        case "message":
            break;
        default:
            break;
    }
}