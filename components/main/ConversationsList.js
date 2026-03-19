import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMessage } from '@fortawesome/free-solid-svg-icons';
import api from '@/app/api';
const ConversationsList = ({ onSelectConversation, conversationId }) => {
  const [conversationIds, setConversationIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversationIds();
  }, [conversationId]);

  const fetchConversationIds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/getAllConversationIDs');
      const ids = response.data.map((item) => item.id);
      setConversationIds(ids);
    } catch (error) {
      console.error('Error fetching conversation IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await api.delete(`/conversation/${id}`);
      setConversationIds(prev => prev.filter((cid) => cid !== id));
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-4">
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversationIds.length === 0) {
    return <p className="text-[#6b6b7b] text-xs text-center mt-4">No conversations yet</p>;
  }

  return (
    <div className="overflow-auto mt-1" style={{ height: '360px' }}>
      <ul className="space-y-1">
        {conversationIds.map((id) => (
          <li key={id}
            className={`group flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer transition ${
              id === conversationId
                ? 'bg-purple-600 text-white'
                : 'text-[#adadb8] hover:bg-[#ffffff10] hover:text-white'
            }`}
            onClick={() => onSelectConversation(id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FontAwesomeIcon icon={faMessage} className="text-xs flex-shrink-0" />
              <span className="text-xs truncate">Chat {id.substring(0, 8)}...</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConversation(id);
              }}
              className={`flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition hover:text-red-400 ${
                id === conversationId ? 'text-white' : 'text-[#6b6b7b]'
              }`}
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationsList;