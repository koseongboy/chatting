const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Browser");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.appendChild(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from the server");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.appendChild(li);
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    const currentName = document.createElement("h3");
    currentName.innerText = `Your name is now ${input.value}`;
    nickForm.appendChild(currentName);
    socket.send(makeMessage("nickname", input.value));
    alert("your nickname is saved and also you can modify your nickname.");
    const btn = nickForm.querySelector("button");
    btn.innerText = "Modify";
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
