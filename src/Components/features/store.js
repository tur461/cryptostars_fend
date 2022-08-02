import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';

import swapReducer from './swap';
import walletReducer from './wallet';
import liquidityReducer from './liquidity';


const reducers = combineReducers({
  swap: swapReducer,
  wallet: walletReducer,
  liquidity: liquidityReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [thunk],
});

export default store;