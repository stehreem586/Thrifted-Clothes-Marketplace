import React, { useState } from 'react';
import EmojiButton from '../EmojiButton/EmojiButton';
import AttachmentButton from '../AttachmentButton/AttachmentButton';
import SendButton from '../SendButton/SendButton';
import './ChatInput.css';

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = () => {
    setText(prev => prev + '😊');
  };

  const handleAttachmentClick = () => {
    alert('Attachment feature is coming soon!');
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <AttachmentButton onClick={handleAttachmentClick} />
      <EmojiButton onClick={handleEmojiClick} />
      <div className="input-field-container">
        <input
          type="text"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-text-input"
        />
      </div>
      <SendButton disabled={!text.trim()} />
    </form>
  );
};

export default ChatInput;
