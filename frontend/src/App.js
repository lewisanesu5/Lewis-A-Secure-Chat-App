import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import CryptoJS from "crypto-js";

// CHANGE THIS: Use your actual ngrok HTTPS URL or backend public URL
const SOCKET_SERVER_URL = 'https://228a-103-97-164-18.ngrok-free.app'; // <-- CHANGE THIS!!

const SECRET_KEY = "very_secret_key"; // In production, use actual user-based secret

const socket = io(SOCKET_SERVER_URL);

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      let decryptedText = msg.text;
      try {
        const bytes = CryptoJS.AES.decrypt(msg.text, SECRET_KEY);
        decryptedText = bytes.toString(CryptoJS.enc.Utf8) || msg.text;
      } catch {
        decryptedText = '[Decryption error]';
      }
      setChat(prev => [
        ...prev,
        { text: decryptedText, me: false, timestamp: msg.timestamp }
      ]);
    });
    return () => socket.off('chat message');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const encrypted = CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
    const msgData = {
      text: encrypted,
      timestamp: new Date().toISOString()
    };
    socket.emit('chat message', msgData);
    setChat(prev => [
      ...prev,
      { text: message, me: true, timestamp: msgData.timestamp }
    ]);
    setMessage('');
  };

  return (
    <div style={{ width: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Secure 2-Person Chat</h2>
      <div style={{
        border: '1px solid #ccc', minHeight: 200, maxHeight: 300,
        overflowY: 'auto', padding: 10, background: '#fafbfc'
      }}>
        {chat.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.me ? 'right' : 'left', margin: '8px 0'
          }}>
            <div style={{
              display: 'inline-block',
              background: msg.me ? '#e1ffc7' : '#fff',
              padding: '7px 12px', borderRadius: 8
            }}>
              {msg.text}
            </div>
            <div style={{ fontSize: 10, color: '#999' }}>
              {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: 10 }}>
        <input
          style={{ flex: 1, padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          placeholder="Type your message..."
        />
        <button style={{
          marginLeft: 8, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 5
        }}>Send</button>
      </form>
    </div>
  );
}

export default App;