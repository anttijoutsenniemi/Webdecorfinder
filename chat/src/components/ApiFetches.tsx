import { api } from "../axiosConfig";

export const fetchFurnitureData = async (category: string) => {
  try {
    const response = await api.post('/apiroute/furnitureCategory', { 
      category: category 
    });
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};

export const fetchFurnitureDataWithQuantity = async (category: string, quantity: number) => {
  try {
    const response = await api.post('/apiroute/categoryWithQuantity', { 
      category: category, 
      quantity: quantity 
    });
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};

export const sendFeedbackToServer = async (success: boolean, feedback?: string) => {
  try {
    const reqBody = feedback 
      ? { success, feedback } 
      : { success };

    const response = await api.post('/apiroute/sendFeedback', reqBody);
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};

export const sendSerperQuery = async (searchQuery: string) => {
  try {
    const response = await api.post('/apiroute/searchSerperWebStoresFiltered', { 
      searchQuery: searchQuery 
    });
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};