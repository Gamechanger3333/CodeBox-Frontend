import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

const ConversationsList = ({ onSelectConversation, conversationId }) => {
  const [conversationIds, setConversationIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversationIds();
  }, [conversationId]);

  const fetchConversationIds = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/getAllConversationIDs', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      const conversationIds = response.data.map((item) => item.id);
      setConversationIds(conversationIds);
    } catch (error) {
      console.error('Error fetching conversation IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/conversation/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      setConversationIds(conversationIds.filter((cid) => cid !== id));
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-auto custom-scrollbar mt-4 ml-1" style={{ height: '388px' }}>
      <ul>
        {loading ? (
          <div className='text-center'>
            Loading
          </div>
        ) : conversationIds.map((id) => (
          <li key={id} className='mt-2 mr-1 bg-gray-200 border-b-1 border-gray-400 text-black rounded'>
            <button onClick={() => onSelectConversation(id)}>
              Conversation {id.substring(0, 5)}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(id);
                }}
                className="ml-2 text-slate-500 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faTrash} className="fill-current w-4 h-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationsList;