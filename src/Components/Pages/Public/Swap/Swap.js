import {
  Layout,
  PlayerCard,
  SettingModal,
  ButtonPrimary,
  CustomInputGroup,
  ConnectWalletModal,
  RecentTransactions,
} from "../../../Common";

import "./Swap.scss";
import Loader from '../../../Loader';
import useSwap from "../../../features/hooks/swap";
import "react-perfect-scrollbar/dist/css/styles.css";
import log from '../../../../services/logging/logger';
import LMES from "../../../../Assets/Images/LMES.png";
import MSAL from "../../../../Assets/Images/MSAL.png";
import MBAP from "../../../../Assets/Images/MBAP.png";
import HAAL from "../../../../Assets/Images/HAAL.png";
import { useDispatch, useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import React, { useEffect, useRef, useState } from "react";
import CommonF from "../../../../services/contracts/common";
import { Container, Row, Col, Form } from "react-bootstrap";
import { nullFunc, isEmpty, Debouncer } from "../../../../services/utils";
import swapicon from "../../../../Assets/Images/swap-icon.png";
import headerImg from "../../../../Assets/Images/headerImg.png";
import draco from "../../../../Assets/Images/draco-roadmap.png";
import timer from "../../../../Assets/Images/ionic-ios-timer.svg";
import settings from "../../../../Assets/Images/Settings-Icon.svg";
import {  setConnectTitle, walletConnected } from '../../../features/wallet';
import { setSlippage, setDeadLine, setTokenInfo } from "../../../features/swap";



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

  const swapHook = useSwap();
  
  // redux states
  const swap = useSelector(s => s.swap);
  const wallet = useSelector(s => s.wallet);

    // helpers
  const [show, setShow] = useState(!1);
  const handleShow = () => setShow(!0);
  const handleClose = () => setShow(!1);
  const recentHndShow = () => setRecentShow(!0);
  const recentHndClose = () => setRecentShow(!1);
  const settingHndShow = () => setSettingsShow(!0);
  const [recentShow, setRecentShow] = useState(!1);
  const settingHndClose = () => setSettingsShow(!1);
  const [settingsShow, setSettingsShow] = useState(!1);

  const lock = useRef(!0);
  const conditionalLock = useRef(!0);

  useEffect(_ => {
    if(lock.current) {
      swapHook.resetTokenInfos();
      swapHook.resetTokenValues();
      lock.current = !1;
    }
  }, [])

useEffect(_ => {
  if(conditionalLock.current) {
    if(wallet.isConnected) {
      swapHook.checkIfCSTClaimed();
      CommonF.init({from: wallet.priAccount})
      conditionalLock.current = !1;
    }
  }
}, [wallet.isConnected])

  useEffect(_ => {
    swapHook.resetStates();
  }, [swap.slippage])

  useEffect(_=>{
    swapHook.setIsDisabled(swapHook.state.isErr);
  }, [])

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
                  <p className="heading--claim-cst">
                    Claim 1000 CST
                  </p>
                  <ButtonPrimary 
                    className="btn--claim-cst" 
                    disabled={swapHook.state.isCSTClaimed}
                    title={swapHook.state.isCSTClaimed ? 'claimed!' : 'claim'} 
                    onClick={swapHook.state.isCSTClaimed ? nullFunc : swapHook.claimCST}
                  />
                  <p>(CryptoStars Tokens)</p>
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
                      recentTxList={swap.recentTxList}
                    />
                    <SettingModal
                      show={settingsShow}
                      onHide={settingHndClose}
                      states={
                        {
                          dLine: {
                            deadLineValue: swap.deadLine,
                            setDeadLine: e => dispatch(setDeadLine(e.target.value))
                          },
                          slip: {
                            slippageValue: swap.slippage,
                            setSlippage: e => dispatch(setSlippage(e.target.value)),
                            updateSlippageOnUI: v => dispatch(setSlippage(v)),
                          },
                        }
                      }
                    />
                  </div>
                  <Form>
                    <CustomInputGroup 
                      icon={swap.token1_icon} 
                      title="Swap From"
                      states={
                        {
                          token: {
                            val: swap.token1,
                            disabled: swapHook.state.isFetching && !swapHook.state.isExactIn,
                            cbk: e => Debouncer.debounce(swapHook.setOtherTokenValue, [e.target.value, 1, !1])
                          },
                          tList: {
                            val: swap.token1_sym,
                            importCbk: _ => swapHook.importToken(),
                            scbk: v => swapHook.searchOrImportToken(v),
                            resetTList_chg: _ => swapHook.resetTList_chg(),
                            cbk: (sym, addr, icon) => dispatch(setTokenInfo({sym, addr, icon, n: 1, disabled: !0, isUpDown: !1}))
                          }
                        }
                      }
                    />
                    <button 
                      className="swapSwitch" 
                      onClick={swapHook.upsideDown}
                    > <img src={swapicon} alt="swap_icon" /> 
                    </button>
                    <CustomInputGroup
                      icon={swap.token2_icon}
                      title="Swap To (est.)"
                      states={
                        {
                          token: {
                            val: swap.token2, 
                            disabled: swapHook.state.isFetching && swapHook.state.isExactIn,
                            cbk: e => Debouncer.debounce(swapHook.setOtherTokenValue, [e.target.value, 2, !1])
                          },
                          tList: {
                            val: swap.token2_sym,
                            importCbk: _ => swapHook.importToken(),
                            scbk: v => swapHook.searchOrImportToken(v),
                            resetTList_chg: _ => swapHook.resetTList_chg(),
                            cbk: (sym, addr, icon) => dispatch(setTokenInfo({sym, addr, icon, n: 2, disabled: !0, isUpDown: !1}))
                          }
                        }
                      }
                    />
                    {
                      (isEmpty(swap.token1) || isEmpty(swap.token2)) ?
                      <></> :
                      swapHook.state.isFetching ?
                      <div className='tokenXchangePriceWrap'>
                        <Loader text='Fetching info...' stroke='white'/>
                      </div> :
                      <div className='tokenXchangePriceWrap'>
                        <div className='tokenXchangePrice'>
                          <span>
                            {`1 ${swapHook.token(swap.token2_addr)?.sym} = `}
                          </span>
                          <span>
                            {`${swapHook.state.xchangeEquivalent} ${swapHook.token(swap.token1_addr)?.sym}`}
                          </span>
                        </div>
                      </div> 
                    }
                    <div className="slippageWrap">
                      <div className="slipageText">
                        <span>Slippage Tolerance</span>
                        <span>{swap.slippage}%</span>
                      </div>
                    </div>
                    {
                        !swapHook.state.tokenApproved ? 
                        <button
                          className="approve-btn" 
                          onClick={swapHook.approveWithMaxAmount}
                        > {'Approve ' + swap.token1_sym}
                        </button> :
                        <button
                          disabled={
                            !wallet.isConnected || 
                            swapHook.state.isFetching ||
                            swapHook.state.isErr
                          }
                          className="swap-btn" 
                          onClick={
                            !swapHook.state.isErr &&
                            !swapHook.state.isFetching &&
                            walletConnected ?
                            swapHook.performSwap :
                            nullFunc
                          }
                        >
                          {
                            !wallet.isConnected ?
                              'wallet not connected' :
                              swapHook.state.isFetching ?
                                'please wait..' : 
                              swapHook.state.isErr ?
                              swapHook.state.errText :
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

