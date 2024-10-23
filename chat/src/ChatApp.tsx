import React, { useState, useRef, useEffect } from 'react';
import InputField from './components/InputField';
import './App.css';
import ImageCapture from './components/ImageCapture';
import { fetchInterPretationForWebSearch, fetchInterPretationWithOnlyText, fetchInterPretationWithReference, fetchInterPretationWithSpaceImg } from './components/Aihandler';
import { fetchFurnitureData, fetchFurnitureDataWithQuantity, sendFeedbackToServer, sendSerperQuery } from './components/ApiFetches';
import clientPublic from './assets/clientPublic.json';
import furnitureCategories from './assets/furnitureCategories.json';
import ProductCard from './components/Products';
import Modal from './components/Modal';
import NumberPicker from './components/NumberPicker';
import { randomizeJsonValues } from './functions/randomizeJson';
import { AppStates } from './App';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { quantum } from 'ldrs';
import type {} from 'ldrs';
import Feedback from './components/Feedback';
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
  setShowNumberPicker: (value: boolean) => void;
  setQuantityNumber: (value : number) => void;
  setFetchProductsAgain: (value: boolean) => void;
  setFeedbackMode: (value: boolean) => void;
  setWebSearchMode: (value: boolean) => void;
}

const ChatApp: React.FC<ChildComponentProps> = ({ appStates, navigateHandler, phaseNumber, setModalOpen, setTypingMode, setLoading, setMessages, setFurnitureClass,
  setImagesSent, setTypingPhase, setChatHistoryDirect, setErrorMessage, setRecommendations,
  setRefImage64, setRefImage642, setRefImage643, setSelectedProduct, setSpaceImageMode, setAiJson, setShowNumberPicker, setQuantityNumber, setFetchProductsAgain,
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

  // Function to flatten the object so that the values are like coordinates of a line in 2d matrix
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
      let recommendations = await sendSerperQuery(queryObject.webSearchQuery);
      console.log(recommendations);

      if(recommendations && queryObject){
        let botAnswr : string = queryObject.explanation;
        let top6matches = recommendations.slice(0, 6);
        handleOptionClick('suositukset', 'Voisitko näyttää minulle kalustesuositukset?', top6matches, botAnswr);
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

      let aiJson : any;
      let arrayOfObjects : any;
      if(appStates.aiJson && furnitureClass){ //this should trigger if user wants to find more products after already getting the first set of recommendations
        aiJson = appStates.aiJson;
        //we check if we search from new products or no, searching from new should always be after user finds no matches from used ones first
        if(fetchFromNew){
          arrayOfObjects = await fetchFurnitureData(`new_${furnitureClass}`);
        }
        else {
          if(appStates.quantityNumber > 1){ //if user wants furniture with min x quantity
            arrayOfObjects = await fetchFurnitureDataWithQuantity(furnitureClass, appStates.quantityNumber);
          }
          else{
            arrayOfObjects = await fetchFurnitureData(furnitureClass);
          }
          
        }
          //if db module returns empty array (no products in the category)
          if(arrayOfObjects.length === 0 || !arrayOfObjects[0]){
            handleOptionClick('Ei tuotteita');
            return;
          }
      }
      else{ //this should trigger if its the first time user wants product recommendations
        if(appStates.quantityNumber > 1){ //if user wants atleast x amount of products
          arrayOfObjects = await fetchFurnitureDataWithQuantity(appStates.furnitureClass, appStates.quantityNumber);
        }
        else{
          arrayOfObjects = await fetchFurnitureData(appStates.furnitureClass);
        }
          //if db module returns empty array (no products in the category)
          if(arrayOfObjects.length === 0 || !arrayOfObjects[0]){
            handleOptionClick('Ei tuotteita');
            return;
          }
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
  
        let aiJsonUnParsed;
        if(appStates.spaceImgMode){ //we use ai prompt with images of the space
          aiJsonUnParsed = await fetchInterPretationWithSpaceImg(refImageArray);
        }
        else{ //we use ai prompt with user typed data + ref images
          let userFilledData : string = "";
  
          for(let i = 0; i < appStates.chatHistory.length; i++){
            userFilledData += appStates.chatHistory[i] + " ";
          }
          
          aiJsonUnParsed = await fetchInterPretationWithReference(userFilledData, refImageArray);
        }
  
        aiJson = JSON.parse(aiJsonUnParsed);
        setAiJson(aiJson);
      }
      
      let botAnswr : string = aiJson.explanation;  
  
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
    
        // Select top 12 matches
        const top3Matches = sortedObjects.slice(0, 12).map((item : any) => item.object);
        setRecommendations(top3Matches);
        // handleOptionClick('recommendations', 'Show me the recommendations please', top3Matches, botAnswr);
        handleOptionClick('suositukset', 'Voisitko näyttää minulle kalustesuositukset?', top3Matches, botAnswr);
  
    } catch (error) {
      console.log(error);
      setErrorMessage('An unexpected error occured fetching AI response');
    }
  }

  function getRandomElements(arr : any, count : number) {
    const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, count); // Get the first `count` elements
  }

  //this is redacted but saved it in case its needed
  const getRandomRecommendations = async () => {
    let arrayOfObjects = await fetchFurnitureData(appStates.furnitureClass);
    let newArr = getRandomElements(arrayOfObjects, 3);
    
    //handleOptionClick('recommendations', 'Show me the recommendations please', newArr, 'Here are some random recommendations as promised:')
    handleOptionClick('suositukset', 'Voisitko näyttää minulle kalustesuosituket?', newArr, 'Tässä on satunnaisia suosituksia kujten lupasin:')
  }

  const getTextRecommendations = async () => {
    try {
      setLoading(true);
      let arrayOfObjects : any;
      if(appStates.quantityNumber > 1){
        arrayOfObjects = await fetchFurnitureDataWithQuantity(appStates.furnitureClass, appStates.quantityNumber);
      }
      else {
        arrayOfObjects = await fetchFurnitureData(appStates.furnitureClass);
      }
      console.log(appStates.furnitureClass);
      console.log(arrayOfObjects);
        //if db module returns empty array (no products in the category)
        if(arrayOfObjects.length === 0 || !arrayOfObjects[0]){
          handleOptionClick('Ei tuotteita');
          return;
        }
      let userFilledData : string = "";
  
      for(let i = 0; i < appStates.chatHistory.length; i++){
        userFilledData += appStates.chatHistory[i] + " ";
      }
      
      let aiJsonUnParsed = await fetchInterPretationWithOnlyText(userFilledData);

      let aiJson = JSON.parse(aiJsonUnParsed);
      setAiJson(aiJson);

      let botAnswr : string = aiJson.explanation;  
  
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
    
        // Select top 12 matches
        const top3Matches = sortedObjects.slice(0, 12).map((item : any) => item.object);
        setRecommendations(top3Matches);
        handleOptionClick('suositukset', 'Voisitko näyttää minulle kalustesuositukset?', top3Matches, botAnswr);
        setLoading(false);
    } catch (error) {
      console.log(error);
      setErrorMessage(`Error occured: ${error}`)
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
        case '1. Etsi kalusteita käyttämällä kuvia tilasta':
            botResponseText = 'Tottakai! Minkä tyyppisiä kalusteita etsitään?';
            let newCategories : string[] = furnitureCategories.withNumbers;
            options = newCategories;
            nextPageNumber = phaseNumber + 1;
            break;
        case '2. Etsi kalusteita täyttämällä koko tyylikysely':
            setWebSearchMode(false);
            botResponseText = 'Hienoa, aloitetaan! Voitko kuvailla omin sanoin millaista tilaa suunnittelet? Voit täyttää tekstikentän ehdotuksilla, kirjoittaa itse tai molemmat!';
            setTypingPhase(1);
            setTypingMode(true);
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Tila kuvailtu':
            botResponseText = 'Selvä! Voitko seuraavaksi kertoa, millaista tyyliä haet? (esim. värit ja teemat)';
            setTypingPhase(2);
            setTypingMode(true);
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Tyyli kuvailtu':
            botResponseText = 'Hienoa, kirjasin tiedot ylös. Minkä tyyppisiä kalusteita etsit? Tässä muutamia vaihtoehtoja:';
            let newCategoriesNoNumbers : string[] = furnitureCategories.withoutNumbers;
            options = newCategoriesNoNumbers; 
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Kategoria kirjattu ylös':
            botResponseText = 'Määrä kirjattu ylös. Haluatko antaa minulle kuvan/kuvia suunnittelemastasi tilasta, jotta voin löytää siihen sopivat kalusteet?';
            options = ['Lisää kuvia', 'Ei kiitos, anna minulle suosituksia pelkän tekstin avulla'];
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Lisää kuvia':
            botResponseText = "Lisää 1-3 referenssikuvaa";
            setSpaceImageMode(false);
            imageUploadMode = true;
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Lisää kuva/kuvia tilasta':
            botResponseText = "Lisää 1-3 kuvaa tilasta";
            setSpaceImageMode(true);
            imageUploadMode = true;
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Etsitään satunnaisia suosituksia':
            botResponseText = 'Hetkinen, etsin 3 satunnaista kalusteehdotusta...';
            let randomAiJson = { "nonValidImage": false, "explanation": "Etsin lisää täysin satunnaisia suosituksia.", "colorThemes": { "dark": 0, "light": 0, "colorful": 0, "earthy": 0, "blackAndWhite": 0, "pastel": 0, "neutrals": 0, "jewelTones": 0, "metallics": 0, "oceanic": 0 }, "designStyles": { "industrial": 0, "scandinavian": 0, "minimalist": 0, "modern": 0, "farmhouse": 0, "artDeco": 0, "bohemian": 0, "traditional": 0, "rustic": 0, "glam": 0, "contemporary": 0, "transitional": 0 } };
            randomAiJson = randomizeJsonValues(randomAiJson);
            setAiJson(randomAiJson);
            getRandomRecommendations();
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Ei tuotteita':
            setLoading(false);
            botResponseText = "Näyttää siltä, ettei valitsemastasi kategoriasta löytynyt tällä hetkellä tarpeeksi käytettyjä tuotteita. Ne saattavat olla loppuunmyytyjä, ja saatat löytää niitä kokeilemalla myöhemmin uudestaan. Haluaisitko etsiä saman kategorian kalusteita uusista tuotteista?";
            options = ['Aloita alusta', 'Etsitään uusista tuotteista']
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Etsitään uusista tuotteista':
            botResponseText = 'Selvä! Etsitään uusista tuotteista...'
            uploadImage(appStates.furnitureClass, true);
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
            
            options = ['Etsitään uusista tuotteista', 'Etsitään lisää kalusteita eri kategoriasta', 'Aloita alusta', 'Anna palautetta tekoälysovelluksesta', 'Ota yhteyttä myyjään'];
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Ota yhteyttä myyjään':
            botResponseText = "Hetkinen...avaan piakkoin yhteydenottolomakkeen uuteen välilehteen.";
            setTimeout(() => {
              window.open(`${clientPublic.webStoreUrl}/info/57/yhteydenottolomake`, '_blank', 'noopener,noreferrer');
            }, 3000);
            options = ['Aloita alusta', 'Anna palautetta tekoälysovelluksesta'];
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Anna palautetta tekoälysovelluksesta':
            botResponseText = 'Olivatko tekoälykalustesuositukset tarpeisiisi sopivia?';
            setFeedbackMode(true);
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Palaute annettu':
            botResponseText = 'Kiitos palautteesta! Toivottavasti kanssani asioiminen oli sujuvaa.'
            nextPageNumber = phaseNumber + 1;
            options = ['Aloita alusta'];
            break;
        case '3. Etsi kalusteita verkosta':
            setWebSearchMode(true);
            nextPageNumber = phaseNumber + 1;
            setTimeout(() => { //this wont work without timeout for some reason
              handleOptionClick('1. Etsi kalusteita käyttämällä kuvia tilasta', 'Etsi kalusteita verkosta');
            }, 50);
            break;
        case 'Ei kiitos, anna minulle suosituksia pelkän tekstin avulla':
            botResponseText = 'Selvä, odota hetki, valitsen sinulle kolme kalusteehdotusta pelkän tekstin avulla...';
            //getRandomRecommendations();
            getTextRecommendations();
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Etsitään lisää kalusteita eri kategoriasta':
            botResponseText = 'Selvä, mitä kategoriaa etsitään?';
            setFetchProductsAgain(true);
            let newCategoriesNoNumbers2 : string[] = furnitureCategories.withoutNumbers;
            options = newCategoriesNoNumbers2; 
            nextPageNumber = phaseNumber + 1;
            break;
        case 'Aloita alusta':
            botResponseText = 'Tervetuloa! Olen Redecofinder AI-avustajasi, ja autan sinua suunnittelemaan tilaasi sopivilla käytetyillä kalusteilla. Voit jatkaa valitsemalla 1: saat suosituksia nopeasti ja helposti käyttämällä kuvia suunnittelemastasi tilasta. 2: täytä koko tyylikysely, jossa löydämme sinulle sopivat kalusteet yhdessä.';
            options = ['1. Etsi kalusteita käyttämällä kuvia tilasta', '2. Etsi kalusteita täyttämällä koko tyylikysely'];
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
              botResponseText = `Selvä, etsitään kategoriasta: ${option.toLowerCase()} toiveittesi mukaan. Haluatko viimeiseksi lisätä kuvia tilastasi vai saada suoraan täysin satunnaisia kalustesuosituksia?`;
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

const receiveQuantityNumber = (quantityNumber : number) => {
  setQuantityNumber(quantityNumber);
  setShowNumberPicker(false);
  let userResponse : string;
  // if(quantityNumber === 0){
  //   userResponse = 'Määrällä ei ole minulle merkitystä';
  // }
  userResponse = quantityNumber.toString();
  if(quantityNumber === 51){
    userResponse = "50+";
  }
  if(appStates.fetchProductsAgain){ //we go straight to fetching products if this the second+ time user is searching products
    uploadImage(appStates.furnitureClass);
  }
  else{ //this should tirgger if its first time user searches for products
    handleOptionClick('Kategoria kirjattu ylös', userResponse);
  }
  
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

const receiveFeedBack = async (success: boolean, feedback?: string) => {
  setLoading(true);
  if(feedback){
    await sendFeedbackToServer(success, feedback);
  }
  else{
    await sendFeedbackToServer(success);
  }
  setLoading(false);
  setFeedbackMode(false);
  handleOptionClick('Palaute annettu');
}

//func for receiving input from user typing
const receiveInput = (input : string) => {
  if(input.length < 1 || !input){
    setErrorMessage("Im sorry but I do not understand empty messages");
  }
  else{
    //typingPhase tells us to which part of the ai dialog this input is used for 1=describe the space, 2=describe style, 3=needs
    let historyArrayMessages : string[] = appStates.chatHistory;
    if(appStates.typingPhase === 1){
      historyArrayMessages[0] = '1. User describing space: ' + input;
      setChatHistoryDirect(historyArrayMessages);
      // handleOptionClick('Space described', input);
      handleOptionClick('Tila kuvailtu', input);
      setErrorMessage('');
    }
    else if(appStates.typingPhase === 2){
      historyArrayMessages[1] = '2. User describing style he/she is looking for: ' + input;
      setChatHistoryDirect(historyArrayMessages);
      // handleOptionClick('Style explained', input);
      handleOptionClick('Tyyli kuvailtu', input);
      setTypingMode(false);
      setErrorMessage('');
    }
    // this is since 22.8.24 redacted and should not trigger
    else if(appStates.typingPhase === 3){
      historyArrayMessages[2] = '3. User describing needs for the furniture: ' + input;
      setChatHistoryDirect(historyArrayMessages);
      setTypingPhase(0);
      setTypingMode(false);
      setErrorMessage('');
    }
  }
}

  return (
    <div className="chat-app-background">
    <div className='screen-wrapper'>
    <div className='app-header'><h1 className='header-title'>ReDecoFinder avustaja</h1>
        <div className='hamburger-menu' onClick={()=>toggleDrawer()}>
          &#9776;
        </div>
        </div>
        <div className='drawer' id='drawer'>
        <button className='close-button' onClick={()=>toggleDrawer()}>Sulje &times;</button>
          <a href={clientPublic.webStoreUrl}>
            <div className='modal-option-button' style={{color: 'white', marginTop: 10}}>Avaa {clientPublic.webStoreName} verkkokauppa</div>
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
      {appStates.showNumberPicker && (
        <NumberPicker receiveInput={receiveQuantityNumber}/>
      )}
      {appStates.feedbackMode && (
        <Feedback receiveInput={receiveFeedBack}/>
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