import React, { useState, useEffect } from 'react';
import './../styles/numberPicker.css';
import numberArray from './../assets/numberArray.json';

interface InputProps {
  receiveInput: any,
}

const NumberPicker: React.FC<InputProps> = (props) => {
  const [input, setInput] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const options = numberArray;

  const handleSend = () => {
    props.receiveInput(input);
    setInput(0);
  };

  const handleOptionClick = (option: number | string) => {
    if(option === ''){
        setInput(0);
    }
    else if(option === "50+"){ // if user want 50+ products we have to send number to next function so we send 51 and handle that
      setInput(51);
    }
    else if(typeof option === 'number'){
        setInput(option);
    }
    setSelectedOption(option);
   
  };

  return (
    <div className="number-input-container">
      <div className="number-options-container">
        {options.map((option : number | string, index : number) => (
          <button 
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`number-option-button ${selectedOption === option ? 'selected' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className='number-typing-box-container'>
        <button onClick={handleSend} className="number-send-button">
          Jatka
        </button>
      </div>
    </div>
  );
};

export default NumberPicker;
