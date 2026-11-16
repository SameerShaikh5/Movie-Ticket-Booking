import axiosInstance from "../config/axiosInstance.js";

export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await axiosInstance.post('/users/register', {
      name,
      email,
      password,
    });
    return response.data
  } catch (error) {
    // Pass back the backend's error message if available
    throw error.response?.data || { message: error.message };
  }
}

export const loginUser = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post('/users/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // Pass back the backend's error message if available
    throw error.response?.data || { message: error.message };
  }
};


export const authCheck = async () => {
  try {
    const response = await axiosInstance.get('/users/auth/me');
    return response.data;
  } catch (error) {
    // Pass back the backend's error message if available
    throw error.response?.data || { message: error.message };
  }
};

export const logoutUser = async () =>{
  try {
    const response = await axiosInstance.post('/users/logout')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
}

export const updateUser = async ({ name, password }) => {
  try {
    const response = await axiosInstance.post('/users/profile', { name, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};