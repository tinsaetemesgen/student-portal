// src/components/chat/ChatWindow.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, MoreVertical, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { getSocket } from '../../services/socket';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  receiverId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

const ChatWindow: React.FC = () => {
  const { messages, selectedUser, sendMessage } = useChat();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Get current user ID
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?._id;

  // ✅ Debug: Log selected user when it changes
  useEffect(() => {
    if (selectedUser) {
      console.log('🔄 Selected User Changed:', {
        id: selectedUser._id,
        name: selectedUser.name,
        role: selectedUser.role,
        currentUserId: userId,
        isSelf: selectedUser._id === userId
      });
    }
  }, [selectedUser, userId]);

  // ✅ Sync localMessages with context messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // ✅ Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // ✅ Listen for incoming messages
    socket.on('message:received', (newMessage: Message) => {
      console.log('📩 New message received:', newMessage);
      if (selectedUser && newMessage.senderId._id === selectedUser._id) {
        setLocalMessages(prev => [...prev, newMessage]);
      }
    });

    // ✅ Listen for sent message confirmation
    socket.on('message:sent', (sentMessage: Message) => {
      console.log('✅ Message sent:', sentMessage);
      setLocalMessages(prev => [...prev, sentMessage]);
    });

    // ✅ Listen for typing indicators
    socket.on('typing:start', (data: { userId: string }) => {
      if (data.userId === selectedUser?._id) {
        setTypingUser(data.userId);
      }
    });

    socket.on('typing:stop', (data: { userId: string }) => {
      if (data.userId === selectedUser?._id) {
        setTypingUser(null);
      }
    });

    socket.on('message:error', (error: any) => {
      console.error('❌ Socket error:', error);
      alert(error.error || 'Failed to send message');
    });

    return () => {
      socket.off('message:received');
      socket.off('message:sent');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('message:error');
    };
  }, [selectedUser]);

  // ✅ Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Handle sending message
  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser) {
      console.warn('⚠️ Cannot send: no message or no user selected');
      return;
    }

    // ✅ Debug logs
    console.log('📤 Sending Message Debug:');
    console.log('  - Current User ID:', userId);
    console.log('  - Selected User ID:', selectedUser._id);
    console.log('  - Selected User Name:', selectedUser.name);
    console.log('  - Are they the same?', selectedUser._id === userId);

    // ✅ Prevent self-messaging
    if (selectedUser._id === userId) {
      alert('❌ You cannot send a message to yourself');
      console.error('❌ Self-messaging prevented');
      return;
    }

    // ✅ Send the message
    sendMessage(selectedUser._id, newMessage.trim());
    setNewMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { receiverId: selectedUser._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', { receiverId: selectedUser._id });
    }, 1000);
  };

  // ✅ If no user selected, show placeholder
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <MessageCircle size={48} className="mb-4" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm">Choose someone to start chatting</p>
      </div>
    );
  }

  const isTypingIndicator = typingUser === selectedUser._id;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{selectedUser.name}</p>
            <p className="text-xs text-gray-400 capitalize">{selectedUser.role.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Phone size={18} className="text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreVertical size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          localMessages.map((msg) => {
            const isMine = msg.senderId?._id === userId;
            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-lg px-4 py-2 ${
                    isMine
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-800'
                  }`}>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && (
                      <span>
                        {msg.isRead ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTypingIndicator && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg px-4 py-2 text-sm text-gray-500">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleTyping}
            placeholder={`Message ${selectedUser.name}...`}
            className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-lg transition ${
              newMessage.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;