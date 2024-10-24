import axios from "axios";
import { api } from "../axiosConfig";


export const fetchInterPretationWithReference = async (userFilledData: string, refPic64: string[]) => {
  try {
    const response = await api.post('/airoute/ref', { 
      userFilledData: userFilledData, 
      refPic64: refPic64 
    });
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};

export const fetchInterPretationWithSpaceImg = async (refPic64: string[]) => {
  try {
    if (!refPic64 || refPic64.length < 2) {
      throw new Error('At least two images are required');
    }

    const response = await api.post('/airoute/spaceimg', { 
      refPic64: refPic64 
    });
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};


export const fetchInterPretationWithOnlyText = async (userFilledData: string) => {
  try {
    const response = await api.post('/airoute/onlytext', { 
      userFilledData: userFilledData 
    });
    return response.data;
  } catch (error) {
    console.error('There was an error!', error);
    throw error;
  }
};

export const fetchInterPretationForWebSearch = async (refPic64: string[], category: string) => {
  try {
    if (!refPic64 || refPic64.length === 0) {
      throw new Error('No images provided');
    }

    if (!category) {
      throw new Error('Category is required');
    }

    const response = await api.post('/airoute/webSearch', { 
      refPic64: refPic64, 
      category: category 
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Server error:', error.response.data);
        throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response received from server');
      } else {
        console.error('Request error:', error.message);
        throw new Error(`Request error: ${error.message}`);
      }
    }
    throw error;
  }
};