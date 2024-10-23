import React, { useState, useEffect } from 'react';
import { ChatMessage, ChatOption, CompareObject, StyleObject } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';

const Phase1: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingPhase, setTypingPhase] = useState<number | null>(null);
  const [typingMode, setTypingMode] = useState(false);
  const [historyStack, setHistoryStack] = useState<{ option: string, phase: number | null }[]>([]);

  // Function to handle option click, send next
  const handleOptionClick = (option: string, userMessage?: string, recommendations?: CompareObject[], botAnswr?: string) => {
    const newUserMessage: ChatMessage = { id: messages.length + 1, type: 'user', text: userMessage ? userMessage : option }; //ternary to post usermessage as bubble when user types and sends

    let botResponseText: string = 'I am not coded that far yet';  // Default response text
    let options: string[] = [];
    let imageUploadMode: boolean = false;
    let recommendationArray: CompareObject[] = [];

    switch (option) {
      case 'Help me find suitable furniture for my style':
        botResponseText = 'Great! Can you describe to me in your own words what kind of space you are designing?';
        setTypingPhase(1);
        setTypingMode(true);
        navigate('/phase1');
        break;
      case 'Space described':
        botResponseText = 'Got it! Can you next explain what kind of style you are looking for? (fe. colors and themes)';
        setTypingPhase(2);
        setTypingMode(true);
        navigate('/phase2');
        break;
      // Add more cases here
      default:
        break;
    }

    // Update messages
    setMessages(prevMessages => [...prevMessages, newUserMessage, { id: prevMessages.length + 2, type: 'chatbot', text: botResponseText }]);

    // Update history
    setHistoryStack(prevHistory => [...prevHistory, { option, phase: typingPhase }]);
  };

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id} className={message.type}>
            {message.text}
          </div>
        ))}
      </div>
      <div>
        <button onClick={() => handleOptionClick('Help me find suitable furniture for my style')}>Help me find suitable furniture for my style</button>
        <button onClick={() => handleOptionClick('Space described')}>Space described</button>
        <p>Tesintg 2</p>
        {/* Add more buttons for other options */}
      </div>
      {typingMode && <input type="text" onBlur={(e) => handleOptionClick(`Phase ${typingPhase} answer`, e.target.value)} />}
    </div>
  );
};

export default Phase1;
