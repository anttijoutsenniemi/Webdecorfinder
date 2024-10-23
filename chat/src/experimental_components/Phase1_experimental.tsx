import React, { useState, useEffect } from 'react';
import { ChatMessage, ChatOption, CompareObject, StyleObject } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';

interface Phase1Props {
  testArray: string[],
  navigate: any
}

const Phase1: React.FC<Phase1Props> = (props: Phase1Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingPhase, setTypingPhase] = useState<number | null>(null);
  const [typingMode, setTypingMode] = useState(false);
  const [historyStack, setHistoryStack] = useState<{ option: string, phase: number | null }[]>([]);

  useEffect(() => {
    // Restore state on navigation
    const phase = location.pathname.split('/')[1];
    switch (phase) {
      case 'phase1':
        setTypingPhase(1);
        break;
      case 'phase2':
        setTypingPhase(2);
        break;
      case 'phase3':
        setTypingPhase(3);
        break;
      default:
        setTypingPhase(1);
    }
  }, [location.pathname]);

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

  const navigationTest = () => {
    props.navigate();
    navigate('/phase2');
  }

  return (
    <div>
      <div>
        {props.testArray.map((message, index) => (
          <div key={index}>
            {message}
          </div>
        ))}
      </div>
      <div>
        <button onClick={() => handleOptionClick('Help me find suitable furniture for my style')}>Help me find suitable furniture for my style</button>
        <button onClick={() => handleOptionClick('Space described')}>Space described</button>
        <button style={{border: '1px'}} onClick={() => navigationTest()}>Navigate to 2</button>
        {/* Add more buttons for other options */}
      </div>
      {typingMode && <input type="text" onBlur={(e) => handleOptionClick(`Phase ${typingPhase} answer`, e.target.value)} />}
    </div>
  );
};

export default Phase1;
