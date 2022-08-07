import { createSlice } from '@reduxjs/toolkit';
import { MISC } from '../../../services/constants/common';
import { WALLET_TYPE } from '../../../services/constants/wallet';


export const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    priAccount: '',
    isConnected: !1,
    isNetworkValid: !1,
    walletType: WALLET_TYPE.NONE,
    connectTitle: MISC.CONNECT_TTL,
  },

  reducers: {
    setPriAccount: (state, action) => { state.priAccount = action.payload },
    setWalletType: (state, action) => { state.walletType = action.payload },
    walletConnected: (state, action) => { state.isConnected = action.payload },
    networkValid: (state, action) => { state.isNetworkValid = action.payload },
    setConnectTitle: (state, action) => { state.connectTitle = action.payload },
  }
});

const {reducer, actions } = walletSlice;

export const { 
  networkValid, 
  setWalletType,
  setPriAccount, 
  setConnectTitle,
  walletConnected, 
} = actions;

export default reducer;