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
import { nullFunc, isEmpty, Debouncer, rEqual, notEqual, eHandle, debounce } from "../../../../services/utils";
import swapicon from "../../../../Assets/Images/swap-icon.png";
import headerImg from "../../../../Assets/Images/headerImg.png";
import draco from "../../../../Assets/Images/draco-roadmap.png";
import timer from "../../../../Assets/Images/ionic-ios-timer.svg";
import settings from "../../../../Assets/Images/Settings-Icon.svg";
import {  setConnectTitle, walletConnected } from '../../../features/wallet';
import { setSlippage, setDeadLine, setTokenInfo } from "../../../features/swap";
import { DEBOUNCE_ID, ERR, TOKEN } from "../../../../services/constants/common";
import l_t from "../../../../services/logging/l_t";



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

  useEffect(_ => { swapHook.resetStates() }, [swap.slippage])
  useEffect(_ => { swapHook.setIsDisabled(swapHook.state.isErr) }, [])
  useEffect(_ => { log.i('Exact In state changed to: ' + swap.isExactIn) }, [swap.isExactIn]);
  
  useEffect(_ => {
      if(wallet.isConnected) {
        swapHook.initialSteps(TOKEN.A);
        swapHook.checkIfCSTClaimed();
        CommonF.init({from: wallet.priAccount})
      } else {
        swapHook.initialSteps(TOKEN.BOTH);
      }
  }, [wallet.isConnected])

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
                    className={`btn--claim-cst${swapHook.state.isClaiming ? ' claiming-text' : ''}`}
                    disabled={
                      !wallet.isConnected ||
                      swapHook.state.isInvalidNetwork ||
                      swapHook.state.isCSTClaimed || 
                      swapHook.state.isClaiming
                    }
                    title={
                      swapHook.state.isClaiming ? 
                      'please wait..' :
                      swapHook.state.isCSTClaimed ? 
                      'claimed!' : 
                      'claim'
                    } 
                    onClick={
                      swapHook.state.isCSTClaimed ? 
                      nullFunc : 
                      swapHook.claimCST
                    }
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
                            val: swap.token1_value.ui,
                            balance: swapHook.state.token1_bal.ui,
                            showMaxBtn: swapHook.state.showMaxBtn1,
                            showBalance: swapHook.state.showBalance1,
                            setToMaxAmount: _ => swapHook.setToMaxAmount(TOKEN.A),
                            disabled: swapHook.state.isFetching && !swapHook.state.isExactIn,
                            inputCallback: e => {
                              swapHook.setTokenIp(e.target.value, TOKEN.A);
                              swapHook.setShowMaxBtn1(!0);
                              debounce(swapHook.setOtherTokenValue, [TOKEN.A, !1], DEBOUNCE_ID.IP_A)
                            }
                          },
                          tList: {
                            val: swap.token1_sym,
                            importCallback: _ => swapHook.importToken(),
                            resetTList_chg: _ => swapHook.resetTList_chg(),
                            searchCallback: v => swapHook.searchOrImportToken(v),
                            tokenSelectCallback: (sym, addr, icon) => {
                                if(!wallet.isConnected) return l_t.e(ERR.CONNECT_WALLET);
                                dispatch(
                                  setTokenInfo({
                                    sym, 
                                    addr, 
                                    icon, 
                                    n: TOKEN.A, 
                                    disabled: !0, 
                                    isUpDown: !1, 
                                    cbk: swapHook.checkPair
                                  })
                                )
                            }
                          }
                        }
                      }
                    />
                    <button
                      className="swapSwitch" 
                      onClick={e => {
                        eHandle(e);
                        swapHook.upsideDown_wrap();
                        // debounce(swapHook.upsideDown_wrap, [], DEBOUNCE_ID.UPSIDE_DOWN, 1500);
                      }}
                    > <img src={swapicon} alt="swap_icon" /> 
                    </button>
                    <CustomInputGroup
                      icon={swap.token2_icon}
                      title="Swap To (est.)"
                      states={
                        {
                          token: {
                            val: swap.token2_value.ui,
                            balance: swapHook.state.token2_bal.ui,
                            showMaxBtn: swapHook.state.showMaxBtn2,
                            showBalance: swapHook.state.showBalance2,
                            setToMaxAmount: _ => swapHook.setToMaxAmount(TOKEN.B),
                            disabled: swapHook.state.isFetching && swapHook.state.isExactIn,
                            inputCallback: e => {
                              swapHook.setTokenIp(e.target.value, TOKEN.B);
                              swapHook.setShowMaxBtn2(!0);
                              debounce(swapHook.setOtherTokenValue, [TOKEN.B, !1], DEBOUNCE_ID.IP_B)
                            }
                          },
                          tList: {
                            val: swap.token2_sym,
                            importCallback: _ => swapHook.importToken(),
                            resetTList_chg: _ => swapHook.resetTList_chg(),
                            searchCallback: v => swapHook.searchOrImportToken(v),
                            tokenSelectCallback: (sym, addr, icon) => {
                              if(!wallet.isConnected) return l_t.e(ERR.CONNECT_WALLET);  
                                dispatch(
                                  setTokenInfo({
                                    sym, 
                                    addr, 
                                    icon, 
                                    n: TOKEN.B, 
                                    disabled: !0, 
                                    isUpDown: !1, 
                                    cbk: swapHook.checkPair
                                  })
                                )
                            }
                          }
                        }
                      }
                    />
                    {
                      (
                        isEmpty(swap.token1_value.ui) || 
                        isEmpty(swap.token1_value.ui)
                      ) ?
                      <></> :
                      swapHook.state.isFetching ?
                      <div className='tokenXchangePriceWrap'>
                        <Loader text='Fetching info...' stroke='white'/>
                      </div> :
                      swapHook.state.showXchangeRate ?
                        <div className='tokenXchangePriceWrap'>
                          <div className='tokenXchangePrice'>
                            <span>
                              {`1 ${swapHook.token(swap.token2_addr)?.sym} = `}
                            </span>
                            <span>
                              {`${swapHook.state.xchangeEquivalent} ${swapHook.token(swap.token1_addr)?.sym}`}
                            </span>
                          </div>
                          <div className="price-impact d-none">
                            <span>Price Impact</span>
                            <span>
                              {`${swapHook.state.priceImpactPercent}%`}
                            </span>
                          </div>
                        </div> :
                        <></> 
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
                            swapHook.state.isInvalidNetwork ||
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
                            swapHook.state.isInvalidNetwork ?
                              'invalid network' :
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

