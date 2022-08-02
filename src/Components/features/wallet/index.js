import { createSlice } from '@reduxjs/toolkit';


export const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    priAccount: '',
    isConnected: !1,
    isNetworkValid: !1,
  },

  reducers: {
    setPriAccount: (state, action) => {
      state.priAccount = action.payload
    },
    walletConnected: (state, action) => {
      state.isConnected = action.payload
    },
    networkValid: (state, action) => {
      state.isNetworkValid = action.payload
    },
  }
});

const {reducer, actions } = walletSlice;

export const { 
  networkValid, 
  setPriAccount, 
  walletConnected, 
} = actions;

export default reducer;