// src/components/chat/ChatList.tsx
import React, { useState } from 'react';
import { MessageCircle, Users, Search, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatList: React.FC = () => {
  const { conversations, loading, selectUser, selectedUser, availableUsers } = useChat();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border-r h-full flex flex-col">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MessageCircle size={18} /> Conversations
        </h2>
        <button
          onClick={() => setShowUserSelector(!showUserSelector)}
          className="p-2 hover:bg-gray-200 rounded-full transition"
          title="New Conversation"
        >
          <Users size={18} className="text-blue-600" />
        </button>
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium text-gray-700">New Conversation</h3>
            <button
              onClick={() => setShowUserSelector(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredAvailableUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No users found</div>
            ) : (
              filteredAvailableUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    selectUser(user);
                    setShowUserSelector(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 transition border-b flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle size={40} className="mb-2" />
            <p>No conversations yet</p>
            <p className="text-sm">Click the icon to start chatting</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = selectedUser?._id === conv.user._id;
            return (
              <button
                key={conv.user._id}
                onClick={() => selectUser(conv.user)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition flex items-center justify-between ${
                  isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                    {conv.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 truncate">
                        {conv.user.name}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {conv.lastMessage?.createdAt 
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;