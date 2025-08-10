const socket = new WebSocket("ws://localhost:5000/ws");
const terminal = document.getElementById("terminal")
const chat = document.getElementById("chat")
const terminalInput = document.getElementById

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
            chat.innerHTML += `<p class = 'name'>${data.name}</p><p class = 'message'>${data.message}</p>`
            break;
        default:
            break;
    }
} 

function sendTerminalCommand() {
    let input = input_function(terminalInput.value)
    let data = `{"type": "input", "value": "${input}"}`
    socket.send(data)
}

function sendChatMessage() {
    
}

function input_function(input) {
    return input.replaceAll("<img", "<!--<img-->")
}

