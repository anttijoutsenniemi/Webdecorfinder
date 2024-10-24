import axios from "axios";

// Määritetään baseURL vain kehitysympäristössä
const getBaseUrl = () => {
  return process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";
};

// Autentikaation asetukset
const getAuthConfig = () => {
  const username = process.env.REACT_APP_TESTER_USERNAME;
  const password = process.env.REACT_APP_TESTER_PASSWORD;

  if (!username || !password) {
    console.warn("Authentication credentials not properly configured!");
  }

  return {
    username: username!,
    password: password!,
  };
};

// Axios instanssi
export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  auth: getAuthConfig(),
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: 30000,
});