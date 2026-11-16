

import axiosInstance from "../config/axiosInstance.js"

export const getShows = async () => {
    try {
        const response = await axiosInstance.get('/shows')
        return response.data
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
}


export const getShowDetails = async (showId) => {
    try {
        const response = await axiosInstance.get(`/shows/${showId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
}




export const createShow = async (showData) => {
    try {
        const response = await axiosInstance.post('/shows', showData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

export const cancelShow = async (showId) => {
    try {
        const response = await axiosInstance.patch(`/shows/${showId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};


export const updateShow = async (showId, showData) => {
    try {
        const response = await axiosInstance.put(`/shows/${showId}`, showData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

