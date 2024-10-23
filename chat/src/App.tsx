import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import ChatApp from './ChatApp';
import useNavigationDetection from './components/NavigationDetecter';

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

  export interface AppStates {
    messages: ChatMessage[];
    furnitureClass: string;
    messageEnd: React.RefObject<HTMLDivElement>;
    typingMode: boolean;
    loading: boolean;
    imagesSent: boolean;
    typingPhase: number;
    chatHistory: string[];
    errorMessage: string;
    recommendations: string;
    refImage64: string;
    refImage642: string;
    refImage643: string;
    modalOpen: boolean;
    selectedProduct: null | CompareObject;
    spaceImgMode: boolean;
    aiJson: any;
    quantityNumber: number;
    showNumberPicker: boolean;
    fetchProductsAgain: boolean;
    feedbackMode: boolean;
    webSearchMode: boolean;
  }

  export interface StateHistory {
    phase: number;
    states: AppStates;
  }

const App0: React.FC = () => {

    const messageEndRef = useRef<HTMLDivElement>(null);

    const [appStates, setAppStates] = useState<AppStates>(
        {
            messages: [
              { id: 1, 
                type: 'chatbot',
                text: 'Tervetuloa! Olen Redecofinder AI-avustajasi, ja autan sinua suunnittelemaan tilaasi sopivilla käytetyillä kalusteilla. Voit jatkaa valitsemalla 1: saat suosituksia nopeasti ja helposti käyttämällä kuvia suunnittelemastasi tilasta. 2: täytä koko tyylikysely, jossa löydämme sinulle sopivat huonekalut yhdessä.', 
                options: ['1. Etsi kalusteita käyttämällä kuvia tilasta', '2. Etsi kalusteita täyttämällä koko tyylikysely', /*'3. Etsi kalusteita verkosta'*/] },
            ],
            furnitureClass: 'Chairs',
            messageEnd: messageEndRef,
            typingMode: false,
            loading: false,
            imagesSent: false,
            typingPhase: 0,
            chatHistory: [],
            errorMessage: "",
            recommendations: "",
            refImage64: "",
            refImage642: "",
            refImage643: "",
            modalOpen: false,
            selectedProduct: null,
            spaceImgMode: false,
            aiJson: null,
            quantityNumber: 0,
            showNumberPicker: false,
            fetchProductsAgain: false,
            feedbackMode: false,
            webSearchMode: false,
          }
    );
    const [stateHistory, setStateHistory] = useState<StateHistory[]>([{ phase: 0, states: appStates}]);
    const [currentPhase, setCurrentPhase] = useState<number>(0);
    const [previousPhase, setPreviousPhase] = useState<number>(0);
    const [phaseNumbers, setPhaseNumbers] = useState<number[]>([1, 2, 3]);
    const location = useLocation();

    useNavigationDetection(
        () => {
          // console.log('User navigated back');
          let urlPath = location.pathname;
          let lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
          let number = Number(lastSegment);
          let newStates : AppStates = appStates;
          for(let i = 0; i < stateHistory.length; i++){
            if(stateHistory[i].phase === number){
                newStates = stateHistory[i].states;
            }
            setAppStates(newStates);
          }
        },
        () => {
          // console.log('User navigated forward');
          let urlPath = location.pathname;
          let lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
          let number = Number(lastSegment);
          let newStates : AppStates = appStates;
          for(let i = 0; i < stateHistory.length; i++){
            if(stateHistory[i].phase === number){
                newStates = stateHistory[i].states;
            }
            setAppStates(newStates);
          }
        }
      );

    // helper functions to update specific parts of the state
    const setModalOpen = (value: boolean) => setAppStates(prevState => ({ ...prevState, modalOpen: value }));
    const setTypingMode = (value: boolean) => setAppStates(prevState => ({ ...prevState, typingMode: value }));
    const setLoading = (value: boolean) => setAppStates(prevState => ({ ...prevState, loading: value }));
    const setMessages = (messages: ChatMessage[]) => setAppStates(prevState => ({ ...prevState, messages }));
    const setFurnitureClass = (furnitureClass: string) => setAppStates(prevState => ({ ...prevState, furnitureClass }));
    const setImagesSent = (value: boolean) => setAppStates(prevState => ({ ...prevState, imagesSent: value }));
    const setTypingPhase = (value: number) => setAppStates(prevState => ({ ...prevState, typingPhase: value }));
    const setChatHistory = (updater: (prevHistory: string[]) => string[]) => setAppStates(prevState => ({ ...prevState, chatHistory: updater(prevState.chatHistory) }));  
    const setChatHistoryDirect = (value: string[]) => setAppStates(prevState => ({ ...prevState, chatHistory: value }));
    const setErrorMessage = (value: string) => setAppStates(prevState => ({ ...prevState, errorMessage: value }));
    const setRecommendations = (value: string) => setAppStates(prevState => ({ ...prevState, recommendations: value }));
    const setRefImage64 = (value: string) => setAppStates(prevState => ({ ...prevState, refImage64: value }));
    const setRefImage642 = (value: string) => setAppStates(prevState => ({ ...prevState, refImage642: value }));
    const setRefImage643 = (value: string) => setAppStates(prevState => ({ ...prevState, refImage643: value }));
    const setSelectedProduct = (product: null | CompareObject) => setAppStates(prevState => ({ ...prevState, selectedProduct: product }));
    const setSpaceImageMode = (value: boolean) => setAppStates(prevState => ({ ...prevState, spaceImgMode: value }));
    const setAiJson = (value: any) => setAppStates(prevState => ({ ...prevState, aiJson: value }));
    const setShowNumberPicker = (value: boolean) => setAppStates(prevState => ({ ...prevState, showNumberPicker: value }));
    const setQuantityNumber = (value: number) => setAppStates(prevState => ({ ...prevState, quantityNumber: value }));
    const setFetchProductsAgain = (value: boolean) => setAppStates(prevState => ({ ...prevState, fetchProductsAgain: value }));
    const setFeedbackMode = (value: boolean) => setAppStates(prevState => ({ ...prevState, feedbackMode: value }));
    const setWebSearchMode = (value: boolean) => setAppStates(prevState => ({ ...prevState, webSearchMode: value }));

    const navigateHandler = (sourcePhase : number) => {

        //next, put the original App.tsx inside this compos Route element
        //then put all of its usestate variables here and save them all in one historyobject.
        //each hostoryobject has also value phase like 1, 2 ,3...
        // when user navigates, we fetch all states from the historyobject for the correct phase

        // let newHistoryObject : StateHistory = { phase: sourcePhase + 1, states: appStates };
        // setStateHistory(prevState => ([...prevState, newHistoryObject]));
        setPhaseNumbers((prevNumbers : number[]) => [...prevNumbers, prevNumbers.length]);
        setPreviousPhase(sourcePhase);
        let newPhase = sourcePhase + 1;
        setCurrentPhase(newPhase);

        setStateHistory(prevStateHistory => {
            const existingIndex = prevStateHistory.findIndex(item => item.phase === newPhase);
      
            if (existingIndex !== -1) {
              // If it exists, overwrite the object
              const updatedHistory = [...prevStateHistory];
              updatedHistory[existingIndex] = { phase: newPhase, states: appStates };
              return updatedHistory;
            } else {
              // If it doesn't exist, add the new object
              return [...prevStateHistory, { phase: newPhase, states: appStates }];
            }
          });
    }

  return (
      <Routes>
        <Route path='/' element={<ChatApp appStates={appStates} navigateHandler={navigateHandler} phaseNumber={0} setModalOpen={setModalOpen} setTypingMode={setTypingMode} setLoading={setLoading} setMessages={setMessages} setFurnitureClass={setFurnitureClass} setImagesSent={setImagesSent} setTypingPhase={setTypingPhase} setChatHistory={setChatHistory} setChatHistoryDirect={setChatHistoryDirect} setErrorMessage={setErrorMessage} setRecommendations={setRecommendations} setRefImage64={setRefImage64} setRefImage642={setRefImage642} setRefImage643={setRefImage643} setSelectedProduct={setSelectedProduct} setSpaceImageMode={setSpaceImageMode} setAiJson={setAiJson} setShowNumberPicker={setShowNumberPicker} setQuantityNumber={setQuantityNumber} setFetchProductsAgain={setFetchProductsAgain} setFeedbackMode={setFeedbackMode} setWebSearchMode={setWebSearchMode}/>} />

        {
            phaseNumbers.map((number, index)=> (
                <Route key={index} path={`/${number}`} element={<ChatApp appStates={appStates} navigateHandler={navigateHandler} phaseNumber={number} setModalOpen={setModalOpen} setTypingMode={setTypingMode} setLoading={setLoading} setMessages={setMessages} setFurnitureClass={setFurnitureClass} setImagesSent={setImagesSent} setTypingPhase={setTypingPhase} setChatHistory={setChatHistory} setChatHistoryDirect={setChatHistoryDirect} setErrorMessage={setErrorMessage} setRecommendations={setRecommendations} setRefImage64={setRefImage64} setRefImage642={setRefImage642} setRefImage643={setRefImage643} setSelectedProduct={setSelectedProduct} setSpaceImageMode={setSpaceImageMode} setAiJson={setAiJson} setShowNumberPicker={setShowNumberPicker} setQuantityNumber={setQuantityNumber} setFetchProductsAgain={setFetchProductsAgain} setFeedbackMode={setFeedbackMode} setWebSearchMode={setWebSearchMode}/>} />
            ))
        }

      </Routes>
  );
};

const App = () => (
    <Router>
      <App0 />
    </Router>
  );

export default App;
