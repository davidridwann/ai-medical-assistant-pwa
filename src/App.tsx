import React, { useState } from 'react';
import { useParahitaChat } from './hooks/useParahitaChat';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
  const [showChat, setShowChat] = useState(false);

  // Get base URL from environment or use empty string for relative paths
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  // Optional: Get userId from auth context or localStorage if available
  const userId = undefined; // Can be enhanced later with auth

  // Lift chat state to App level so both screens share the same state
  const chatState = useParahitaChat({ baseUrl, userId });

  const handleStartChat = () => {
    setShowChat(true);
  };

  return (
    <div className="App">
      {showChat ? (
        <ChatScreen chatProps={chatState} />
      ) : (
        <WelcomeScreen chatProps={chatState} onStartChat={handleStartChat} />
      )}
    </div>
  );
}

export default App;
