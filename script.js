const chat = document.querySelector("#chat");
const input = document.querySelector("#input");
const form = document.querySelector("#form");
const hist = document.querySelector("#history");

let messages = JSON.parse(localStorage.getItem("jalali_messages") || "[]");

function save() {
    localStorage.setItem("jalali_messages", JSON.stringify(messages));

    hist.innerHTML = messages
        .filter(m => m.role === "user")
        .slice(-8)
        .reverse()
        .map(m => `<div>${escapeHTML(m.content)}</div>`)
        .join("");
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function addMessage(role, text) {
    document.querySelector(".welcome")?.remove();

    const box = document.createElement("div");
    box.className = `msg ${role === "assistant" ? "ai" : ""}`;

    box.innerHTML = `
        <div class="av">${role === "user" ? "You" : "J"}</div>
        <div class="text"></div>
    `;

    box.querySelector(".text").textContent = text;

    chat.appendChild(box);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(question) {

    messages.push({
        role: "user",
        content: question
    });

    addMessage("user", question);
    save();

    const loading = document.createElement("div");
    loading.className = "msg ai";

    loading.innerHTML = `
        <div class="av">J</div>
        <div class="text">Jalali AI soch raha hai...</div>
    `;

    chat.appendChild(loading);
    chat.scrollTop = chat.scrollHeight;

    try {

        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        const data = await response.json();

        loading.remove();

        if (!response.ok) {
            throw new Error(data.error || "Server error");
        }

        messages.push({
            role: "assistant",
            content: data.reply
        });

        addMessage("assistant", data.reply);
        save();

    } catch (error) {

        console.error(error);

        loading.remove();

        addMessage(
            "assistant",
            "Jalali AI se connection mein problem aa rahi hai. Python backend check karo."
        );
    }
}

form.addEventListener("submit", function(e) {

    e.preventDefault();

    const question = input.value.trim();

    if (!question) return;

    input.value = "";

    sendMessage(question);
});

document.querySelectorAll("[data-q]").forEach(button => {

    button.addEventListener("click", () => {

        input.value = button.dataset.q;

        form.requestSubmit();

    });

});

document.querySelector("#new").addEventListener("click", () => {

    messages = [];

    localStorage.removeItem("jalali_messages");

    location.reload();

});

save();