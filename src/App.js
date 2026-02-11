import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleStartChat = () => {
    setShowChat(true);
  };

  return (
    <div className="App">
      {showChat ? (
        <ChatScreen messages={messages} setMessages={setMessages} />
      ) : (
        <WelcomeScreen
          messages={messages}
          setMessages={setMessages}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}

export default App;
