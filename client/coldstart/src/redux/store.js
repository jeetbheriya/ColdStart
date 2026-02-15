import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // This tells Redux to use your authSlice logic for the 'auth' state
    auth: authReducer, 
  },
});