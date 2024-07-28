const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const multer = require('multer');
const fs = require('fs');

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

// Route to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
    res.json({ filePath: '/uploads/' + req.file.filename });
});

io.on('connection', function(socket) {
    socket.on('newuser', function(username) {
        socket.broadcast.emit('update', username + ' joined the conversation');
    });
    socket.on('exituser', function(username) {
        socket.broadcast.emit('update', username + ' left the conversation');
    });
    socket.on('chat', function(message) {
        socket.broadcast.emit('chat', message);
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});



