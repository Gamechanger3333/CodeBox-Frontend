import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Typing from '@/components/main/Typing';
import Cookies from 'js-cookie';

const ChatWindow = ({ conversationId, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessagesForConversation(conversationId);
    }
  }, [conversationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const newMessage = {
        sender: "user",
        content: text,
      };
      setMessages([...messages, newMessage]);
      setText('');

      const response = await axios.post(`http://localhost:5000/api/send_message`, {
        conversationId,
        message: text,
        sender: "user",
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });

      const newMessagefrombot = {
        sender: "bot",
        content: response.data.response,
      };
      console.log(response.data.response);
      setMessages([...messages, newMessage, newMessagefrombot]);
      onNewMessage(newMessage);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const fetchMessagesForConversation = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/get_conversation/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      const data = response.data;
      const messages = data.conversation.messages.map((message) => {
        if (message.sender === 'user') {
          return { sender: 'user', content: message.content };
        } else {
          return { sender: 'bot', content: message.content };
        }
      });
      setMessages(messages);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching messages for conversation ${id}:`, error);
      setError(error);
      setLoading(false);
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div>
      {!conversationId && (
        <div>
          <div className='text-center m-64 text-2xl'>Welcome to the CodexBox</div>
          <form onSubmit={handleSubmit} className="fixed ml-4 bottom-0 w-full p-4 bg-gray-100 flex items-center">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={sending ? "Sending..." : "Write something here..."}
              className="w-full min-[320px] sm:w-80 md:w-2/4 lg:w-2/3 xl:w-8/12 p-2 border rounded-l-md focus:outline-none"
              disabled={sending}
            />
            <button type='submit' className={`p-2 ${sending ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-slate-500 text-white hover:bg-slate-600'}`} disabled={sending}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      )}
      {loading ? (
        <div className='text-center m-64 text-2xl'>Loading</div>
      ) : (
        <div className="chat-window custom-scrollbar mb-24">
          {messages.length > 0 ? (messages.map((message, index) => (
            <div key={index} className="mb-4 p-4 bg-white shadow-md rounded-md mt-4">
              <span style={{ fontWeight: 'bold' }}>
                {message.sender === 'user' ? 'You : ' : 'Bot : '}
              </span>
              {message.content}
            </div>
          ))) : (<div className='text-center m-64 text-2xl'>No messages yet</div>)}
          {sending ? <Typing /> : null}
          <div ref={messagesEndRef}></div>
        </div>
      )}
      {error && <div>Error: {error.message}</div>}
      <form onSubmit={handleSubmit} className="fixed ml-4 bottom-0 w-full p-4 bg-gray-100 flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={sending ? "Sending..." : "Write something here..."}
          className="w-full min-[320px] sm:w-80 md:w-2/4 lg:w-2/3 xl:w-8/12 p-2 border rounded-l-md focus:outline-none"
          disabled={sending}
        />
        <button type='submit' className={`p-2 ${sending ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-slate-500 text-white hover:bg-slate-600'}`} disabled={sending}>
          <FontAwesomeIcon icon={faPaperPlane} className="icon-lg" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;