import React, { useEffect, useState, useRef, memo } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import { Send, User as UserIcon, Paperclip, Mic, Trash2, Check, CheckCheck, MoreVertical, X, Clock } from 'lucide-react';

// MEMOIZED MESSAGE COMPONENT for performance
const MessageBubble = memo(({ msg, isMine, onOpenOptions, optionsActive, onDeleteMessage, renderTicks, renderMessageContent }) => {
  if (isMine && msg.isDeletedBySender) return null;
  if (!isMine && msg.isDeletedByReceiver) return null;

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative`}>
      {isMine && !optionsActive && (
        <button
          onClick={() => onOpenOptions(msg._id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity self-center mr-1"
        >
          <MoreVertical size={16} />
        </button>
      )}
      {optionsActive && (
        <div className="absolute right-0 top-0 mt-8 mr-6 bg-white shadow-lg rounded-lg border border-gray-100 py-1 z-10 w-48 text-sm">
          <button onClick={() => onDeleteMessage(msg._id, 'everyone')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">Delete for everyone</button>
          <button onClick={() => onDeleteMessage(msg._id, 'me')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Delete for me</button>
          <button onClick={() => onOpenOptions(null)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-500">Cancel</button>
        </div>
      )}

      <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${isMine
        ? 'bg-orange-600 text-white rounded-br-sm'
        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
        } ${msg.status === 'sending' ? 'opacity-70' : ''}`}>
        {msg.content === 'This message was deleted' ? (
          <div className="text-sm italic opacity-70 flex items-center gap-1">
            <Trash2 size={12} /> This message was deleted
          </div>
        ) : (
          renderMessageContent(msg, isMine)
        )}

        <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${isMine ? 'text-orange-200' : 'text-gray-400'}`}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isMine && msg.status !== 'sending' && renderTicks(msg.status)}
          {isMine && msg.status === 'sending' && <Clock size={10} className="animate-spin" />}
        </div>
      </div>
    </div>
  );
});

const ChatInterface = ({ otherUser, socket }) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const isCancelledRef = useRef(false);

  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [isHD, setIsHD] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [activeMessageOptions, setActiveMessageOptions] = useState(null);

  useEffect(() => {
    if (!socket || !otherUser || !user) return;

    socketRef.current = socket;
    const userId = user._id || user.id;
    socketRef.current.emit('join', { userId, role: user.role, city: user.city });

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${otherUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    };

    const checkBookingStatus = async () => {
      try {
        const res = await api.get('/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bookings = res.data.data;
        const activeBooking = bookings.find(b =>
          (b.pandit?._id === otherUser._id || b.devotee?._id === otherUser._id) &&
          b.paymentStatus === 'paid' &&
          b.status === 'confirmed'
        );
        setIsLocked(!activeBooking);
      } catch (err) {
        console.error('Failed to check booking status', err);
      }
    };

    fetchHistory();
    checkBookingStatus();

    socketRef.current.on('newMessage', (msg) => {
      if (msg.sender === otherUser._id || msg.receiver === otherUser._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socketRef.current.on('messageSent', (msg) => {
      if (msg.receiver === otherUser._id) {
        setMessages((prev) => {
          const exists = prev.find(m => m._id === msg.tempId || (m.content === msg.content && m.status === 'sending'));
          if (exists) {
            return prev.map(m => m._id === exists._id ? msg : m);
          }
          return [...prev, msg];
        });
      }
    });

    socketRef.current.on('messageStatusUpdated', ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
    });

    socketRef.current.on('conversationSeen', ({ conversationId, status }) => {
      setMessages(prev => prev.map(m => m.conversation === conversationId && m.status !== 'seen' ? { ...m, status } : m));
    });

    socketRef.current.on('messageDeleted', ({ messageId, type, deletedBy, newMsg }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? newMsg : m));
    });

    socketRef.current.on('error', (err) => {
      alert(err.message || 'An error occurred in chat');
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageSent');
      socket.off('messageStatusUpdated');
      socket.off('conversationSeen');
      socket.off('messageDeleted');
      socket.off('error');
    };
  }, [otherUser, user, token, socket]);

  const seenTimeoutRef = useRef(null);
  useEffect(() => {
    if (!otherUser || !socketRef.current || !messages.length) return;
    const hasUnseen = messages.some(m => m.sender?.toString() === otherUser._id?.toString() && m.status !== 'seen');
    if (hasUnseen) {
      if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
      seenTimeoutRef.current = setTimeout(() => {
        const conversationId = messages[0]?.conversation;
        if (conversationId) {
          socketRef.current.emit('markConversationSeen', { conversationId, readerId: user._id || user.id, senderId: otherUser._id });
        }
      }, 500);
    }
    return () => { if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current); };
  }, [messages, otherUser, user]);

  const lastMessageCountRef = useRef(messages.length);
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    messagesEndRef.current?.scrollIntoView({ behavior: isNewMessage ? 'smooth' : 'auto' });
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      sender: user._id || user.id,
      receiver: otherUser._id,
      content: inputText,
      type: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      conversation: messages[0]?.conversation
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
    socketRef.current.emit('sendMessage', { senderId: user._id || user.id, receiverId: otherUser._id, text: inputText, type: 'text', tempId });
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1080;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let type = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    if (type === 'image') { setMediaFile(file); setMediaPreview(URL.createObjectURL(file)); return; }
    await uploadAndSendFile(file, type);
  };

  const uploadAndSendFile = async (file, type, caption = '') => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      socketRef.current.emit('sendMessage', { senderId: user._id || user.id, receiverId: otherUser._id, text: caption, type: type, fileUrl: res.data.fileUrl });
      setMediaPreview(null); setMediaFile(null); setMediaCaption(''); setAudioPreviewUrl(null); setAudioBlob(null);
    } catch (err) { alert('Failed to upload file.'); }
  };

  const sendMediaWithPreview = async () => {
    let finalFile = mediaFile;
    if (mediaFile.type.startsWith('image/') && !isHD) finalFile = await compressImage(mediaFile);
    await uploadAndSendFile(finalFile, 'image', mediaCaption);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorderRef.current.onstop = async () => {
        if (isCancelledRef.current) { stream.getTracks().forEach(track => track.stop()); setRecordingTime(0); return; }
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setAudioBlob(blob); setAudioPreviewUrl(URL.createObjectURL(blob)); setRecordingTime(0);
      };
      mediaRecorderRef.current.start(); setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { alert('Microphone access denied'); }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) { isCancelledRef.current = true; mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(timerRef.current); }
    setAudioPreviewUrl(null); setAudioBlob(null);
  };

  const sendRecording = () => {
    if (mediaRecorderRef.current && isRecording) { isCancelledRef.current = false; mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(timerRef.current); }
    else if (audioBlob) uploadAndSendFile(new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' }), 'audio');
  };

  const handleDeleteMessage = (msgId, type) => {
    socketRef.current.emit('deleteMessage', { messageId: msgId, deletedBy: user._id || user.id, type });
    setActiveMessageOptions(null);
  };

  const renderTicks = (status) => {
    if (status === 'seen') return <CheckCheck size={14} className="text-blue-500" />;
    if (status === 'delivered') return <CheckCheck size={14} />;
    return <Check size={14} />;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessageContent = (msg, isMine) => {
    const getMediaUrl = (url) => url?.startsWith('http') ? url : `https://panditji-1tf8.onrender.com${url}`;
    switch (msg.type) {
      case 'image':
        return (
          <div className="flex flex-col">
            <img src={getMediaUrl(msg.fileUrl)} alt="Sent content" className="max-w-[200px] md:max-w-[250px] rounded-lg mt-1 cursor-pointer" onClick={() => window.open(getMediaUrl(msg.fileUrl), '_blank')} />
            {msg.content && <span className="text-sm mt-1">{msg.content}</span>}
          </div>
        );
      case 'video': return <video src={getMediaUrl(msg.fileUrl)} controls className="max-w-[200px] rounded-lg mt-1" />;
      case 'audio': return <audio src={getMediaUrl(msg.fileUrl)} controls className="max-w-[200px] mt-1" />;
      default: return <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>;
    }
  };

  if (!otherUser) {
    return <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">Select a conversation to start chatting</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 overflow-hidden">
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <div><h3 className="font-bold text-gray-800">{otherUser.firstName} {otherUser.lastName}</h3><span className="text-xs text-orange-600 font-medium capitalize">{otherUser.role}</span></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 relative">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id || idx}
            msg={msg}
            isMine={msg.sender?.toString() === (user._id || user.id)?.toString()}
            onOpenOptions={setActiveMessageOptions}
            optionsActive={activeMessageOptions === msg._id}
            onDeleteMessage={handleDeleteMessage}
            renderTicks={renderTicks}
            renderMessageContent={renderMessageContent}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {mediaPreview && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col">
          <div className="p-4 flex items-center justify-between border-b bg-gray-50">
            <button onClick={() => { setMediaPreview(null); setMediaFile(null); }} className="p-2 bg-gray-200 rounded-full"><X size={20} /></button>
            <button onClick={() => setIsHD(!isHD)} className={`px-3 py-1 rounded-full font-bold text-xs border ${isHD ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-gray-500'}`}>HD</button>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center p-4">
            <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <input type="text" value={mediaCaption} onChange={e => setMediaCaption(e.target.value)} placeholder="Add a caption..." className="flex-1 px-4 py-3 bg-gray-100 rounded-xl" />
            <button onClick={sendMediaWithPreview} className="p-3 bg-orange-600 text-white rounded-xl shadow-lg"><Send size={24} /></button>
          </div>
        </div>
      )}

      <div className="p-4 bg-white border-t border-gray-100">
        {isLocked ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center text-orange-700 text-sm font-medium">Chat will unlock once the payment is completed.</div>
        ) : (
          <div className="flex gap-2 items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,audio/*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-orange-600 rounded-full shrink-0"><Paperclip size={20} /></button>
            {audioPreviewUrl ? (
              <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-full px-4 py-2 border">
                <audio src={audioPreviewUrl} controls className="h-8 w-full max-w-[200px]" />
                <div className="flex items-center gap-1">
                  <button onClick={cancelRecording} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  <button onClick={sendRecording} className="p-1.5 text-white bg-orange-600 rounded-full shadow-md"><Send size={18} /></button>
                </div>
              </div>
            ) : isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-full px-4 py-2 border text-red-500 animate-pulse">
                <div className="flex items-center gap-2"><Mic size={18} /><span>{formatTime(recordingTime)}</span></div>
                <div className="flex items-center gap-1">
                  <button onClick={cancelRecording} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  <button onClick={sendRecording} className="p-1.5 text-orange-600"><Send size={18} /></button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex-1 flex gap-2 min-w-0">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your message..." className="flex-1 min-w-0 px-4 py-2 border rounded-full focus:ring-1 focus:ring-orange-500" />
                {inputText.trim() ? (
                  <button type="submit" className="p-2 bg-orange-600 text-white rounded-full shrink-0"><Send size={20} /></button>
                ) : (
                  <button type="button" onClick={startRecording} className="p-2 text-gray-500 hover:text-orange-600 rounded-full shrink-0"><Mic size={20} /></button>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
