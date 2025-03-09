window.onload = function() {
    if (sessionStorage.getItem("playerName")) {
        document.getElementById("nameInput").value = sessionStorage.getItem("playerName");
        document.getElementById("colorInput").value = sessionStorage.getItem("playerColor");
    }
};

try {
    socket = io();
    console.log('Socket.io connected successfully');
} catch (e) {
    console.error('Socket.io connection failed:', e);
    // Fallback behavior
    socket = {
        emit: () => console.log('Socket emit (fallback - not connected)'),
        on: () => console.log('Socket on (fallback - not connected)')
    };
}

// Avatar colors
const avatarColors = ['#ff4c4c', '#ff8c4c', '#ffee4c', '#4cff4c', '#4cffee', '#4c4cff', '#b54cff', '#ff4cb5'];
let currentAvatarIndex = 4; // Default to the cyan one

// Function to update selected avatar colors (both the head and body)
function updateSelectedAvatarColor(colorIndex) {
    const selectedAvatar = document.querySelector('.selected-avatar');
    const color = avatarColors[colorIndex];
    
    // This sets the CSS variable that controls both the head and body color
    selectedAvatar.style.setProperty('--avatar-color', color);
}

// Set initial avatar color
updateSelectedAvatarColor(currentAvatarIndex);

// Avatar color selection
document.querySelectorAll('.avatar-arrow').forEach((arrow, index) => {
    arrow.addEventListener('click', () => {
        // Up arrows (0 and 2)
        if (index === 0 || index === 2) {
            currentAvatarIndex = (currentAvatarIndex + 1) % avatarColors.length;
        } 
        // Down arrows (1 and 3)
        else {
            currentAvatarIndex = (currentAvatarIndex - 1 + avatarColors.length) % avatarColors.length;
        }
        
        // Update the avatar color
        updateSelectedAvatarColor(currentAvatarIndex);
    });
});

// Random avatar button
document.querySelector('.random-avatar').addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * avatarColors.length);
    currentAvatarIndex = randomIndex;
    
    // Update the avatar color
    updateSelectedAvatarColor(currentAvatarIndex);
});

// Play button functionality (placeholder)
document.getElementById('create-lobby-btn').addEventListener('click', () => {
    let playerName = document.querySelector('.name-input').value;
    let selectedAvatar = document.querySelector('.selected-avatar');
    let selectedColor = getComputedStyle(selectedAvatar).getPropertyValue('--avatar-color').trim();
    if(!playerName){
        alert("Enter name!");
        return;
    }
    sessionStorage.setItem("playerName", playerName);
    sessionStorage.setItem("playerColor", selectedColor);
    //create lobby
    socket.emit("createLobby");
     // Receive Lobby ID
     socket.on("lobbyCreated", (data) => {
        sessionStorage.setItem("lobbyId", data.lobbyId);
    });
    sessionStorage.setItem("host", true);
    window.location.href = "/lobby/lobby.html";
    
});

// Create private room functionality (placeholder)
document.getElementById('join-lobby-btn').addEventListener('click', () => {
    let playerName = document.querySelector('.name-input').value;
    let selectedAvatar = document.querySelector('.selected-avatar');
    let selectedColor = getComputedStyle(selectedAvatar).getPropertyValue('--avatar-color').trim();
    if(!playerName){
        alert("Enter name!");
        return;
    }
    sessionStorage.setItem("playerName", playerName);
    sessionStorage.setItem("playerColor", selectedColor);
    sessionStorage.setItem("host", false);

    // Show room ID input
    document.querySelector('.room-id-container').style.display = 'flex';
    document.querySelector('.room-id-input').focus();
    
});

document.getElementById('confirm-join-btn').addEventListener('click', () => {
   let lobbyId = document.querySelector('.room-id-input').value.trim();
    if(!lobbyId) {
        alert("Please enter a Room ID!");
        return;
    }
    sessionStorage.setItem("lobbyId", lobbyId);
    socket.emit("joinLobby", lobbyId);
    
    // Notify when a player joins
    socket.on("playerJoined", (data) => {
        console.log("Players in Lobby:", data.players);
    });

    socket.on("error", (message) => {
        alert(message);
    });
     window.location.href = "/lobby/lobby.html";
});