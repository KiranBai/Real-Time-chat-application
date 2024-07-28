(function () {
    const app = document.querySelector(".app");
    const socket = io();

    let uname;
    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value;

        if (username.length === 0) {
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length === 0) {
            return;
        }
        const time = getCurrentTime();
        renderMessage("my", {
            username: uname,
            text: message,
            time: time
        });
        socket.emit("chat", {
            username: uname,
            text: message,
            time: time
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #send-image").addEventListener("click", function () {
        document.querySelector("#image-input").click();
    });

    app.querySelector("#image-input").addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const time = getCurrentTime();
                socket.emit("image", {
                    username: uname,
                    image: e.target.result,
                    time: time
                });
                renderMessage("my", {
                    username: uname,
                    image: e.target.result,
                    time: time
                });
            };
            reader.readAsDataURL(file);
        }
    });

    app.querySelector(".chat-screen #emoji-button").addEventListener("click", function () {
        const emoji = document.querySelector("#emoji-picker").value;
        if (emoji && emoji.length > 0) {
            const time = getCurrentTime();
            renderMessage("my", {
                username: uname,
                text: emoji,
                time: time
            });
            socket.emit("chat", {
                username: uname,
                text: emoji,
                time: time
            });
        }
    });
    app.querySelector(".chat-screen #emoji-button").addEventListener("click", function() {
        const emojiDropdown = document.createElement("div");
        emojiDropdown.classList.add("emoji-dropdown");
        emojiDropdown.innerHTML = `
            <span>😀</span> <span>😃</span> <span>😄</span> <span>😁</span> <span>😆</span>
            <span>😅</span> <span>😂</span> <span>🤣</span> <span>😊</span> <span>😇</span>
            <span>🙂</span> <span>🙃</span> <span>😉</span> <span>😌</span> <span>😍</span>
        `;
        document.body.appendChild(emojiDropdown);
    
        emojiDropdown.style.position = "absolute";
        emojiDropdown.style.left = `${this.getBoundingClientRect().left}px`;
        emojiDropdown.style.top = `${this.getBoundingClientRect().bottom + 5}px`;
    
        emojiDropdown.addEventListener("click", function(e) {
            if (e.target.tagName === "SPAN") {
                app.querySelector(".chat-screen #message-input").value += e.target.textContent;
                document.body.removeChild(emojiDropdown);
            }
        });
    });
    

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    socket.on("image", function (message) {
        renderMessage("other", message);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (type == "my") {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            if (message.text) {
                el.innerHTML = `<div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                    <div class="time">${message.time}</div>
                </div>`;
            } else if (message.image) {
                el.innerHTML = `<div>
                    <div class="name">You</div>
                    <img src="${message.image}" alt="image" class="text">
                    <div class="time">${message.time}</div>
                </div>`;
            }
            messageContainer.appendChild(el);
        } else if (type == "other") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            if (message.text) {
                el.innerHTML = `<div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                    <div class="time">${message.time}</div>
                </div>`;
            } else if (message.image) {
                el.innerHTML = `<div>
                    <div class="name">${message.username}</div>
                    <img src="${message.image}" alt="image" class="text">
                    <div class="time">${message.time}</div>
                </div>`;
            }
            messageContainer.appendChild(el);
        } else if (type == "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }
})();







