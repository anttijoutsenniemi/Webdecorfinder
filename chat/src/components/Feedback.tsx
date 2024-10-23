import React, { useState, useEffect } from 'react';
import './../styles/inputfield.css';

interface InputProps {
  receiveInput: (success: boolean, feedback?: string) => void,
}

const Feedback: React.FC<InputProps> = (props) => {
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleClick = (value: boolean) => {
    setIsActive(value);
  };

  const handleSend = () => {
    props.receiveInput(isActive, input);
    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="input-container">
      <div className='feedback-buttons-container'>
        <button
            className={`feedback-button ${isActive === true ? 'active' : ''}`}
            onClick={() => handleClick(true)}
        >
            Kyllä
        </button>
        <button
            className={`feedback-button ${isActive === false ? 'active' : ''}`}
            onClick={() => handleClick(false)}
        >
            Ei
        </button>
      </div>
      <div className='typing-box-container'>
        <input
          maxLength={300}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-input"
          placeholder="Kirjoita tähän lisäpalautetta halutessasi..."
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend} className="send-button">
          Lähetä
        </button>
      </div>
    </div>
  );
};

export default Feedback;
