const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());

// Room storage (temporary, can be replaced with DB)
let notes = {}; // Store notes by room ID
let users = {}; // Store users per room

// RESTful API for saving and retrieving notes
app.get('/notes/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.json(notes[roomId] || "");
});

app.post('/notes/:roomId', express.json(), (req, res) => {
  const roomId = req.params.roomId;
  const note = req.body.note;
  notes[roomId] = note;
  res.status(200).send({ message: 'Note saved!' });
});

// Socket.io - Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Join a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    if (!users[roomId]) {
      users[roomId] = [];
    }
    users[roomId].push(socket.id);
    io.to(roomId).emit('userJoined', users[roomId]);
  });

  // Real-time note editing
  socket.on('editNote', (roomId, note) => {
    notes[roomId] = note;
    io.to(roomId).emit('noteUpdated', note);
  });

  // Notify when a user leaves the room
  socket.on('disconnect', () => {
    for (let roomId in users) {
      const index = users[roomId].indexOf(socket.id);
      if (index !== -1) {
        users[roomId].splice(index, 1);
        io.to(roomId).emit('userLeft', users[roomId]);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
