import { createSlice } from '@reduxjs/toolkit';
import l_t from '../../../services/logging/l_t';
import log from '../../../services/logging/logger';
import GEN_ICON from "../../../Assets/Images/token_icons/Gen.svg";
import { evDispatch, isNaNy, rEqual, toFixed, tStampJs } from '../../../services/utils';
import { EVENT, MISC, TOKEN_INIT, TOKEN_LIST_STATIC } from '../../../services/constants/common';

export const swapSlice = createSlice({
    name: 'swap',
    initialState: {
        isExactIn: !0,
        xchangeEq: '',
        validSwap: !1,
        token2_addr: '',
        recentTxList: [],
        token1_approved: !0,
        token2_icon: `${GEN_ICON}`,
        token2_sym: MISC.SEL_TOKEN,
        slippage: MISC.DEF_SLIPPAGE,
        tokenList: TOKEN_LIST_STATIC,
        deadLine: MISC.SWAP_DEAD_LINE,
        token1_value: TOKEN_INIT.VAL(),
        token2_value: TOKEN_INIT.VAL(),
        token1_sym: MISC.SEL_TOKEN,
        tokenList_chg: TOKEN_LIST_STATIC, 
        token1_addr: '',
        token1_icon: `${GEN_ICON}`,
    },

    reducers: {
        setTokenValue: (state, action) => {
            let n = action.payload.n;
            if(n === 0) {
                state.token1_value.ui = action.payload.v;
                state.token2_value.ui = action.payload.v;
                state.token1_value.actual = action.payload.v;
                state.token2_value.actual = action.payload.v;
            } else {
                let v = action.payload.v;
                state[`token${n}_value`].ui = v.ui;
                state[`token${n}_value`].actual = v.actual; 
            }
        },
        setTokenInfo: (state, action) => {
            // log.i('setting token infos:', action.payload);
            if(rEqual(action.payload.n, 0)) {
                if(action.payload.isUpDown) {
                    state.token1_sym = action.payload.sym[0];
                    state.token2_sym = action.payload.sym[1];
    
                    state.token1_icon = action.payload.icon[0];
                    state.token2_icon = action.payload.icon[1];
    
                    state.token1_addr = action.payload.addr[0];
                    state.token2_addr = action.payload.addr[1];
                } else {
                    state.token1_sym = MISC.SEL_TOKEN;
                    state.token2_sym = MISC.SEL_TOKEN;
    
                    state.token2_icon = `${GEN_ICON}`;
                    state.token1_icon = `${GEN_ICON}`;
    
                    state.token1_addr = '';
                    state.token2_addr = '';
                }
                evDispatch(
                    EVENT.TOKEN_SELECTION, 
                    {
                        selectedToken: action.payload.n, 
                        addrList: [
                            state.token1_addr,
                            state.token2_addr,
                        ]
                    }
                );
            } else {
                const otherN = rEqual(action.payload.n, 1) ? 2 : 1;
                if(rEqual(state[`token${action.payload.n}_addr`], action.payload.addr) && !action.payload.reset) {
                    l_t.w('already selected!');
                } else
                if(rEqual(state[`token${otherN}_addr`], action.payload.addr)  && !action.payload.reset) {
                    l_t.w('both tokens can\'t be same!');
                } else {
                    // log.i('setTokenInfo to:', action.payload);
                    state.token1_value.ui = '';
                    state.token2_value.ui = '';
                    state.token1_value.actual = '';
                    state.token2_value.actual = '';
                    state[`token${action.payload.n}_sym`] = action.payload.sym;
                    state[`token${action.payload.n}_icon`] = action.payload.icon;
                    state[`token${action.payload.n}_addr`] = action.payload.addr;
                    if(action.payload.reset) {
                        state[`token${otherN}_sym`] = MISC.SEL_TOKEN;
                        state[`token${otherN}_icon`] = `${GEN_ICON}`;
                        state[`token${otherN}_addr`] = '';
                    }
                    evDispatch(
                        EVENT.TOKEN_SELECTION, 
                        {
                            selectedToken: action.payload.n,
                            addrList: [action.payload.addr]
                        }
                    );
                }
            }
        },
        addToTokenList: (state, action) => {
            state.tokenList.push({
                ...action.payload
            })
            state.tokenList_chg = [...state.tokenList];
        },
        saveTxHash: (state, action) => {
            // if exceeded, remove most old one!
            if(state.recentTxList.length >= MISC.MAX_RECENT_TXS) state.recentTxList.splice(0, 1);
            state.recentTxList.unshift({
                tStampJs: tStampJs(), 
                hash: action.payload.txHash,
                pair: action.payload.pair
            });
        },

        setIsExactIn: (state, action) => { state.isExactIn = action.payload },
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
    setIsExactIn,
    saveTxHash,
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