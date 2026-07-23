import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import aiChatApi from '../../services/aiChatApi';
import './AiChatWidget.css';

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Xin chào! Tôi là **AI Trekking Assistant** 🏔️.\n\nTôi có thể giúp bạn:\n- Tìm tour phù hợp\n- Kiểm tra thời tiết\n- Gợi ý đồ cần mang\n\nBạn cần giúp gì?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'Gợi ý tour cho người mới',
    'Thời tiết tuần sau',
    'Cần chuẩn bị đồ gì?',
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSuggestions([]);
    setIsLoading(true);

    try {
      const response = await aiChatApi.sendMessage(text, sessionId);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }
      
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="ai-chat-container">
      {/* Nút Toggle */}
      <button className="ai-chat-toggle-btn" onClick={toggleChat}>
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <h3 className="ai-chat-title">
              <span>🤖</span> AI Assistant
            </h3>
            <button className="ai-chat-close-btn" onClick={toggleChat}>✕</button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="ai-typing-indicator">
                <div className="ai-typing-dot"></div>
                <div className="ai-typing-dot"></div>
                <div className="ai-typing-dot"></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý nhanh (Quick Replies) */}
          {!isLoading && suggestions.length > 0 && (
            <div className="ai-chat-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="ai-suggestion-chip"
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Khu vực nhập liệu */}
          <div className="ai-chat-input-area">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Nhập câu hỏi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              className="ai-chat-send-btn"
              onClick={() => handleSend(inputValue)}
              disabled={isLoading || !inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatWidget;
