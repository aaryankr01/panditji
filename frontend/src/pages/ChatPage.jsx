import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/common/Navbar';
import ChatWindow from '../components/chat/ChatWindow';
import Loader from '../components/common/Loader';
import { MessageCircle } from 'lucide-react';

const ChatPage = () => {
  const { token } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('https://panditji-1tf8.onrender.com/api/chat/conversations/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const convos = res.data.data;
        setConversations(convos);

        // If we came from a profile with a pre-selected user
        if (location.state?.preSelectedUser) {
          const preUser = location.state.preSelectedUser;
          setSelectedUser(preUser);
          // Add to list if not already there so they show up in sidebar
          if (!convos.find(u => u._id === preUser._id)) {
            setConversations([preUser, ...convos]);
          }
        } else if (convos.length > 0) {
          // Select first by default if exists
          setSelectedUser(convos[0]);
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchConversations();
  }, [token, location.state]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 font-serif">Messages</h1>
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex h-full">
          {/* Sidebar */}
          <div className="w-1/3 md:w-1/4 border-r border-gray-100 flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader size={24} /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                  <MessageCircle size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet.</p>
                </div>
              ) : (
                conversations.map(u => (
                  <button
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-orange-50 transition-colors flex items-center gap-3 ${selectedUser?._id === u._id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                      {u.firstName?.charAt(0) || '?'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-gray-800 truncate">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-gray-500 capitalize">{u.role}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 h-full bg-gray-50">
            {selectedUser ? (
              <ChatWindow selectedUser={selectedUser} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
