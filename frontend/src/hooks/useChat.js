import { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const useChat = (otherUserId) => {
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch history with a specific user
  useEffect(() => {
    if (!otherUserId || !isAuthenticated) return;
    setLoading(true);
    api.get(`/chat/${otherUserId}`)
      .then(res => setMessages(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [otherUserId, isAuthenticated]);

  // Fetch conversations list
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/chat/conversations/list')
      .then(res => setConversations(res.data.data))
      .catch(err => console.error(err));
  }, [isAuthenticated]);

  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  return { messages, conversations, loading, addMessage };
};

export default useChat;
