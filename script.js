// WebSocket

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
        let input = sanitize(terminalInput.value)
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
        let message = sanitize(chatInput.value)
        chatInput.value = ""
        let data = `{"type": "input", "value": "${input}"}`
        socket.send(data)
    } catch {}
}



//https://stackoverflow.com/a/48226843
function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}// Quests

fetch('quests.json')
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})
.then(quests => {
    const index = Math.floor(Math.random() * quests.length);
    const quest = quests[index];
    document.getElementById('quest-title').innerHTML = `${quest.title}`;
    document.getElementById('quest-description').innerHTML = `${quest.description}`;
})
.catch(error => {
  console.error('Error fetching quests:', error);
});