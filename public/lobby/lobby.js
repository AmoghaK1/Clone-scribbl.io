const socket = io("http://localhost:8080");

const lobbyId = sessionStorage.getItem("lobbyId");
const playerName = sessionStorage.getItem("playerName");
const playerColor = sessionStorage.getItem("playerColor");
const isHost = sessionStorage.getItem("host");

document.getElementById("lobbyId").innerText = lobbyId;

// Join lobby
socket.emit("joinLobby", { lobbyId, player: { name: playerName, color: playerColor } });

socket.on("updateLobby", (lobby) => {
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";

    lobby.players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player.name;
        li.style.color = player.color;
        playerList.appendChild(li);
    });

    // Show start button only for host
    if (isHost) {
        document.getElementById("startGameBtn").style.display = "block";
    }
});

// Start game
document.getElementById("startGameBtn").addEventListener("click", () => {
    socket.emit("startGame", lobbyId);
});

socket.on("gameStarted", () => {
    alert("Game is starting!");
    window.location.href = "game.html"; // Redirect to game page
});