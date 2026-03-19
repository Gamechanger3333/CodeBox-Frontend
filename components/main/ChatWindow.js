import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Typing from '@/components/main/Typing';
import api from '@/app/api';

const ChatWindow = ({ conversationId, onNewMessage, onConversationCreated }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessagesForConversation(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending || !text.trim()) return;
    setSending(true);
    const messageText = text;
    setText('');

    try {
      let currentConversationId = activeConversationId;

      // ✅ Auto-create conversation if none exists
      if (!currentConversationId) {
        const convResponse = await api.post('/start_conversation', {});
        currentConversationId = convResponse.data.conversationId;
        setActiveConversationId(currentConversationId);
        if (onConversationCreated) onConversationCreated(currentConversationId);
      }

      const newMessage = { sender: "user", content: messageText };
      setMessages(prev => [...prev, newMessage]);

      const response = await api.post('/send_message', {
        conversationId: currentConversationId,
        message: messageText,
        sender: "user",
      });

      const botMessage = { sender: "bot", content: response.data.response };
      setMessages(prev => [...prev, botMessage]);
      if (onNewMessage) onNewMessage(newMessage);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        sender: "bot",
        content: "Sorry, something went wrong. Please try again."
      }]);
    } finally {
      setSending(false);
    }
  };

  const fetchMessagesForConversation = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/get_conversation/${id}`);
      const fetched = response.data.conversation.messages.map((msg) => ({
        sender: msg.sender === 'user' ? 'user' : 'bot',
        content: msg.content,
      }));
      setMessages(fetched);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0e0e10]">
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-10 lg:px-20 xl:px-40 pt-6 pb-32">
        {!activeConversationId && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Welcome to CodeBox</h2>
            <p className="text-[#adadb8] text-sm">Type a message below to start chatting!</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#adadb8] text-sm">No messages yet. Say something!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
                  </svg>
                </div>
              )}
              <div className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-[#18181b] text-[#dedee3] border border-[#3d3d3f] rounded-bl-sm'
              }`}>
                {message.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start mb-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
            </div>
            <div className="bg-[#18181b] border border-[#3d3d3f] rounded-2xl rounded-bl-sm px-4 py-3">
              <Typing />
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-400 text-xs mt-2">Failed to load messages</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-[#0e0e10] border-t border-[#3d3d3f] px-3 sm:px-6 py-3">
        <form onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-[#18181b] border border-[#3d3d3f] rounded-xl px-4 py-2 focus-within:border-purple-500 transition">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sending ? "CodeBox is thinking..." : "Write something here..."}
            disabled={sending}
            className="flex-1 bg-transparent text-white text-sm placeholder-[#6b6b7b] focus:outline-none disabled:opacity-50"
          />
          <button type="submit" disabled={sending || !text.trim()}
            className="w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:bg-[#3d3d3f] disabled:cursor-not-allowed rounded-lg transition flex-shrink-0">
            <FontAwesomeIcon icon={faPaperPlane} className="text-white text-xs" />
          </button>
        </form>
        <p className="text-center text-[#6b6b7b] text-xs mt-1.5">Press Enter to send</p>
      </div>
    </div>
  );
};

export default ChatWindow;