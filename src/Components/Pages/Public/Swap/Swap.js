import "./Swap.scss";
import Loader from '../../../Loader';
import l_t from "../../../../services/logging/l_t";
import "react-perfect-scrollbar/dist/css/styles.css";
import log from '../../../../services/logging/logger';
import LMES from "../../../../Assets/Images/LMES.png";
import MSAL from "../../../../Assets/Images/MSAL.png";
import MBAP from "../../../../Assets/Images/MBAP.png";
import HAAL from "../../../../Assets/Images/HAAL.png";
import toast from '../../../../services/logging/toast';
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import CommonF from "../../../../services/contracts/common";
import { Container, Row, Col, Form } from "react-bootstrap";
import cstcoin from "../../../../Assets/Images/cst-coin.png";
import swapicon from "../../../../Assets/Images/swap-icon.png";
import headerImg from "../../../../Assets/Images/headerImg.png";
import draco from "../../../../Assets/Images/draco-roadmap.png";
import lamescoin from "../../../../Assets/Images/lames-coin.png";
import TokenContract from "../../../../services/contracts/token";
import timer from "../../../../Assets/Images/ionic-ios-timer.svg";
import RouterContract from "../../../../services/contracts/router";
import settings from "../../../../Assets/Images/Settings-Icon.svg";
import FaucetContract from '../../../../services/contracts/faucet';
import GenIcon from "../../../../Assets/Images/token_icons/Gen.svg";
import FactoryContract from '../../../../services/contracts/factory';
import { ADDRESS, INIT_VAL, MISC } from "../../../../services/constants/common";
import { getDeadline, getThresholdAmountFromTolerance } from "../../../../services/contracts/utils";
import { isAddr, toStd, toFixed, toDec, notEmpty, stdRaiseBy, toBigNum, nullFunc, notNumInput } from "../../../../services/utils";
import {
  Layout,
  PlayerCard,
  SettingModal,
  ButtonPrimary,
  CustomInputGroup,
  ConnectWalletModal,
  RecentTransactions,
} from "../../../Common";
import PerfectScrollbar from "react-perfect-scrollbar";

import { 
  setSlippage,
  setDeadLine,
  setTokenInfo,
  setTokenValue,
  addToTokenList,
  changeTokenList,
} from "../../../features/swap";

import {  setConnectTitle, setPriAccount, walletConnected } from '../../../features/wallet';

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
    wallet.isConnected && CommonF.init({from: wallet.priAccount})
  }, []);

  useEffect(_ => {
    resetStates()
  }, [swap.slippage])

  useEffect(_=>{
    log.i('pair:', pair);
    log.i('is err:', isErr);
    setIsDisabled(isErr);
  }, [])


  async function approveWithMaxAmount(e) {
    log.i('approving..')
    e.preventDefault();
    TokenContract.init(swap.token1_addr);
    setIsFetching(!0);
    await TokenContract.approve(MISC.MAX_256, ADDRESS.ROUTER_CONTRACT);
    setIsErr(!1);
    setIsFetching(!1);
    setTokenApproved(!0);
  }

  function resetStates() {
    setTokenApproved(!0);
    setIsDisabled(!0);
    setBtnText('Swap');
    // dispatch(setTokenValue({v: '', n: 0}));
  }
  // assumes Center Token is CST token
  async function tryNormalizePair(p) {
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

  async function setSwapPrerequisites(amount, pr, fetchedAmount, xactIn) {
    log.i(arguments, swap.slippage);
    const sellTokenAddr = isExactIn ? swap.token1_addr : swap.token2_addr;
    const buyTokenAddr = isExactIn ? swap.token2_addr : swap.token1_addr;
    TokenContract.init(sellTokenAddr);
    const sellTokenDec = await TokenContract.decimals();
    TokenContract.init(buyTokenAddr);
    const buyTokenDec = await TokenContract.decimals();
    
    let xactAmount = toStd(amount * 10**(xactIn ? sellTokenDec : buyTokenDec));
    log.i('fetchedAmount:', fetchedAmount.to);
    let thAmount = getThresholdAmountFromTolerance(fetchedAmount, swap.slippage, xactIn, xactIn ? buyTokenDec : sellTokenDec)
    log.i('Final TH amount:', thAmount);
    log.s(btnText);
    setPair(pr);
    setAmountIn(xactAmount);
    setThresholdAmount(thAmount.toString());
    return !0;
  }

  async function performSwap(e) {
    e.preventDefault();
    if(isErr) return toast.e('please resolve error first!');
    if(!wallet.priAccount.length) {
      l_t.e('please connect wallet first!');
      return;
    }
    console.log('performing swap operation');
    
    log.i('TH Amount:', thresholdAmount);

    await RouterContract.swap_TT(
      [
        amountIn,
        thresholdAmount,
        pair,
        wallet.priAccount,
        getDeadline(swap.deadLine),
      ],
      isExactIn
    );
    l_t.s('Swap Success!');
  }

  function upsideDown(e) {
    e.preventDefault();
    let t = [swap.token1, swap.token2],
        s = [swap.token1_sym, swap.token2_sym];

    isExactIn ? 
    setOtherTokenValue(t[0], 2, !0) :
    setOtherTokenValue(t[1], 1, !0);
    // switch tokenInfo
    dispatch(setTokenInfo({sym: s[1], addr: swap.token2_addr, n: 1}));
    dispatch(setTokenInfo({sym: s[0], addr: swap.token1_addr, n: 2}));
      
  }
  
  // if n is 1, exact is input (exactIn) => we need to get amount for out i.e. getAmountsOut()
  // if n is 2, exact is output (exactOut) => we need to get amount for in i.e. getAmountsIn()
  async function setOtherTokenValue(typedValue, ipNum, isUpsideDown) {
    resetStates();
    const xactIn = !(ipNum - 1);
    const otherTokenNum = ipNum - 1 ? 1: 2;
    setIsExactIn(xactIn);
    // CHheck for invalid input
    if(notNumInput(typedValue)) return dispatch(setTokenValue({ V: '', n: ipNum }));

    dispatch(setTokenValue({v: typedValue, n: ipNum}));
    setIsFetching(!0);
    // check if given value is non-zero
    if(notEmpty(typedValue)) {
      try {
        const addrList = isUpsideDown ? 
          [swap.token2_addr, swap.token1_addr] : 
          [swap.token1_addr, swap.token2_addr];
        const pair = await tryNormalizePair(addrList);
        // get contract instance
        TokenContract.init(
          isUpsideDown ? // if coming from upsideDown()
          addrList[ipNum - 1] : // select addr of second token 
          swap[`token${ipNum}_addr`] // otherwise addr of exact token
        );
        let dec = await TokenContract.decimals();
        const param = [stdRaiseBy(typedValue, dec), pair];
        let fetchedAmounts = await (
          xactIn ? 
          RouterContract.getAmountsOut(param) : 
          RouterContract.getAmountsIn(param)
        );
        const fetchedAmount = xactIn ? 
          fetchedAmounts[fetchedAmounts.length - 1] : 
          fetchedAmounts[0]; 
        log.i('fetched amount:', fetchedAmount);
        let fetchedAmountFraction = toDec(fetchedAmount, dec);
        const xchangePrice = toFixed(
          xactIn ? 
          typedValue / fetchedAmountFraction : 
          fetchedAmountFraction / typedValue, 
          4
        );
        log.i('fetched amount frac before:', fetchedAmountFraction);
        fetchedAmountFraction = toFixed(fetchedAmountFraction, 20);
        log.i('fetched amount frac:', fetchedAmountFraction);
        const buyAmountFraction = xactIn ? typedValue : fetchedAmountFraction;
        
        TokenContract.init(
          isUpsideDown ? // if coming from upsideDown()! 
          addrList[xactIn ? 1 : 0] : 
          swap[`token${xactIn ? 2 : 1}_addr`]);
        
        dec = await TokenContract.decimals();
        
        let sellAmount = toBigNum(
          xactIn ? // if exact amount is in top input
          param[0] : // typed exact ip amount 
          fetchedAmount // fetched ip amount (in top input)
        );
        log.i('sell Amount frac:', sellAmount);
        log.i('buy Amount frac:', buyAmountFraction);
        TokenContract.init(swap.token1_addr);
        // check balance for token 1
        let balance = await TokenContract.balanceOf(wallet.priAccount);
        
        if(balance.lte(sellAmount)) {
          setIsErr(!0);
          setIsFetching(!1);
          dispatch(setTokenValue({v: '', n: otherTokenNum}));
          return setErrText('Insufficient balance for ' + swap.token1_sym);
        }
        
        // check allowance for token 1
        let allowance = await TokenContract.allowance(wallet.priAccount, ADDRESS.ROUTER_CONTRACT);
        let isApproved = allowance.gt(sellAmount);
        
        
        if(!isApproved) {
          setIsErr(!0);
          setTokenApproved(!1);
          setErrText('Approve ' + swap.token1_sym);
          dispatch(setTokenValue({v: '', n: otherTokenNum}));
        } else {
          setIsErr(!1);
        }
        
        await setSwapPrerequisites(typedValue, pair, fetchedAmount, xactIn, ipNum)
        // set another token value
        setXchangeEquivalent(xchangePrice);
        setIsFetching(!1);
        dispatch(setTokenValue({v: fetchedAmountFraction, n: otherTokenNum}));
      } catch(e) {
        log.e(e);
      }
      return;
    } else {
      dispatch(setTokenValue({v: typedValue, n: 0}));
    }
    setIsFetching(!1);
    setIsExactIn(!0);
    dispatch(setTokenValue({v: '', n: otherTokenNum}));
  }

  function token(addr) {
    return swap.tokenList.filter(t => t.addr === addr)[0];
  }

  async function searchOrImportToken(v) {
    v = v.trim();
    if(!v.length) v = swap.tokenList;
    else if(isAddr(v) && !swap.tokenList.filter(tkn => tkn.addr === v).length) {
      
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
    e.preventDefault();
    let hasClaimed = await FaucetContract.hasClaimed(wallet.priAccount);
    if(hasClaimed) {
      l_t.e('already claimed!');
      return;
    }
    await FaucetContract.claimCST();
    l_t.s('claim success!. please check your account.');
  }

   //Disconnect wallet functionality
  const disconnect = () => {
    dispatch(setPriAccount(''));
    dispatch(walletConnected(!1));
    dispatch(setConnectTitle(MISC.CONNECT_TTL))
    // window.location.reload();
  }
  // ------------------------------------------------------

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
                    conTitleCbk={t => dispatch(setConnectTitle(t))}
                  />
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
                    <CustomInputGroup 
                      icon={cstcoin} 
                      title="Swap From"
                      states={
                        {
                          token: {
                            val: swap.token1, 
                            cbk: e => setOtherTokenValue(e.target.value, 1, !1)
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
                    <CustomInputGroup
                      icon={lamescoin}
                      title="Swap To (est.)"
                      states={
                        {
                          token: {
                            val: swap.token2, 
                            cbk: e => setOtherTokenValue(e.target.value, 2, !1)
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
                        isErr && !tokenApproved ?
                        <div className='error-box'>
                          <p>{errText}</p>
                        </div> : <></>
                    }
                    {
                        !tokenApproved ? 
                        <button
                          className="approve-btn" 
                          onClick={approveWithMaxAmount}
                        >
                          {'Approve ' + swap.token1_sym}
                        </button> :
                        <button
                          disabled={
                            !wallet.isConnected || 
                            isFetching
                          }
                          className="swap-btn" 
                          onClick={
                            !isErr &&
                            !isFetching &&
                            walletConnected ?
                            performSwap :
                            nullFunc
                          }
                        >
                          {
                            !wallet.isConnected ?
                              'wallet not connected' :
                              isFetching ?
                                'please wait..' : 
                                'Swap'
                          }
                        </button>
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

