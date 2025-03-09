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

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for drawing events
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data); // Send to all clients except sender
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server on port 8080
server.listen(8080, () => {
    console.log('Server running at PORT 8080');
});
