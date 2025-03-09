const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import CORS

const app = express();
const server = http.createServer(app);

// CORS Middleware
app.use(cors({
    origin: "*", // Allow requests from any origin (same port 8080)
    methods: ["GET", "POST"]
}));

// Serve static files (index.html, script.js, styles.css) from "public" folder
app.use(express.static(__dirname + '/public'));

// Create a new Socket.io server
const io = new Server(server, {
    cors: {
        origin: "*", // Allow requests from all origins
        methods: ["GET", "POST"]
    }
});

const lobbies = {};

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Create Lobby
    socket.on("createLobby", () => {
        const lobbyId = Math.random().toString(36).substr(2, 6); // Random 6-char ID
        lobbies[lobbyId] = { players: [socket.id] };
        socket.join(lobbyId);
        socket.emit("lobbyCreated", { lobbyId });
        console.log(`Lobby ${lobbyId} created`);
        console.log(lobbies);
    });

    // Join Lobby
    socket.on("joinLobby", ({ lobbyId, player }) => {
        if (lobbies[lobbyId]) {
            lobbies[lobbyId].players.push({ id: socket.id, name: player.name, color: player.color });
            socket.join(lobbyId);
            io.to(lobbyId).emit("updateLobby", lobbies[lobbyId]); // Notify all players
            console.log(lobbies);
        } else {
            socket.emit("error", "Lobby not found");
            console.log(lobbies);
        }
    });

    // Disconnect
    socket.on("disconnectGame", () => {
        for (const lobbyId in lobbies) {
            lobbies[lobbyId].players = lobbies[lobbyId].players.filter((id) => id !== socket.id);
            if (lobbies[lobbyId].players.length === 0) {
                delete lobbies[lobbyId]; // Remove empty lobbies
            }
        }
        console.log(`User ${socket.id} disconnected`);
         console.log(lobbies);
    });

    // Listen for drawing events
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data); // Send to all clients except sender
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.redirect('/landing/landing.html');
});

// Start the server on port 8080
server.listen(8080, () => {
    console.log('Server running at PORT 8080');
});