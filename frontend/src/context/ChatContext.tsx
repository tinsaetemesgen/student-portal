// src/context/ChatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getSocket, initializeSocket } from '../services/socket';
import axios from 'axios';

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

interface Conversation {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  selectedUser: Conversation['user'] | null;
  availableUsers: Conversation['user'][];
  sendMessage: (receiverId: string, content: string) => void;
  selectUser: (user: Conversation['user']) => void;
  loadMessages: (userId: string) => void;
  markAsRead: (senderId: string) => void;
  fetchAvailableUsers: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<Conversation['user'] | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Conversation['user'][]>([]);

  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;

    // Listen for new messages
    socket.on('message:received', (newMessage: Message) => {
      console.log('📩 New message received:', newMessage);
      
      if (selectedUser && newMessage.senderId._id === selectedUser._id) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.user._id === newMessage.senderId._id) {
            return {
              ...conv,
              lastMessage: newMessage,
              unreadCount: conv.unreadCount + 1,
            };
          }
          return conv;
        });
        return updated;
      });
    });

    socket.on('message:sent', (sentMessage: Message) => {
      console.log('✅ Message sent:', sentMessage);
      setMessages(prev => [...prev, sentMessage]);
    });

    socket.on('message:read', (data: { userId: string }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.senderId._id === data.userId) {
          return { ...msg, isRead: true };
        }
        return msg;
      }));
    });

    socket.on('message:unread', (data: { count: number }) => {
      console.log('📊 Unread count:', data.count);
    });

    fetchConversations();
    fetchAvailableUsers();

    return () => {
      socket.off('message:received');
      socket.off('message:sent');
      socket.off('message:read');
      socket.off('message:unread');
    };
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:7000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

 const fetchAvailableUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:7000/api/messages/users/available', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAvailableUsers(response.data.data || []);
  } catch (error) {
    console.error('Error fetching available users:', error);
  }
};

  const loadMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:7000/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data || []);
      markAsRead(userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = (receiverId: string, content: string) => {
    const socket = getSocket();
    if (!socket) {
      console.error('❌ Socket not connected');
      return;
    }
    socket.emit('message:send', { receiverId, content });
  };

  const selectUser = (user: Conversation['user']) => {
    setSelectedUser(user);
    if (user) {
      loadMessages(user._id);
    }
  };

  const markAsRead = (senderId: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:read', { senderId });
    
    setConversations(prev => prev.map(conv => {
      if (conv.user._id === senderId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      messages,
      loading,
      selectedUser,
      availableUsers,
      sendMessage,
      selectUser,
      loadMessages,
      markAsRead,
      fetchAvailableUsers,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};