import { createSlice } from '@reduxjs/toolkit';
import { EVENT, MISC, TOKEN_LIST_STATIC } from '../../../services/constants/common';
import { evDispatch } from '../../../services/utils';

export const swapSlice = createSlice({
    name: 'swap',
    initialState: {
        token1: '',
        token1_sym: 'Select a token',
        token1_addr: '',
        token2: '',
        token2_sym: 'Select a token',
        token2_addr: '',
        token1_approved: !0,
        slippage: MISC.DEF_SLIPPAGE,
        deadLine: MISC.SWAP_DEAD_LINE,
        isExactIn: !0,
        xchangeEq: '',
        validSwap: !1,
        tokenList: TOKEN_LIST_STATIC,
        tokenList_chg: TOKEN_LIST_STATIC, 
    },

    reducers: {
        setTokenValue: (state, action) => {
            let n = action.payload.n;
            if(n === 0) {
                state.token1 = action.payload.v;
                state.token2 = action.payload.v;
            } else state[`token${n}`] = action.payload.v;
        },
        setToken1Approved: (s, a) => {
            s.token1_approved = a.payload;
        },
        setExactIn: (state, action) => {
            state.isExactIn = action.payload;
        },
        setValidSwap: (state, action) => {
            state.validSwap = action.payload;
        },
        setTokenInfo: (state, action) => {
            state[`token${action.payload.n}_sym`] = action.payload.sym;
            state[`token${action.payload.n}_addr`] = action.payload.addr;
            const list = state.tokenList_chg.filter(item => item.addr !== action.payload.addr);
            const sel = state.tokenList_chg.filter(item => item.addr === action.payload.addr)[0];
            sel.disabled = !0;
            state.tokenList_chg = [...list, sel];
            // pending..

        },
        addToTokenList: (state, action) => {
            state.tokenList.push({
                ...action.payload
            })
            state.tokenList_chg = [...state.tokenList];
        },
        changeTokenList: (state, action) => {
            state.tokenList_chg = [...action.payload];
        },
        setXchangeEq: (state, action) => {
            state.xchangeEq = action.payload;
        },
        setDeadLine: (state, action) => {
            state.deadLine = action.payload;
        },
        setSlippage: (state, action) => {
            state.slippage = action.payload;
        },
    }
});

const {reducer, actions } = swapSlice;

export const { 
    setPair,
    setExactIn,
    setDeadLine,
    setSlippage,
    setValidSwap,
    setXchangeEq,
    setTokenInfo,
    setTokenValue,
    addToTokenList,
    changeTokenList,
    setToken1Approved,
} = actions;

export default reducer;