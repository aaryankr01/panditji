import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations/list');
        setConversations(res.data.data);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };
    fetchConversations();
  }, [isAuthenticated]);

  const openConversation = async (otherUser) => {
    setSelectedConversation(otherUser);
    try {
      const res = await api.get(`/chat/${otherUser._id}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <ChatContext.Provider value={{ conversations, selectedConversation, messages, openConversation, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);

export default ChatContext;
