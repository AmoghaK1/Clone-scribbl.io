document.addEventListener('DOMContentLoaded', () => {
    let socket;
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    // Initialize Socket.io connection
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

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        console.error('Canvas or context not found');
        return;
    }

    console.log('Canvas found:', canvas !== null);

    // Resize canvas to fit its container while maintaining aspect ratio
    function resizeCanvas() {
        const container = canvas.parentElement;
        const aspectRatio = 600 / 400; // Original aspect ratio

        // Set display dimensions
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientWidth / aspectRatio}px`;

        // Set internal dimensions to match display dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Reset drawing settings
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start drawing
    function startDrawing(e) {
        drawing = true;
        const { offsetX, offsetY } = getCoordinates(e);
        [lastX, lastY] = [offsetX, offsetY];
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    // Draw on canvas
    function draw(e) {
        if (!drawing) return;

        const { offsetX, offsetY } = getCoordinates(e);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        // Normalize coordinates and emit drawing data
        const normalizedX = offsetX / canvas.width;
        const normalizedY = offsetY / canvas.height;
        socket.emit('drawing', { x: normalizedX, y: normalizedY });

        [lastX, lastY] = [offsetX, offsetY];
    }

    // Stop drawing
    function stopDrawing() {
        drawing = false;
    }

    // Get coordinates from event (mouse or touch)
    function getCoordinates(e) {
        if (e.touches) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            };
        } else {
            return { offsetX: e.offsetX, offsetY: e.offsetY };
        }
    }

    // Add event listeners for mouse and touch
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);

    // Receive and draw from other players
    socket.on('drawing', (data) => {
        const x = data.x * canvas.width;
        const y = data.y * canvas.height;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        [lastX, lastY] = [x, y];
    });
});