import React from 'react';

const MessageBubble = ({ message, isMine }) => {
  const renderMessageContent = (msg) => {
    const getMediaUrl = (url) => url?.startsWith('http') ? url : `https://panditji-1tf8.onrender.com${url}`;

    switch (msg.type) {
      case 'image':
        if (!msg.fileUrl) return <div className="text-sm italic text-gray-500">Image unavailable</div>;
        return <img src={getMediaUrl(msg.fileUrl)} alt="Sent content" className="max-w-[200px] md:max-w-[250px] rounded-lg mt-1 cursor-pointer hover:opacity-90" onClick={() => window.open(getMediaUrl(msg.fileUrl), '_blank')} />;
      case 'video':
        if (!msg.fileUrl) return <div className="text-sm italic text-gray-500">Video unavailable</div>;
        return <video src={getMediaUrl(msg.fileUrl)} controls className="max-w-[200px] md:max-w-[250px] rounded-lg mt-1" />;
      case 'audio':
        if (!msg.fileUrl) return <div className="text-sm italic text-gray-500">Audio unavailable</div>;
        return <audio src={getMediaUrl(msg.fileUrl)} controls className={`max-w-[200px] mt-1 ${isMine ? '[&::-webkit-media-controls-panel]:bg-orange-500 [&::-webkit-media-controls-panel]:text-white' : ''}`} />;
      default:
        return <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>;
    }
  };

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${isMine
        ? 'bg-orange-600 text-white rounded-br-sm'
        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
        }`}>
        {renderMessageContent(message)}
        <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-orange-200' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
