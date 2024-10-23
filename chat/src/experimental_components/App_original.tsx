import React, { useState, useRef, useEffect } from 'react';
import InputField from '../components/InputField';
import './App.css';
import ImageCapture from '../components/ImageCapture';
import { fetchInterPretationWithReference } from '../components/Aihandler';
import { fetchFurnitureData } from '../components/ApiFetches';
import clientPublic from '../assets/clientPublic.json';
import ProductCard from '../components/Products';
import Modal from '../components/Modal';

export interface ChatMessage {
  id: number;
  type: 'user' | 'chatbot';
  text: string;
  recommendationArray?: CompareObject[],
  imageUploadMode?: boolean,
  options?: string[]; // Only present if type is 'chatbot'
}

export interface ChatOption {
  label: string;
}

export type StyleObject = {
  nonValidImage?: boolean;
  explanation?: string;
  colorThemes: {
    [key: string]: number;
  };
  designStyles: {
    [key: string]: number;
  };
};

export type CompareObject = {
  _id: any;
  picUrl: string;
  title: string;
  productUrl: string;
  quantity?: string;
  price?: string;
  deleted: boolean;
  styleJson: StyleObject;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial chat messages and options
    { id: 1, type: 'chatbot', text: 'Welcome! I am your Redecofinder assistant, here to help design your space with suitable furniture.', options: ['Help me find suitable furniture for my style'] },
  ]);
  const [furnitureClass, setFurnitureClass] = useState<string>('Chairs');
  const messageEnd = useRef<HTMLDivElement>(null);
  const [typingMode, setTypingMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [imagesSent, setImagesSent] = useState<boolean>(false);
  const [typingPhase, setTypingPhase] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string>("");
  const [refImage64, setRefImage64] = useState<string>("");
  const [refImage642, setRefImage642] = useState<string>("");
  const [refImage643, setRefImage643] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<null | CompareObject>(null);

  const openModal = (product : CompareObject) => {
    setModalOpen(true);
    setSelectedProduct(product);
  }
  const closeModal = () => setModalOpen(false);

  const scrollToBottom = () => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 

  //&_&
  const updateImage = (img64 : string) => {
    setImagesSent(false);
    //this is monkey solution but the updated state didnt render in an array based solution
    if(refImage64 && !refImage642){
      setRefImage642(img64);
    }
    else if(refImage642){
      setRefImage643(img64);
    }
    else{
      setRefImage64(img64);
    }

    setTimeout(() => { //timeout to let rendering happen first before autoscroll
      scrollToBottom();
    }, 50);
  }

  const uploadImage = async () => {
    try {
      setLoading(true);
      setImagesSent(true);
      let refImageArray : string[] = [refImage64, refImage642, refImage643];
      let userFilledData : string = chatHistory;
      let aiJson1 = await fetchInterPretationWithReference(userFilledData, refImageArray);
      let aiJson = JSON.parse(aiJson1);
      let botAnswr : string = aiJson.explanation;
  
      let arrayOfObjects = await fetchFurnitureData(furnitureClass);  
  
      // Function to flatten the object
      const flattenObject = (obj: StyleObject): number[] => {
        const colorThemes = obj.colorThemes ? Object.values(obj.colorThemes) : [];
        const designStyles = obj.designStyles ? Object.values(obj.designStyles) : [];
        return [...colorThemes, ...designStyles];
      };
  
      // Calculate Euclidean distance
      const calculateDistance = (obj1: StyleObject, obj2: StyleObject): number => {
        const values1 = flattenObject(obj1);
        const values2 = flattenObject(obj2);
        //console.log(values1, values2);
        return Math.sqrt(values1.reduce((sum, value, index) => sum + Math.pow(value - values2[index], 2), 0));
      };
  
      // Compute distances
        const distances = arrayOfObjects.map((obj : any, index : number) => {
          const distance = calculateDistance(aiJson, obj.styleJson);
          return {
            distance,
            object: obj
          };
        });
        //console.log(distances);
    
        // Sort by distance
        const sortedObjects = distances.sort((a : any, b : any) => a.distance - b.distance);
    
        // Select top 10 matches
        const top10Matches = sortedObjects.slice(0, 10).map((item : any) => item.object);
        setRecommendations(top10Matches);
        handleOptionClick('recommendations', 'Show me the recommendations please', top10Matches, botAnswr);
        //here next show the 10 results to user: handleoptionclick where images go to imagearray
        //add other elements to jsx like price and avaialabity
      
    } catch (error) {
      console.log(error);
    }
  }

  function getRandomElements(arr : any, count : number) {
    const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, count); // Get the first `count` elements
  }

  const getRandomRecommendations = async () => {
    let arrayOfObjects = await fetchFurnitureData(furnitureClass);
    let newArr = getRandomElements(arrayOfObjects, 10);
    handleOptionClick('recommendations', 'Show me the recommendations please', newArr, 'Here are some random recommendations as promised:')
  }

  // Function to handle option click, send next
  const handleOptionClick = (option: string, userMessage? : string, recommendations? : CompareObject[], botAnswr?: string) => {
    const newUserMessage: ChatMessage = { id: messages.length + 1, type: 'user', text: (userMessage) ? userMessage : option }; //ternary to post usermessage as bubble when user types and sends

    let botResponseText : string = 'I am not coded that far yet';  // Default response text
    let options : string[] = [];
    let imageUploadMode : boolean = false;
    let recommendationArray : CompareObject[] = [];
    switch (option) {
        case 'Help me find suitable furniture for my style':
            botResponseText = 'Great! Can you describe to me in your own words what kind of space you are designing?';
            setTypingPhase(1);
            setTypingMode(true);
            break;
        case 'Space described':
            botResponseText = 'Got it! Can you next explain what kind of style you are looking for? (fe. colors and themes)';
            setTypingPhase(2);
            setTypingMode(true);
            break;
        case 'Style explained':
            botResponseText = 'Noted, what type of furniture are you looking for? Here are some options to choose from: ';
            /* 
            Here we start with categories: 
            1. Chairs = työtuolit + neuvottelu-asiakastauolit
            2. Sofas, armchairs and stools = sohvat, nojatuolit ja rahit
            3. Storage furniture = säilytyskalusteet
            4. Tables = sohva ja pikkupöydät + sähköpöydät + työpöydät + neuvottelupöydät
            5. Conference sets = neuvotteluryhmät
            */
            options = ['Chairs', 'Sofas, armchairs and stools', 'Tables', 'Conference sets', 'Storage fruniture']
            break;
        case 'Add images':
            //code for opening camera
            botResponseText = "Add 1-3 reference image/images";
            imageUploadMode = true;
            options = ['Start again'];
            break;
        case 'recommendations':
            if(botAnswr && recommendations){ 
              botResponseText = botAnswr + " I found these recommendations best suited for your style:";
              recommendationArray = recommendations;
              setLoading(false);
            }
            else{
              botResponseText = 'I did not understand your selection.'
            }
            
            options = ['Start again'];
            break;
        case 'No thank you, give me random suggestions that I can browse straight away.':
            botResponseText = 'Alright, give me a second as I pick 10 table suggestions for you at random...';
            getRandomRecommendations();
            break;
        case 'Start again':
            botResponseText = 'Welcome! I am your Redecofinder assistant, here to help design your space with suitable furniture.';
            options = ['Help me find suitable furniture for my style'];
            break;
        default:
            //when user selects furniture category
            const categories = ['Chairs', 'Sofas, armchairs and stools', 'Tables', 'Conference sets', 'Storage furniture'];
            if(categories.includes(option)){
              const words = option.split(' ');
              const firstWord = words[0].toLowerCase();
              setFurnitureClass(firstWord);
              botResponseText = `Sure, lets find ${option.toLowerCase()} to your liking. Would you like to provide me with reference image/images that I can look at for inspiration?`;
              options = ['Add images', 'No thank you, give me random suggestions that I can browse straight away.'];
            }

            //default if user somehow fires function with no specific case
            else {
              botResponseText = 'I didnt understand your selection.';
              options = ['Start again'];
            }
            break;
    }

    const newBotMessage: ChatMessage = {
        id: messages.length + 2,
        type: 'chatbot',
        text: botResponseText,
        imageUploadMode: imageUploadMode,
        recommendationArray: recommendationArray,
        options: options
    };

    setMessages([...messages, newUserMessage, newBotMessage]);
};

function toggleDrawer() {
  const drawer : any = document.getElementById('drawer');
  drawer.classList.toggle('open');
}

//func for receiving input from user typing
const receiveInput = (input : string) => {
  if(input.length < 1 || !input){
    setErrorMessage("Im sorry but I do not understand empty messages");
  }
  else{
    //typingPhase tells us to which part of the ai dialog this input is used for 1=describe the space, 2=describe style, 3=needs
    if(typingPhase === 1){
      setChatHistory('1. User describing space: ' + input);
      handleOptionClick('Space described', input);
      setErrorMessage('');
    }
    else if(typingPhase === 2){
      setChatHistory(prevHistory => prevHistory + '2. User describing style he/she is looking for: ' + input);
      handleOptionClick('Style explained', input);
      setTypingMode(false);
      setErrorMessage('');
    }
    else if(typingPhase === 3){
      setChatHistory(prevHistory => prevHistory + '3. User describing needs for the furniture: ' + input);
      setTypingPhase(0);
      setTypingMode(false);
      setErrorMessage('');
    }
  }
}

const handleProductClick = (index: number, productUrl: string) => {

}

  return (
    <div className="chat-app-background">
    <div className='screen-wrapper'>
    <div className='app-header'><h1 className='header-title'>ReDecoFinder assistant</h1>
        <div className='hamburger-menu' onClick={()=>toggleDrawer()}>
          &#9776;
        </div>
        </div>
        <div className='drawer' id='drawer'>
        <button className='close-button' onClick={()=>toggleDrawer()}>Close &times;</button>
          <a href={clientPublic.webStoreUrl}>
            <div className='modal-option-button' style={{color: 'white', marginTop: 10}}>Open {clientPublic.webStoreName} ecom store</div>
          </a>
        </div>
      <div className="chat-wrapper">
      {messages.map((message) => (
      <div key={message.id} className={`chat-message ${message.type}`}>
        {message.type === 'chatbot' && (
          <div className="chat-content">
            <img src="/icon.png" alt="Chatbot" className="chatbot-profile" />
            <div>
              <div className="chat-bubble" ref={messageEnd}>{message.text}</div>

              { //paste recommendation products
                message.recommendationArray && message.recommendationArray.length > 0 && (
                  <>
                    <ProductCard products={message.recommendationArray} onCardClick={openModal}/>
                    <Modal title='Select from options below' product={selectedProduct} isOpen={modalOpen} onClose={closeModal}/>
                  </>
                )
              }

              { //paste imageupload compo
                message.imageUploadMode &&
                (
                  <div style={{ flexDirection: 'column', marginTop: 10 }}>
                  
                  { refImage64 && (
                    <img src={refImage64} alt="Captured" style={{marginTop: 10, marginBottom: 10, maxWidth: 200}}/>
                  )}
                  { refImage642 && (
                    <img src={refImage642} alt="Captured" style={{marginTop: 10, marginBottom: 10, maxWidth: 200}}/>
                  )}
                  { refImage643 && (
                    <img src={refImage643} alt="Captured" style={{marginTop: 10, marginBottom: 10, maxWidth: 200}}/>
                  )}
                  { !refImage643 && !imagesSent && (
                    <div style={{marginTop: 10}}><ImageCapture updateImage={updateImage}/></div>
                  )}
                  { (refImage64 && !imagesSent)
                  ? <button style={{marginTop: 20}} className='green-upload-button' onClick={() => uploadImage()}>Send image/images</button>
                  : null
                  }
                  <div ref={messageEnd}></div>
                  </div>
                )
              }

              {
                (message.options && message.id === messages.length) //only render options on the last message so user cant click previous options
                ? 
                <>
                  <div className="chat-options">
                    {message.options.map((option, index) => (
                      <button key={index} onClick={() => handleOptionClick(option)}>
                        {option}
                      </button>
                    ))}
                  </div>
                </>
                : null
              }
            </div>
          </div>
        )}
        {message.type === 'user' && (
          <div className="chat-content">
            <div className="chat-bubble">{message.text}</div>
          </div>
        )}
      </div>
    ))}
      {loading && ( 
        <div><p>Hold on tight as I analyze your data and find best furniture for your style...</p></div>
      )}
      {errorMessage && (
        <div><p style={{color: 'red'}}>{errorMessage}</p></div>
      )}
      {typingMode && (
        <InputField receiveInput={receiveInput} typingPhase={1}/>
      )}
      
      </div>
      </div>
    </div>
  );
};

export default App;