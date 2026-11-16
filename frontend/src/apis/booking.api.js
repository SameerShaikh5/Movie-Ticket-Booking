import axiosInstance from "../config/axiosInstance.js";

export const createBookingOrder = async ({ showId, seats }) => {
  try {
    const response = await axiosInstance.post('/bookings', {
      showId,
      seats,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }

}



export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/bookings/verify-payment', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };

  }

};


export const myBookings = async () => {
  try {
    const response = await axiosInstance.get('/bookings');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };

  }

};

export const bookingDetails = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};


export const cancelIncompleteBooking = async (bookingId) => {

  try {
    const response = await axiosInstance.post('/release-seats', { bookingId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }

};