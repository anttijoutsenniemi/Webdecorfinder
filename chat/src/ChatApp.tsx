import React, { useState, useRef, useEffect } from 'react';
import InputField from './components/InputField';
import './App.css';
import ImageCapture from './components/ImageCapture';
import { fetchInterPretationForWebSearch } from './components/Aihandler';
import { sendSerperQuery } from './components/ApiFetches';
import furnitureCategories from './assets/furnitureCategories.json';
import ProductCard from './components/Products';
import Modal from './components/Modal';
import { AppStates } from './App';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { quantum } from 'ldrs';
import type {} from 'ldrs';
import CustomButton from './components/BackButton';
quantum.register();

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

interface ChildComponentProps {
  appStates: AppStates;
  navigateHandler: (sourcePhase: number) => void;
  phaseNumber: number;
  setModalOpen: (value: boolean) => void;
  setTypingMode: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setFurnitureClass: (furnitureClass: string) => void;
  setImagesSent: (value: boolean) => void;
  setTypingPhase: (value: number) => void;
  setChatHistory?: (updater: (prevHistory: string[]) => string[]) => void;
  setChatHistoryDirect: (value: string[]) => void;
  setErrorMessage: (value: string) => void;
  setRecommendations: (value: string) => void;
  setRefImage64: (value: string) => void;
  setRefImage642: (value: string) => void;
  setRefImage643: (value: string) => void;
  setSelectedProduct: (product: null | CompareObject) => void;
  setSpaceImageMode: (value: boolean) => void;
  setAiJson: (value: any) => void;
  setCity: (value: string) => void;
  setShowNumberPicker: (value: boolean) => void;
  setQuantityNumber: (value : number) => void;
  setFetchProductsAgain: (value: boolean) => void;
  setFeedbackMode: (value: boolean) => void;
  setWebSearchMode: (value: boolean) => void;
}

const ChatApp: React.FC<ChildComponentProps> = ({ appStates, navigateHandler, phaseNumber, setModalOpen, setTypingMode, setLoading, setMessages, setFurnitureClass,
  setImagesSent, setTypingPhase, setChatHistoryDirect, setErrorMessage, setRecommendations,
  setRefImage64, setRefImage642, setRefImage643, setSelectedProduct, setSpaceImageMode, setAiJson, setCity, setShowNumberPicker, setQuantityNumber, setFetchProductsAgain,
  setFeedbackMode, setWebSearchMode
}) => {
  const [currentPhase, setCurrentPhase] = useState<number>(0);

  const location = useLocation();
  const navigate = useNavigate();

  const openModal = (product : CompareObject) => {
    setModalOpen(true);
    setSelectedProduct(product);
  }
  const closeModal = () => setModalOpen(false);

  const scrollToBottom = () => {
    appStates.messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [appStates.messages]);

  //this updates the currentphase so we can display go back arrow
  useEffect(() => {
    let urlPath = location.pathname;
    let lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
    let number = Number(lastSegment);
    setCurrentPhase(number);
  }, [location]); 

  const navigateBack = () => {
    navigate(-1);
  }

  //&_&
  const updateImage = (img64 : string) => {
    setImagesSent(false);
    //this is monkey solution but the updated state didnt render in an array based solution
    if (!appStates.refImage64 || appStates.refImage64 === '') {
      setRefImage64(img64);
    } else if (!appStates.refImage642 || appStates.refImage642 === '') {
      setRefImage642(img64);
    } else {
      setRefImage643(img64);
    }

    setTimeout(() => { //timeout to let rendering happen first before autoscroll
      scrollToBottom();
    }, 50);
  }

  const initiateWebSearch = async () => {
    try {
      setWebSearchMode(false);
      let refImageArray : string[] = [];
      if (appStates.refImage64) {
        refImageArray.push(appStates.refImage64);
      }
      if (appStates.refImage642) {
        refImageArray.push(appStates.refImage642);
      }
      if (appStates.refImage643) {
        refImageArray.push(appStates.refImage643);
      }
      let queryObject = await fetchInterPretationForWebSearch(refImageArray, appStates.furnitureClass);
      if(typeof queryObject === 'string'){
        queryObject = JSON.parse(queryObject);
      }
      let newQuery : string = queryObject.webSearchQuery + ", " + appStates.city;
      let recommendations = await sendSerperQuery(newQuery);
      //console.log(recommendations);

      if(recommendations && queryObject){
        let botAnswr : string = queryObject.explanation;
        let top12matches = recommendations.slice(0, 12);
        handleOptionClick('suositukset', 'Voisitko näyttää minulle kalustesuositukset?', top12matches, botAnswr);
      }
      else {
        setLoading(false);
        alert('Error occured fetching products from web');
      }
      
      //this needs to also be done for random products function
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert('Error occured searching from web');
    }
  }

  const uploadImage = async (furnitureClass? : string, fetchFromNew? : boolean) => {
    try {
      setLoading(true);
      setImagesSent(true);

      if(appStates.webSearchMode){
        initiateWebSearch();
        return;
      }
  
    } catch (error) {
      console.log(error);
      setErrorMessage('An unexpected error occured fetching AI response');
    }
  }

  // Function to handle option click, send next
  const handleOptionClick = (option: string, userMessage? : string, recommendations? : CompareObject[], botAnswr?: string) => {
    const newUserMessage: ChatMessage = { id: appStates.messages.length + 1, type: 'user', text: (userMessage) ? userMessage : option }; // ternäärinen ehto lähettää käyttäjän viestin kuplana, kun käyttäjä kirjoittaa ja lähettää

    let botResponseText : string = 'Hetkinen...';  // Oletusvastausteksti, korvataan tapauskohtaisesti
    let options : string[] = [];
    let imageUploadMode : boolean = false;
    let recommendationArray : CompareObject[] = [];
    let nextPageNumber : number;
    switch (option) {
          case '1. Etsi kalusteita verkosta':
            setWebSearchMode(true);
            nextPageNumber = phaseNumber + 1;
            setTimeout(() => { //this wont work without timeout for some reason
              handleOptionClick('1. Etsi kalusteita käyttämällä kuvia tilasta', 'Etsi kalusteita verkosta');
            }, 50);
            break;
          case '1. Etsi kalusteita käyttämällä kuvia tilasta':
            botResponseText = 'Hienoa, aloitetaan! Mikä on lähin kaupunkisi? Tämä auttaa minua etsimään kalusteita läheltä sinua.';
            setTypingPhase(1);
            setTypingMode(true);
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Kaupunki kysytty':
            botResponseText = 'Selvä, entä minkä tyyppisiä kalusteita etsitään?';
            let newCategories : string[] = furnitureCategories.withNumbers;
            options = newCategories;
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Lisää kuva/kuvia tilasta':
            botResponseText = "Lisää 1-3 kuvaa tilasta";
            setSpaceImageMode(true);
            imageUploadMode = true;
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Ei tuotteita':
            setLoading(false);
            botResponseText = "Näyttää siltä, ettei valitsemastasi kategoriasta löytynyt tällä hetkellä tarpeeksi käytettyjä tuotteita. Ne saattavat olla loppuunmyytyjä, ja saatat löytää niitä kokeilemalla myöhemmin uudestaan. Haluaisitko etsiä saman kategorian kalusteita uusista tuotteista?";
            options = ['Aloita alusta', 'Etsitään uusista tuotteista']
            nextPageNumber = phaseNumber + 1;
            break;
        case 'suositukset':
            if(botAnswr && recommendations){ 
              botResponseText = botAnswr + " Löysin nämä alla olevat suositukset, jotka sopivat mielestäni parhaiten tyyliisi. Jos suositukset eivät tällä kertaa osuneet kohdalleen, voimme myös halutessasi etsiä uusista tuotteista tai eri kategoriasta!";
              recommendationArray = recommendations;
              setLoading(false);
            }
            else{
              botResponseText = 'En ymmärtänyt valintaasi.'
            }
            
            options = ['Aloita alusta'];
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Aloita alusta':
            botResponseText =  'Tervetuloa! Olen Webdecorfinder AI-avustajasi, ja autan sinua suunnittelemaan tilaasi sopivilla netistä löydetyillä kalusteilla.';
            options = ['1. Etsi kalusteita verkosta'];
            nextPageNumber = phaseNumber + 1;
            break;
        default:
            //kun käyttäjä valitsee kalustekategorian
            const categories = furnitureCategories.withoutNumbers;
            const categories2 = furnitureCategories.withNumbers;

            if(categories.includes(option)){
              //this is the old way of doing it
              // const words = option.split(' ').filter(word => /^[A-Za-z,]+$/.test(word));
              // const firstWord = words[0].replace(/[^A-Za-z]/g, '').toLowerCase();

              let normalized = option.toLowerCase();
              //Remove leading numbers (if any) followed by a period and space
              normalized = normalized.replace(/^\d+\.\s*/, '');
              //Replace Nordic characters with their ASCII equivalents
              normalized = normalized
              .replace(/ä/g, 'a')
              .replace(/ö/g, 'o')
              .replace(/å/g, 'a')
              .replace(/ü/g, 'u');
              //Remove special characters except spaces and hyphens
              normalized = normalized.replace(/[^\w\s-]/g, '');
              //Replace spaces with underscores
              let identifier = normalized.replace(/\s+/g, '_');

              setFurnitureClass(identifier);
              // if(appStates.aiJson){ //commented 19.9 because amount will have to be asked again
              //   uploadImage(identifier);
              //   nextPageNumber = phaseNumber + 1;
              // }
              // else{
                botResponseText = `Selvä, etsitään kategoriasta: ${option.toLowerCase()} toiveittesi mukaan. Etsimmmekö vähintään tiettyä määrää kalusteita?`;
                setShowNumberPicker(true);
                nextPageNumber = phaseNumber + 1;
              // }
            }
            else if(categories2.includes(option)){
              let normalized = option.toLowerCase();
              //Remove leading numbers (if any) followed by a period and space
              normalized = normalized.replace(/^\d+\.\s*/, '');
              //Replace Nordic characters with their ASCII equivalents
              normalized = normalized
              .replace(/ä/g, 'a')
              .replace(/ö/g, 'o')
              .replace(/å/g, 'a')
              .replace(/ü/g, 'u');
              //Remove special characters except spaces and hyphens
              normalized = normalized.replace(/[^\w\s-]/g, '');
              //Replace spaces with underscores
              let identifier = normalized.replace(/\s+/g, '_');
              setFurnitureClass(identifier);
              botResponseText = `Selvä, etsitään kategoriasta: ${option.toLowerCase()} toiveittesi mukaan. Viimeisenä pyytäisin kuvia tilastasi jotta osaan etsiä siihen sopivia kalusteita.`;
              if(appStates.webSearchMode){
                options = ['Lisää kuva/kuvia tilasta'];

              }
              else{
                options = ['Lisää kuva/kuvia tilasta', 'Etsitään satunnaisia suosituksia'];
              }
              nextPageNumber = phaseNumber + 1;
            }

            //oletusarvo, jos käyttäjä jollain tapaa suorittaa toiminnon ilman tiettyä tapausta
            else {
              botResponseText = 'Valinnan käsittelyssä tapahtui virhe';
              options = ['Aloita alusta'];
              nextPageNumber = 0;
            }
            break;
    }


    const newBotMessage: ChatMessage = {
        id: appStates.messages.length + 2,
        type: 'chatbot',
        text: botResponseText,
        imageUploadMode: imageUploadMode,
        recommendationArray: recommendationArray,
        options: options
    };

    setMessages([...appStates.messages, newUserMessage, newBotMessage]);

    if(nextPageNumber === 0){
      navigate('/');
    }
    else {
      navigateHandler(phaseNumber);
      navigate(`/${nextPageNumber}`);
    }
};

function toggleDrawer() {
  const drawer : any = document.getElementById('drawer');
  drawer.classList.toggle('open');
}

const openProductInStore = (product: CompareObject) => {
  const url = product.productUrl;

  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    window.open(url, "_blank"); // Opens the URL in a new tab
  } else {
    console.error("Invalid URL:", url);
    alert('Tuote on poistunut tai linkki on epäkelpo');
  }
};

//func for receiving input from user typing
const receiveInput = (input : string) => {
  if(input.length < 1 || !input){
    setErrorMessage("Im sorry but I do not understand empty messages");
  }
  else{
    //typingPhase tells us to which part of the ai dialog this input is used for 1=describe city
    let historyArrayMessages : string[] = appStates.chatHistory;
    if(appStates.typingPhase === 1){
      historyArrayMessages[0] = '1. User describing city: ' + input;
      setChatHistoryDirect(historyArrayMessages);
      setCity(input);
      handleOptionClick('Kaupunki kysytty', input);
      setTypingMode(false);
      setErrorMessage('');
    }
  }
}

  return (
    <div className="chat-app-background">
    <div className='screen-wrapper'>
    <div className='app-header'><h1 className='header-title'>WebDecorFinder avustaja</h1>
        <div className='hamburger-menu' onClick={()=>toggleDrawer()}>
          &#9776;
        </div>
        </div>
        <div className='drawer' id='drawer'>
        <button className='close-button' onClick={()=>toggleDrawer()}>Sulje &times;</button>
          <a href="https://www.google.fi">
            <div className='modal-option-button' style={{color: 'white', marginTop: 10}}>Avaa Google</div>
          </a>
        </div>
      <div className="chat-wrapper">
      {appStates.messages.map((message) => (
      <div key={message.id} className={`chat-message ${message.type}`}>
        {message.type === 'chatbot' && (
          <div className="chat-content">
            {/* <img src="/icon.png" alt="Chatbot" className="chatbot-profile" /> removed 19.9.24*/}
            <div>
              <div className="chat-bubble" ref={appStates.messageEnd}>{message.text}</div>

              { //paste recommendation products
                message.recommendationArray && message.recommendationArray.length > 0 && (
                  <>
                    <ProductCard products={message.recommendationArray} onCardClick={openProductInStore} />
                    <Modal title='Select from options below' product={appStates.selectedProduct} isOpen={appStates.modalOpen} onClose={closeModal}/>
                  </>
                )
              }

              { //paste imageupload compo
                message.imageUploadMode &&
                (
                  <div style={{ flexDirection: 'column', marginTop: 10 }}>
                  { appStates.refImage64 && (
                    <div className="x-image-container">
                      <img src={appStates.refImage64} alt="Captured" style={{ maxWidth: 200 }} />
                      <button
                        className="x-image-button"
                        onClick={() => setRefImage64('')}
                      >
                        X
                      </button>
                    </div>
                  )}
                  { appStates.refImage642 && (
                    <div className="x-image-container">
                      <img src={appStates.refImage642} alt="Captured" style={{ maxWidth: 200 }} />
                      <button
                        className="x-image-button"
                        onClick={() => setRefImage642('')}
                      >
                        X
                      </button>
                    </div>
                  )}
                  { appStates.refImage643 && (
                    <div className="x-image-container">
                      <img src={appStates.refImage643} alt="Captured" style={{ maxWidth: 200 }} />
                      <button
                        className="x-image-button"
                        onClick={() => setRefImage643('')}
                      >
                        X
                      </button>
                    </div>
                  )}
                  {((appStates.refImage64 && appStates.refImage642 && appStates.refImage643) || appStates.imagesSent)
                    ? null
                    : <div style={{marginTop: 10}}><ImageCapture updateImage={updateImage}/></div>
                  }
                  { (appStates.refImage64 && !appStates.imagesSent)
                  ? <div style={{float: 'none'}}><button style={{marginTop: 20}} className='green-upload-button' onClick={() => uploadImage()}>Lähetä kuva/t käsittelyyn</button></div>
                  : null
                  }
                  <div ref={appStates.messageEnd}></div>
                  </div>
                )
              }

              {
                (message.options && message.id === appStates.messages.length) //only render options on the last message so user cant click previous options
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
      {appStates.loading && ( 
        <div className='loadingWrapper'>
          <l-quantum size={60} color={'#2196f3'} speed={3}></l-quantum>
          <p>Hetkinen... analysoin antamiasi tietoja ja etsin sopivia kalusteita</p>
        </div>
      )}
      {appStates.errorMessage && (
        <div><p style={{color: 'red'}}>{appStates.errorMessage}</p></div>
      )}
      {appStates.typingMode && (
        <InputField receiveInput={receiveInput} typingPhase={appStates.typingPhase}/>
      )}
      {currentPhase > 0 && (
        <div ref={appStates.messageEnd}>
        <CustomButton handleClick={navigateBack}/>
        </div>
      )}
      
      </div>
      </div>
    </div>
  );
};

export default ChatApp;