import React, { useState, useEffect } from 'react';
import './../styles/inputfield.css';
import textRecommendations from './../assets/textRecommendations.json';

interface InputProps {
  receiveInput: any,
  typingPhase: number
}

const InputField: React.FC<InputProps> = (props) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if(props.typingPhase === 1){
      setOptions(textRecommendations.phase1space);
    }
    else {
      setOptions(textRecommendations.phase2style);
    }
  }, [props.typingPhase]);

  const handleSend = () => {
    props.receiveInput(input);
    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleOptionClick = (option: string) => {
    setInput((prevInput) => prevInput + " " + option);
  };

  return (
    <div className="input-container">
      <div className="compo-options-container">
        {options.map((option, index) => (
          <button 
            key={index} 
            className="compo-option-button" 
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className='typing-box-container'>
        <input
          maxLength={300}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-input"
          placeholder="Kirjoita tähän halutessasi..."
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend} className="send-button">
          Jatka
        </button>
      </div>
    </div>
  );
};

export default InputField;
