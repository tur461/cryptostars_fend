import { createSlice } from '@reduxjs/toolkit';
import { EVENT } from '../../../services/constants/common';
import { evDispatch, isValidAddr } from '../../../services/utils';


export const liquiditySlice = createSlice({
    name: 'liquidity',
    initialState: {
        token1: '',
        token1_addr: '',
        token2: '',
        token2_addr: '',
        amount1AppNeeded: !1,
        amount2AppNeeded: !1,
    },

    reducers: {
        setTokenValue_l: (state, action) => {
            state[`token${action.payload.n}`] = action.payload.v;
        },
        setToken_addr_l: (state, action) => {
            state[`token{action.payload.n}_addr`] = action.payload.addr;
        },
        setNeedOfAmountApp: (state, action) => {
            state[`amount${action.payload.n}AppNeeded`] = action.payload.v;
        },
    }
});

const {reducer, actions } = liquiditySlice;

export const { 
    setTokenValue_l,
    setToken_addr_l,
    setNeedOfAmountApp,
} = actions;

export default reducer;