const socket = new WebSocket("ws://10.226.128.177:8000/ws");
const terminalText = document.getElementById("terminal-text");
const chat = document.getElementById("chat-message");
const terminalInput = document.getElementById("terminal-input");
const chatInput = document.getElementById("chat-input");
const nameInput = document.getElementById("name");

socket.onopen = () => {
  console.log("Connected to backend!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  parseRequest(data);
};

// Append safely without rewriting the input DOM
function appendTerminalLine(text) {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.textContent = text ?? "";
  terminalText.appendChild(line);
  terminalText.scrollTop = terminalText.scrollHeight;
}

function appendChatMessage(name, message) {
  const nameEl = document.createElement("p");
  nameEl.className = "name";
  nameEl.textContent = name ?? "Anonymous";

  const msgEl = document.createElement("p");
  msgEl.className = "message";
  msgEl.textContent = message ?? "";

  chat.append(nameEl, msgEl);
}

function parseRequest(data) {
  switch (data.type) {
    case "output":
      appendTerminalLine(data.value);
      break;
    case "message":
      appendChatMessage(data.name, data.message);
      break;
    default:
      break;
  }
}

// :)
function sendTerminalCommand() {
  try {
    console.log("Input value:", terminalInput.value); // Debug
    const input = sanitize(terminalInput.value);
    console.log("Sanitized input:", input); // Debug
    const payload = { type: "input", value: input };
    socket.send(JSON.stringify(payload));
    terminalInput.value = "";
  } catch (err) {
    console.error("Error:", err); // Better error logging
    console.log("(〒▽〒) it doesn't work");
  }
}

function sendChatMessage() {
  try {
    const name = nameInput.value;
    const message = sanitize(chatInput.value);
    chatInput.value = "";
    const payload = { type: "input", message, name }; // keep type if backend expects it
    socket.send(JSON.stringify(payload));
  } catch {}
}

//https://stackoverflow.com/a/48226843
function sanitize(string) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  const reg = /[&<>"'/]/gi;
  return String(string).replace(reg, (match) => map[match]);
}

// Quests
function nextQuest() {
  fetch("quests.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((quests) => {
      const index = Math.floor(Math.random() * quests.length);
      const quest = quests[index];
      document.getElementById("quest-title").textContent = `${quest.title}`;
      document.getElementById("quest-description").textContent = `${quest.description}`;
    })
    .catch((error) => {
      console.error("Error fetching quests:", error);
    });
}
nextQuest();

// Optional: submit on Enter
terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendTerminalCommand();
});