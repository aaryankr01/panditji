import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Users, MessageSquare, LayoutDashboard, LogOut, ArrowLeft } from 'lucide-react';
import { State, City } from 'country-state-city';

const ChatTracker = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedPandit, setSelectedPandit] = useState(null);
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const selectedPanditRef = useRef(null);
  const selectedDevoteeRef = useRef(null);

  useEffect(() => {
    selectedPanditRef.current = selectedPandit;
    selectedDevoteeRef.current = selectedDevotee;
  }, [selectedPandit, selectedDevotee]);

  const [panditFilters, setPanditFilters] = useState({ search: '', state: '', stateCode: '', city: '' });
  const [devoteeFilters, setDevoteeFilters] = useState({ search: '', state: '', stateCode: '', city: '' });

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://panditji-1tf8.onrender.com/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();

    // Connect to socket for real-time tracking
    socketRef.current = io('https://panditji-1tf8.onrender.com');
    socketRef.current.emit('adminJoin');

    socketRef.current.on('admin_newMessage', (msg) => {
      const pId = selectedPanditRef.current;
      const dId = selectedDevoteeRef.current;

      // Only append if the message is between the currently selected users
      const isMatch = (msg.sender === pId && msg.receiver === dId) ||
        (msg.sender === dId && msg.receiver === pId);

      if (isMatch) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    if (!selectedPandit || !selectedDevotee) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://panditji-1tf8.onrender.com/api/admin/conversations/${selectedPandit}/${selectedDevotee}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pandits = users.filter(u => u.role === 'pandit');
  const devotees = users.filter(u => u.role === 'devotee');

  const filteredPandits = pandits.filter(p => {
    const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(panditFilters.search.toLowerCase());
    const matchesState = !panditFilters.state || p.state === panditFilters.state;
    const matchesCity = !panditFilters.city || p.city === panditFilters.city;
    return matchesSearch && matchesState && matchesCity;
  });

  const filteredDevotees = devotees.filter(d => {
    const matchesSearch = `${d.firstName} ${d.lastName}`.toLowerCase().includes(devoteeFilters.search.toLowerCase());
    const matchesState = !devoteeFilters.state || d.state === devoteeFilters.state;
    const matchesCity = !devoteeFilters.city || d.city === devoteeFilters.city;
    return matchesSearch && matchesState && matchesCity;
  });

  const indianStates = State.getStatesOfCountry('IN');
  const getCities = (stateCode) => stateCode ? City.getCitiesOfState('IN', stateCode) : [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Simplified for Chat Tracker) */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            Admin
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors">
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 text-white rounded-xl transition-colors">
            <MessageSquare size={20} />
            Chat Tracker
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Track Conversations</h2>
            <button
              onClick={loadConversation}
              disabled={!selectedPandit || !selectedDevotee || loading}
              className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 shadow-lg transition-all active:scale-95"
            >
              {loading ? 'Loading...' : 'View Chat'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Pandit Filters */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider">Find Pandit</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Search Name..."
                  className="col-span-2 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={panditFilters.search}
                  onChange={(e) => setPanditFilters({ ...panditFilters, search: e.target.value })}
                />
                <select
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={panditFilters.stateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const name = indianStates.find(s => s.isoCode === code)?.name || '';
                    setPanditFilters({ ...panditFilters, stateCode: code, state: name, city: '' });
                  }}
                >
                  <option value="">All States</option>
                  {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                </select>
                <select
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={panditFilters.city}
                  onChange={(e) => setPanditFilters({ ...panditFilters, city: e.target.value })}
                  disabled={!panditFilters.stateCode}
                >
                  <option value="">All Cities</option>
                  {getCities(panditFilters.stateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <select
                className="w-full p-2 border border-orange-200 bg-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                value={selectedPandit || ''}
                onChange={(e) => setSelectedPandit(e.target.value)}
              >
                <option value="">-- Select Pandit ({filteredPandits.length}) --</option>
                {filteredPandits.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.city})</option>)}
              </select>
            </div>

            {/* Devotee Filters */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Find Devotee</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Search Name..."
                  className="col-span-2 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={devoteeFilters.search}
                  onChange={(e) => setDevoteeFilters({ ...devoteeFilters, search: e.target.value })}
                />
                <select
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={devoteeFilters.stateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const name = indianStates.find(s => s.isoCode === code)?.name || '';
                    setDevoteeFilters({ ...devoteeFilters, stateCode: code, state: name, city: '' });
                  }}
                >
                  <option value="">All States</option>
                  {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                </select>
                <select
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={devoteeFilters.city}
                  onChange={(e) => setDevoteeFilters({ ...devoteeFilters, city: e.target.value })}
                  disabled={!devoteeFilters.stateCode}
                >
                  <option value="">All Cities</option>
                  {getCities(devoteeFilters.stateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <select
                className="w-full p-2 border border-blue-200 bg-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedDevotee || ''}
                onChange={(e) => setSelectedDevotee(e.target.value)}
              >
                <option value="">-- Select Devotee ({filteredDevotees.length}) --</option>
                {filteredDevotees.map(d => <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a Pandit and Devotee to view their conversation history.
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, idx) => {
                const isPandit = msg.sender === selectedPandit;
                return (
                  <div key={idx} className={`flex ${isPandit ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isPandit ? 'bg-white border border-gray-200 text-gray-800' : 'bg-orange-600 text-white shadow-md'}`}>
                      <div className="text-xs font-bold mb-1 opacity-75">
                        {isPandit ? 'Pandit' : 'Devotee'}
                      </div>

                      {msg.type === 'text' && (
                        <div className="text-sm">{msg.content}</div>
                      )}

                      {msg.type === 'image' && (
                        <div className="space-y-2">
                          <img src={msg.fileUrl} alt="Shared" className="rounded-lg max-w-full h-auto border border-gray-200" />
                          {msg.content && <div className="text-sm">{msg.content}</div>}
                        </div>
                      )}

                      {msg.type === 'audio' && (
                        <div className="space-y-2">
                          <audio controls src={msg.fileUrl} className="max-w-full" />
                          <div className="text-xs opacity-75 italic">Voice Note</div>
                        </div>
                      )}

                      {msg.type === 'video' && (
                        <div className="space-y-2">
                          <video controls src={msg.fileUrl} className="rounded-lg max-w-full" />
                          {msg.content && <div className="text-sm">{msg.content}</div>}
                        </div>
                      )}

                      {msg.type === 'contact_share' && (
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-800 space-y-1">
                          <div className="font-bold text-xs uppercase text-gray-500">Contact Shared</div>
                          <div className="font-bold">{msg.contactData?.name}</div>
                          <div className="text-sm">{msg.contactData?.phone}</div>
                          {msg.contactData?.whatsapp && (
                            <div className="text-xs text-green-600 font-medium">WhatsApp: {msg.contactData.whatsapp}</div>
                          )}
                        </div>
                      )}

                      {msg.type === 'booking_request' && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-gray-800">
                          <div className="font-bold text-orange-600 text-xs uppercase mb-1">Puja Booking Request</div>
                          <div className="text-sm font-medium">{msg.content}</div>
                        </div>
                      )}

                      {!['text', 'image', 'audio', 'video', 'contact_share', 'booking_request'].includes(msg.type) && msg.content && (
                        <div className="text-sm">{msg.content}</div>
                      )}

                      <div className="text-[10px] opacity-60 mt-2 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTracker;
