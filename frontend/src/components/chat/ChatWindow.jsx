import React from 'react';
import ChatInterface from '../ChatInterface'; // Reusing our robust existing logic

// A wrapper to align with the new modular structure while keeping the socket logic intact
const ChatWindow = ({ selectedUser }) => {
  return (
    <div className="h-full w-full">
      <ChatInterface otherUser={selectedUser} />
    </div>
  );
};

export default ChatWindow;
