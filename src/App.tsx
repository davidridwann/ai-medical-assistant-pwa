import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
  const [showChat, setShowChat] = useState(false);

  // Get base URL from environment or use empty string for relative paths
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  // Optional: Get userId from auth context or localStorage if available
  const userId = undefined; // Can be enhanced later with auth

  const handleStartChat = () => {
    setShowChat(true);
  };

  const handleBackToWelcome = () => {
    setShowChat(false);
  };

  return (
    <div className="App">
      {showChat ? (
        <ChatScreen baseUrl={baseUrl} userId={userId} />
      ) : (
        <WelcomeScreen baseUrl={baseUrl} userId={userId} onStartChat={handleStartChat} />
      )}
    </div>
  );
}

export default App;
