import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import './App.css';  // Import the CSS styles

const socket = io("http://localhost:5000");

const App = () => {
  const [note, setNote] = useState('');
  const [roomId, setRoomId] = useState('');
  const [users, setUsers] = useState([]);
  const [newNote, setNewNote] = useState('');

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    socket.emit('editNote', roomId, e.target.value);
  };

  const handleJoinRoom = () => {
    socket.emit('joinRoom', roomId);
  };

  useEffect(() => {
    socket.on('userJoined', (usersList) => {
      setUsers(usersList);
    });

    socket.on('userLeft', (usersList) => {
      setUsers(usersList);
    });

    socket.on('noteUpdated', (updatedNote) => {
      setNote(updatedNote);
    });
  }, []);

  return (
    <div className="App">
      <h1>Real-Time Collaborative Notes</h1>
      <input 
        type="text" 
        value={roomId} 
        onChange={(e) => setRoomId(e.target.value)} 
        placeholder="Enter room ID" 
      />
      <button onClick={handleJoinRoom}>Join Room</button>

      <h2>Current Users: {users.length}</h2>
      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="Start writing..."
      />
    </div>
  );
};

export default App;

