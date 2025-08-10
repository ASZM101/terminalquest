const socket = new WebSocket("ws://localhost:8000/ws");
const terminal = document.getElementById("terminal")
const chat = document.getElementById("chat-message")
const terminalInput = document.getElementById("terminal-input")
const chatInput = document.getElementById("chat-input")
const nameInput = document.getElementById("name")

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
    try {
        let input = input_function(terminalInput.value)
        let data = `{"type": "input", "value": "${input}"}`
        socket.send(data)
        terminalInput.value = ""
    } catch {
        console.log("(〒▽〒) it doesn't work")
    }
}

function sendChatMessage() {
    try {
        let name = nameInput.value
        let message = input_function(chatInput.value)
        chatInput.value = ""
        let data = `{"type": "input", "value": "${input}"}`
        socket.send(data)
    } catch {}
}

function input_function(input) {
    return input.replaceAll("<img", "<!--<img-->").replaceAll()
    
}

