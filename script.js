const socket = new WebSocket("ws://localhost:5000/ws");

socket.onopen = () => {
  console.log("Connected to backend!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};