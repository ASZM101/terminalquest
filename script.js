const socket = new WebSocket("ws://localhost:5000/ws");
const terminal = document.getElementById("terminal")

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
            terminal.innerHTML += "<br />" + data.value
            break;
        case "message":
            break;
        default:
            break;
    }
}