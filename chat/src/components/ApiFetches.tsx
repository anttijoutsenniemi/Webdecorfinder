import axios from "axios";

export const fetchFurnitureData = async (category : string) => {
    try {
        const response = await axios.post('/apiroute/furnitureCategory', 
        { category: category }, //req.body
        {
          auth: {
              username: process.env.REACT_APP_TESTER_USERNAME!,
              password: process.env.REACT_APP_TESTER_PASSWORD!
          }
      });
        return response.data;
      } catch (error) {
        console.error('There was an error!', error);
      }
}

export const fetchFurnitureDataWithQuantity = async (category : string, quantity : number) => {
  try {
      const response = await axios.post('/apiroute/categoryWithQuantity', 
      { category: category, quantity: quantity }, //req.body
      {
        auth: {
            username: process.env.REACT_APP_TESTER_USERNAME!,
            password: process.env.REACT_APP_TESTER_PASSWORD!
        }
    });
      return response.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
}

export const sendFeedbackToServer = async (success: boolean, feedback?: string) => {
  let reqBody : object = { success: success };
  if(feedback){ //we only send feedback if there is any text
    reqBody = { success: success, feedback: feedback };
  }
  try {
      const response = await axios.post('/apiroute/sendFeedback', 
      reqBody, //req.body
      {
        auth: {
            username: process.env.REACT_APP_TESTER_USERNAME!,
            password: process.env.REACT_APP_TESTER_PASSWORD!
        }
    });
      return response.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
}

export const sendSerperQuery = async (searchQuery: string) => {
  try {
      const response = await axios.post('/apiroute/serperImageSearchFiltered', 
      { searchQuery: searchQuery }, //req.body
      {
        auth: {
            username: process.env.REACT_APP_TESTER_USERNAME!,
            password: process.env.REACT_APP_TESTER_PASSWORD!
        }
    });
      return response.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
}