
import axiosInstance from "../config/axiosInstance.js";

export const getAnalytics = async (range = 'all') => {
    try {
        const response = await axiosInstance.get(`/analytics?range=${range}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};