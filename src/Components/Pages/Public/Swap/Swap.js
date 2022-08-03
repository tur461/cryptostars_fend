import {BigNumber} from '@ethersproject/bignumber';
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import headerImg from "../../../../Assets/Images/headerImg.png";
import draco from "../../../../Assets/Images/draco-roadmap.png";
import cstcoin from "../../../../Assets/Images/cst-coin.png";
import lamescoin from "../../../../Assets/Images/lames-coin.png";
import swapicon from "../../../../Assets/Images/swap-icon.png";
import LMES from "../../../../Assets/Images/LMES.png";
import MSAL from "../../../../Assets/Images/MSAL.png";
import MBAP from "../../../../Assets/Images/MBAP.png";
import HAAL from "../../../../Assets/Images/HAAL.png";
import settings from "../../../../Assets/Images/Settings-Icon.svg";
import timer from "../../../../Assets/Images/ionic-ios-timer.svg";
import GenIcon from "../../../../Assets/Images/token_icons/Gen.svg";
import {
  CustomInputgroup,
  Layout,
  PlayerCard,
  ButtonPrimary,
  ConnectWalletModal,
  RecentTransactions,
  SettingModal,
} from "../../../Common";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import "./Swap.scss";

import { 
  setExactIn,
  setSlippage,
  setDeadLine,
  setValidSwap,
  setXchangeEq, 
  setTokenInfo,
  setTokenValue,
  changeTokenList,
  addToTokenList,
  setToken1Approved,
} from "../../../features/swap";
import { 
  setTokenValue_l, 
  setToken_addr_l, 
  setNeedOfAmountApp, 
} from "../../../features/liquidity";

import l_t from "../../../../services/logging/l_t";
import { ADDRESS, INIT_VAL, MISC } from "../../../../services/constants/common";
import { bigDiv, spow, toGib, isValidAddr } from "../../../../services/utils";
import { getDeadline, getThresholdAmountFromTolerance } from "../../../../services/contracts/utils";

import CommonF from "../../../../services/contracts/common";
import TokenContract from "../../../../services/contracts/token";
import RouterContract from "../../../../services/contracts/router";
import FaucetContract from '../../../../services/contracts/faucet';
import FactoryContract from '../../../../services/contracts/factory';
import Loader from '../../../Loader';
import log from '../../../../services/logging/logger';
import toast from '../../../../services/logging/toast';
import { setConnectTitle, setPriAccount, walletConnected } from '../../../features/wallet';

const PlayerName = [
  { name: "Lionel Messi", symbol: "TUR", icon: LMES },
  { name: "Mohamed Salah", symbol: "STEEP", icon: MSAL },
  { name: "Robert Lewandowski", symbol: "CFLU", icon: LMES },
  { name: "Kylian Mbappé", symbol: "CSTAR", icon: MBAP },
  { name: "Erling Haaland", symbol: "DIY", icon: HAAL },
];

const PlayerList = () => {
  return PlayerName.map((player, index) => (
    <li key={index}>
      <img src={player.icon} alt="palyer_icon" />
      <span>
        {player.name} <strong>({player.symbol})</strong>
      </span>
    </li>
  ));
};

const Swap = () => {
  const dispatch = useDispatch();

  // redux states
  const swap = useSelector(s => s.swap);
  const wallet = useSelector(s => s.wallet);

  // non-redux states
  const [show, setShow] = useState(!1);
  const [pair, setPair] = useState([]);
  const [isErr, setIsErr] = useState(!1);
  const [errText, setErrText] = useState('');
  const [amountIn, setAmountIn] = useState('0');
  const [isExactIn, setIsExactIn] = useState('0');
  const [isFetching, setIsFetching] = useState(!1);
  const [isDisabled, setIsDisabled] = useState(!0);
  const [recentShow, setRecentShow] = useState(!1);
  const [settingsShow, setSettingsShow] = useState(!1);
  const [tokenApproved, setTokenApproved] = useState(!0);
  const [thresholdAmount, setThresholdAmount] = useState('0');
  const [btnText, setBtnText] = useState(INIT_VAL.SWAP_BTN[0]);
  const [xchangeEquivalent, setXchangeEquivalent] = useState('0');

  // helpers
  const handleShow = () => setShow(!0);
  const handleClose = () => setShow(!1);
  const recentHndShow = () => setRecentShow(!0);
  const recentHndClose = () => setRecentShow(!1);
  const settingHndShow = () => setSettingsShow(!0);
  const settingHndClose = () => setSettingsShow(!1);

  useEffect(_ => {
    if(!wallet.isConnected) l_t.e('Wallet not Connected!');
    else CommonF.init({from:wallet.priAccount}); 
  }, [wallet.connectTitle]);

  useEffect(_ => {
    resetStates()
  }, [swap.slippage])

  useEffect(_=>{
    log.i('pair:', pair);
    log.i('is err:', isErr);
    setIsDisabled(isErr);
  })


  async function approveWithMaxAmount(e) {
    e.preventDefault();
    TokenContract.init(swap.token1_addr);
    setIsFetching(!0);
    await TokenContract.approve(MISC.MAX_256, ADDRESS.ROUTER_CONTRACT);
    setIsFetching(!1);
    setTokenApproved(!0);
  }

  function resetStates() {
    setTokenApproved(!0);
    setIsDisabled(!0);
    setBtnText('Swap');
    dispatch(setTokenValue({v: '', n: 0}));
  }
  // ------------------------------------------------------

  // -------------------- Swap Code -----------------------

  // assumes Center Token is CST token
  async function checkIfHasPair(p) {
    let pAddr = await FactoryContract.getPair(p[0], p[1]);
    if(pAddr !== ADDRESS.ZERO) return p;
    else
    if(p[0] === ADDRESS.CST_TOKEN || p[1] === ADDRESS.CST_TOKEN)
      throw new Error('"error: token pair doesn\'t exist!"');
    else {
      pAddr = await FactoryContract.getPair(p[0], ADDRESS.CST_TOKEN);
      let pAddr2 = await FactoryContract.getPair(p[1], ADDRESS.CST_TOKEN);
      if(pAddr !== ADDRESS.ZERO && pAddr2 !== ADDRESS.ZERO) return [p[0], ADDRESS.CST_TOKEN, p[1]];
    }
    setIsFetching(!1);
    throw new Error('"error: pair doesn\'t exist!"');
  }

  async function badSwapCheck(amount, pr, inOrOutAmount, xactIn) {
    log.i(arguments, swap.slippage);
    let addr = isExactIn ? swap.token1_addr : swap.token2_addr;
    TokenContract.init(addr);
    let dec = await TokenContract.decimals();
    let p = [spow(amount, dec), pr];
    log.i('inOrOutAmount:', inOrOutAmount.toString()/10**18,'exactIn:', xactIn);

    log.i('threshold without dec', getThresholdAmountFromTolerance(amount, swap.slippage), 'slip:', swap.slippage);
    let thresholdAmount = spow(getThresholdAmountFromTolerance(amount, swap.slippage), dec);
    let _tmpBig = BigNumber.from(thresholdAmount);
    let slippageGood = xactIn ? inOrOutAmount.gt(_tmpBig) : inOrOutAmount.lte(_tmpBig);
    log.s(btnText);
    // if(!slippageGood) {
    //   setIsErr(!0);
    //   setErrText(isExactIn ? 'Slippage too high' : 'Slippage too low');
    // } else setIsErr(!1);

    log.i(`amounts ${isExactIn ? 'Out' : 'In'}:`, inOrOutAmount.toBigInt(), thresholdAmount, slippageGood);
    setPair(pr);
    setAmountIn(p[0]);
    setThresholdAmount(thresholdAmount);
    return !slippageGood;
  }

  async function performSwap(e) {
    e.preventDefault();
    if(isErr) return toast.e('please resolve error first!');
    if(!wallet.priAccount.length && !wallet.isConnected) {
      l_t.e('please connect wallet first!');
      return;
    }
    console.log('performing swap operation');
    
    log.i('pair:', pair);
    RouterContract.swap_TT(
      [
        amountIn,
        thresholdAmount,
        pair,
        wallet.priAccount,
        getDeadline(swap.deadLine),
      ],
      isExactIn
    );
  }

  function upsideDown(e) {
    e.preventDefault();
    let t = [swap.token1, swap.token2],
        s = [swap.token1_sym, swap.token2_sym],
        a = [swap.token1_addr, swap.token2_addr];

    isExactIn ? 
    setOtherTokenValue(t[0], 2, [a[1], a[0]]) :
    setOtherTokenValue(t[1], 1, [a[1], a[0]]);
    
    dispatch(setTokenInfo({sym: s[1], addr: a[1], n: 1}));
    dispatch(setTokenInfo({sym: s[0], addr: a[0], n: 2}));
      
  }

  async function setOtherTokenValue(v, n, p) {
    resetStates();
    setIsExactIn(!(n-1));
    // set current token value to what is given
    dispatch(setTokenValue({v, n}));
    setIsFetching(!0);
    // check if given value is non-zero
    if(v.length && parseFloat(v) > 0) {
      // if n is 1, exact is input (exactIn) => we need to get amount for out i.e. getAmountsOut()
      // if n is 2, exact is output (exactOut) => we need to get amount for in i.e. getAmountsIn()
      try {
        p = p || [swap.token1_addr, swap.token2_addr];
        let newPair = await checkIfHasPair(p), e1='', e2='';
        TokenContract.init(p ? p[n-1] : swap[`token${n}_addr`]);
        let dec = await TokenContract.decimals();
        let typedAmount = v;
        v = spow(v, dec);
        let amounts = n-1 ? await RouterContract.getAmountsIn([v, newPair]) : await RouterContract.getAmountsOut([v, newPair]) ;
        let inOrOutAmount = n-1 ? amounts[0] : amounts[amounts.length-1], 
            xch = toGib(
              spow(
                bigDiv(
                  inOrOutAmount,
                  BigNumber.from(v)
                ), dec
              ), dec
            );
        let amt = inOrOutAmount.toString();

        TokenContract.init(p ? p[n-1 ? 0 : 1] : swap[`token${n-1 ? 1 : 2}_addr`]);
        dec = await TokenContract.decimals();
        let _tmpAmt = BigNumber.from(n-1 ? amt : v);
        TokenContract.init(swap.token1_addr);
        // check balance for token 1
        let bal = await TokenContract.balanceOf(wallet.priAccount);
        let hasBal = bal.gt(_tmpAmt);
        
        // check allowance for token 1
        let allowance = await TokenContract.allowance(wallet.priAccount, ADDRESS.ROUTER_CONTRACT);
        let isApproved = allowance.gt(_tmpAmt);
        
        if(!hasBal) {
          setIsErr(!0);
          setErrText('Insufficient balance for ' + swap.token1_sym);
        } else if(!isApproved) {
          setIsErr(!0);
          setErrText('Approve ' + swap.token1_sym);
        } else setIsErr(!1);
        //fixed the exponential value v
        if(v/10**18<0.000001)
        {
          console.log("vvvv",v/10**18);
          console.log("nnnnnnnllllllllllllllll",(amt/10**18).toFixed(20));
          v=(amt/10**18).toFixed(20);
        }
        else{
        v = toGib(amt, dec);
        }

        // v = toGib(amt, dec);
        setTimeout(async _ => await badSwapCheck(typedAmount, newPair, inOrOutAmount, !!!(n-1), n, e2), 1000);
        // set another token value
        dispatch(setTokenValue({v, n:n-1?1:2}));
        setXchangeEquivalent(xch);
        setIsFetching(!1);
        setTokenApproved(isApproved);
      } catch(e) {
        log.e(e);
        try{e = e.toString().match(/\"(.*?)\"/)[1].split(':')[1].trim(); l_t.e(e);}catch(ee){};
      }
      return;
    } else {
      dispatch(setTokenValue({v, n:0}));
    }
    setIsFetching(!1);
    setIsExactIn(!0);
    dispatch(setTokenValue({v:'', n:n-1?1:2}));
  }

  function token(addr) {
    return swap.tokenList.filter(t => t.addr === addr)[0];
  }

  async function searchOrImportToken(v) {
    v = v.trim();
    if(!v.length) v = swap.tokenList;
    else if(isValidAddr(v) && !swap.tokenList.filter(tkn => tkn.addr === v).length) {
      
      TokenContract.init(v);
      let name = await TokenContract.name();
      let sym = await TokenContract.symbol();
      let dec = await TokenContract.decimals();
      // wallet must be connected for this!
      let bal = await TokenContract.balanceOf(wallet.priAccount);
      bal = bal.toBigInt().toString();
      v = [{name, sym, dec, bal, addr: v, icon: GenIcon, imported: !1}]
    } else {
      v = swap.tokenList.filter(tkn => {
        if(tkn.sym.toLowerCase().indexOf(v.toLowerCase()) >= 0) return !0;
        if(tkn.addr === v) return !0;
        return !1;
      });
    }
    dispatch(changeTokenList(v));
  }

  function importToken() {
    let token = swap.tokenList_chg[0];
    dispatch(addToTokenList({...token, imported: !0}));
    dispatch(changeTokenList([{...token, imported: !0}]));
  }

  function resetTList_chg() {
    dispatch(changeTokenList(swap.tokenList));
  }

  // ------------------------------------------------------

  // ------------------ other code ------------------------

  async function claimCST(e) {
    // if(!wallet.isConnected){

      e.preventDefault();
      let hasClaimed = await FaucetContract.hasClaimed(wallet.priAccount);
      if(hasClaimed) {
        l_t.e('already claimed!');
        return;
      }
      await FaucetContract.claimCST();
      l_t.s('claim success!. please check your account.');
    // }
  }

  //Disconnect wallet functionality
  // const disconnect = () => {
  //     dispatch(walletConnected(false));
  //     dispatch(setPriAccount(''));
  //     setConnectTitle("Connect Wallet")
  //     l_t.e('Wallet Disconnected!');
  // }

  // ------------------------------------------------------
  const connectWalletCbk = str => dispatch(setConnectTitle(str));
  return (
    <>
      <section className="swapheader_Sec">
        <Container>
          <div className="swapCmn_cont">
            <div className="swapHeader_img">
              <img src={headerImg} />
            </div>
          </div>
        </Container>
      </section>
      <Layout>
        <section className="swapComn_Sec">
          <Container className="swapCmn_cont">
            {/* connect wallet section */}
            <Row className="connectWallet_Row">
              <Col xl={6} md={6} sm={12}>
                <div className="connectWallet_Left">
                  <img src={draco} alt="img" />
                </div>
              </Col>
              <Col xl={6} md={6} sm={12}>
                <div className="connectWallet_Right">
                  <ButtonPrimary
                    title={wallet.connectTitle}
                    className="connectWallet"
                    onClick={handleShow}
                  />
                  <ConnectWalletModal
                    show={show}
                    onHide={handleClose}
                    conTitleCbk={connectWalletCbk}
                    />
                    {/* {wallet.isConnected ? 
                    <button onClick = {disconnect}>Disconnect Wallet</button>
                    : ''} */}
                  <h1>Claim</h1>
                  <ButtonPrimary title="1000 cts" className="ctsBtn" onClick={claimCST} />
                  <p>(Crypto stars tokens)</p>
                </div>
              </Col>
            </Row>
            {/* swap coin section */}
            <Row className="swapRow">
              <Col xl={12} md={12} sm={12}>
                <div className="swapCard">
                  <div className="settingWrap">
                    <span className="me-3" onClick={recentHndShow}>
                      <img src={timer} alt="icon" />
                    </span>
                    <span onClick={settingHndShow}>
                      <img src={settings} alt="icon" />
                    </span>
                    <RecentTransactions
                      show={recentShow}
                      onHide={recentHndClose}
                    />
                    <SettingModal
                      show={settingsShow}
                      onHide={settingHndClose}
                      states={
                        {
                          dLine: {
                            val: swap.deadLine,
                            cbk: e => dispatch(setDeadLine(e.target.value))
                          },
                          slip: {
                            val: swap.slippage,
                            cbk: e => dispatch(setSlippage(e.target.value))
                          },
                        }
                      }
                    />
                  </div>
                  <Form>
                    <CustomInputgroup 
                      icon={cstcoin} 
                      title="Swap From"
                      type='number'
                      states={
                        {
                          token: {
                            val: swap.token1, 
                            cbk: e => setOtherTokenValue(e.target.value, 1)
                          },
                          tList: {
                            val: swap.token1_sym,
                            importCbk: _ => importToken(),
                            scbk: v => searchOrImportToken(v),
                            resetTList_chg: _ => resetTList_chg(),
                            cbk: (sym, addr) => dispatch(setTokenInfo({sym, addr, n: 1}))
                          }
                        }
                      }
                    />
                    <button className="swapSwitch" onClick={upsideDown}>
                      <img src={swapicon} alt="swap_icon" />
                    </button>
                    <CustomInputgroup
                      icon={lamescoin}
                      title="Swap To (est.)"
                      states={
                        {
                          token: {
                            val: swap.token2, 
                            cbk: e => setOtherTokenValue(e.target.value, 2)
                          },
                          tList: {
                            val: swap.token2_sym,
                            importCbk: _ => importToken(),
                            scbk: v => searchOrImportToken(v),
                            resetTList_chg: _ => resetTList_chg(),
                            cbk: (sym, addr) => dispatch(setTokenInfo({sym, addr, n: 2}))
                          }
                        }
                      }
                    />
                    {
                      !isFetching ?
                      <div className='tokenXchangePriceWrap'>
                        <div className='tokenXchangePrice'>
                          <span>{`1 ${token(swap.token2_addr)?.sym} = `}</span>
                          <span>{`${xchangeEquivalent} ${token(swap.token1_addr)?.sym}`}</span>
                        </div>
                      </div> : 
                      <div className='tokenXchangePriceWrap'>
                        <Loader text='Fetching info...' stroke='white'/>
                      </div>
                    }
                    <div className="slippageWrap">
                      <div className="slipageText">
                        <span>Slippage Tolerance</span>
                        <span>{swap.slippage}%</span>
                      </div>
                    </div>
                    {
                      isErr ?
                      <div className='error-box'>
                        <p>{errText}</p>
                      </div> :

                
                      
                      (
                        !tokenApproved ?
                        <button
                          className="approve-btn" 
                          onClick={!isErr ? approveWithMaxAmount : _=>_}
                        >
                          {'Approve ' + swap.token1_sym}
                        </button> :

                        <button
                          disabled={isDisabled || isFetching || !wallet.isConnected}
                          className="swap-btn" 
                          onClick={!isErr ? performSwap : _=>_}
                        >
                          {!wallet.isConnected ? 'wallet not connected!' : isFetching ? 'please wait..' : 'Swap'}
                        </button>
                      )
                    }
                    
                  </Form>
                </div>
              </Col>
            </Row>
            <Row className="soccerPlayer_Row">
              <h2 className="playerTitle">Soccer Players</h2>
              <Col xl={6} md={6} sm={12}>
                <div className="soccerPlayer_left cmnBorder">
                  <PerfectScrollbar>
                    <ul className="playerList">
                      <PlayerList />
                    </ul>
                  </PerfectScrollbar>
                </div>
              </Col>
              <Col xl={6} md={6} sm={12}>
                <div className="soccerPlayer_Right cmnBorder">
                  <PlayerCard />
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Layout>
    </>
  );
};

export default Swap;
