import React, { useState } from 'react';
import './../styles/inputfield.css';

interface InputProps {
    receiveInput: any
} 

const InputField: React.FC<InputProps> = (props) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    props.receiveInput(input);
    setInput('');
  };

  const handleKeyPress = (event : React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="input-container">
      <input
        maxLength={300}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="rounded-input"
        placeholder="Kirjoita tähän..."
        onKeyDown={handleKeyPress}
      />
      <button onClick={handleSend} className="send-button">
        Lähetä
      </button>
    </div>
  );
};

export default InputField;