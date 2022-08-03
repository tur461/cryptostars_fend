import { createSlice } from '@reduxjs/toolkit';
import { MISC } from '../../../services/constants/common';


export const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    priAccount: '',
    isConnected: !1,
    connectTitle: MISC.CONNECT_TTL,
    isNetworkValid: !1,
  },

  reducers: {
    setPriAccount: (state, action) => {
      state.priAccount = action.payload
    },
    setConnectTitle: (state, action) => {
      state.connectTitle = action.payload
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
  setConnectTitle,
  walletConnected, 
} = actions;

export default reducer;