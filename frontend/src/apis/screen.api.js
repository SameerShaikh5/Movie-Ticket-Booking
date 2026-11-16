import axiosInstance from "../config/axiosInstance.js"

export const getScreens = async () => {
    try {
        const response = await axiosInstance.get('/screens')
        return response.data
    } catch (error) {
        throw error.response?.data || { message: error.message };

    }
}




export const createScreen = async (screenData) => {
    try {
        const response = await axiosInstance.post('/screens', screenData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

export const updateScreen = async (screenId, screenData) => {
    try {
        // Fixed URL parameter interpolation
        const response = await axiosInstance.patch(`/screens/${screenId}`, screenData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};


export const deleteScreen = async (screenId) => {
    try {
        // Fixed URL parameter interpolation
        const response = await axiosInstance.delete(`/screens/${screenId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};


export const getScreen = async (screenId) => {
    try {
        const response = await axiosInstance.get(`/screens/${screenId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};