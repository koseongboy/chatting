const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;
let nickName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function reloadNickname(nick) {
    const nowName = room.querySelector("h3");
    nowName.innerText = `You're now: ${nick}`;
}

function hndleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value, reloadNickname);
    event.target.hidden = true;
    const modify = room.querySelector("a");
    modify.hidden = false;
}

function handleModifyClick(event) {
    event.preventDefault();
    const nameForm = room.querySelector("#name");
    nameForm.hidden = false;
    event.target.hidden = true;
}

function currentCount(newCount) {
    const h3 = room.querySelector("#msg h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
}

function showRoom(newCount) {
    welcome.hidden = true;
    room.hidden = false;
    currentCount(newCount);
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    msgForm.querySelector("input").focus();
    nameForm.addEventListener("submit", hndleNicknameSubmit);
    nameForm.hidden = true;
    const nowName = room.querySelector("h3");
    nowName.innerText = `You're now: ${nickName}`;
    const modify = room.querySelector("a");
    modify.addEventListener("click", handleModifyClick);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const roomInput = form.querySelector("#room_name");
    const nickInput = form.querySelector("#nick");
    nickName = nickInput.value;
    roomName = roomInput.value;
    socket.emit("enter_room", nickInput.value, roomInput.value, showRoom);
}

form.addEventListener("submit", handleRoomSubmit);

function handleOutRoomNameClick(event) {
    event.preventDefault();
    const roomInput = form.querySelector("#room_name");
    roomInput.value = event.target.innerText;
}

socket.on("welcome", (user, newCount) => {
    currentCount(newCount);
    addMessage(`${user} is arrived!!`);
});

socket.on("bye", (left, newCount) => {
    currentCount(newCount);
    addMessage(`${left} left ㅜㅠ`);
});

socket.on("new_message", addMessage);

socket.on("modified", (msg) => {
    addMessage(msg);
});

socket.on("room_change", (rooms) => {
    const list = welcome.querySelector("ul");
    if (rooms.length === 0) {
        list.innerHTML = "";
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.innerText = room;
        a.addEventListener("click", handleOutRoomNameClick);
        list.appendChild(li);
        li.appendChild(a);
    });
});
