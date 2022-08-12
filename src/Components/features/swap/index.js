import { createSlice } from '@reduxjs/toolkit';
import { EVENT, MISC, TOKEN_LIST_STATIC } from '../../../services/constants/common';
import log from '../../../services/logging/logger';
import { evDispatch, isDefined, rEqual } from '../../../services/utils';
import GEN_ICON from "../../../Assets/Images/token_icons/Gen.svg";
import l_t from '../../../services/logging/l_t';

export const swapSlice = createSlice({
    name: 'swap',
    initialState: {
        token1: '',
        token1_sym: MISC.SEL_TOKEN,
        token1_addr: '',
        token1_icon: `${GEN_ICON}`,
        token2: '',
        token2_sym: MISC.SEL_TOKEN,
        token2_addr: '',
        token2_icon: `${GEN_ICON}`,
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
        setTokenInfo: (state, action) => {
            log.i('setting token infos:', action.payload);
            if(rEqual(action.payload.n, 0)) {
                if(action.payload.isUpDown) {
                    state.token1_sym = action.payload.sym[0];
                    state.token2_sym = action.payload.sym[1];
    
                    state.token1_icon = action.payload.icon[0];
                    state.token2_icon = action.payload.icon[1];
    
                    state.token1_addr = action.payload.addr[0];
                    state.token2_addr = action.payload.addr[1];
                } else {
                    state.token1_sym = action.payload.sym;
                    state.token2_sym = action.payload.sym;
    
                    state.token1_icon = action.payload.icon;
                    state.token2_icon = action.payload.icon;
    
                    state.token1_addr = action.payload.addr;
                    state.token2_addr = action.payload.addr;
                }
            } else {
                if(rEqual(state[`token${action.payload.n}_addr`], action.payload.addr)) {
                    l_t.e('already selected!');
                } else
                if(rEqual(state[`token${rEqual(action.payload.n, 1) ? 2 : 1}_addr`], action.payload.addr)) {
                    l_t.e('both tokens can\'t be same!');
                } else {
                    state[`token${action.payload.n}_sym`] = action.payload.sym;
                    state[`token${action.payload.n}_icon`] = action.payload.icon;
                    state[`token${action.payload.n}_addr`] = action.payload.addr;
                }
            }

            // if(isDefined(action.payload.disabled)) {
            //     const tList = state.tokenList_chg.filter(item => item.addr !== action.payload.addr);
            //     const tSel = state.tokenList_chg.filter(item => item.addr === action.payload.addr)[0];
                
            //     const list = state.tokenList.filter(item => item.addr !== action.payload.addr);
            //     const sel = state.tokenList.filter(item => item.addr === action.payload.addr)[0];
            //     if(rEqual(sel.tokenNum1, action.payload.n)) {
            //         sel.disabled = !0;

            //     } else
            //     if(rEqual(sel.tokenNum2, action.payload.n)) {

            //     }
            //     tSel.disabled = !0;
            //     state.tokenList = [...list, sel];
            //     state.tokenList_chg = [...tList, tSel];
            //     log.i('token list changed!');
            // }

        },
        addToTokenList: (state, action) => {
            state.tokenList.push({
                ...action.payload
            })
            state.tokenList_chg = [...state.tokenList];
        },

        setExactIn: (state, action) => { state.isExactIn = action.payload },
        setDeadLine: (state, action) => { state.deadLine = action.payload },
        setSlippage: (state, action) => { state.slippage = action.payload },
        setXchangeEq: (state, action) => { state.xchangeEq = action.payload },
        setValidSwap: (state, action) => { state.validSwap = action.payload },
        setToken1Approved: (state, action) => { state.token1_approved = action.payload },
        changeTokenList: (state, action) => { state.tokenList_chg = [...action.payload] },
        
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