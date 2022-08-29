import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomModal from "./CustomModal";
import { setPriAccount, setWalletType, walletConnected } from "../../features/wallet";

import Wallet from "../../../services/wallet";
import CommonF from "../../../services/contracts/common";
import l_t from "../../../services/logging/l_t";
import { EVENT, LS_KEYS, MISC } from "../../../services/constants/common";
import log from "../../../services/logging/logger";
import toast from "../../../services/logging/toast";
import { PROVIDER_EVENT, WALLET_TYPE } from "../../../services/constants/wallet";
import { useEffect } from "react";
import { isAddr, isDefined, notEmpty, rEqual } from "../../../services/utils";
import { Err, LocalStore } from "../../../services/xtras";
import METAMASK_LOGO from '../../../Assets/Images/wallet-logos/metamask.png';
import WALLET_CONNECT_LOGO from '../../../Assets/Images/wallet-logos/walletconnect.png';


const truncAddr = a => isDefined(a) && notEmpty(a) ? `${a.slice(0, 5)}..${a.slice(39, 42)}` : MISC.CONNECT_TTL;

const ConnectWalletModal = (props) => {
  const dispatch = useDispatch();
  const wallet = useSelector(s => s.wallet);

  function postWalletConnection(addr) {
    CommonF.init({from: addr});
    dispatch(setPriAccount(addr));
    dispatch(walletConnected(isAddr(addr)));
    props.conTitleCbk(isAddr(addr) ? truncAddr(addr) : MISC.CONNECT_TTL);

  }

  const lock = useRef(!0);

  useEffect(_ => {
    (
      async() => {
        if(lock.current) {
          if(wallet.isConnected) {
            log.i('pri account', Wallet);
            if(LocalStore.has(LS_KEYS.WALLET_TYPE)) {
              await connect2wallet(LocalStore.get(LS_KEYS.WALLET_TYPE));
              let acc = Wallet.priAccount;
              props.conTitleCbk(truncAddr(acc));
            }
          } else{
            props.conTitleCbk(MISC.CONNECT_TTL)
          }
          lock.current = !1;
        }
      }
    )()
    document.addEventListener(EVENT.ACC_CHANGE, e => {
      l_t.s('Account changed!', {position: 'top-left'});
      props.conTitleCbk(truncAddr(e.detail.newAccount));
    })
}, [wallet.isConnected])

  const connect2wallet = async walletType => {
    try {
      await Wallet.init(walletType);
      await Wallet.ensureChain();
      const acc = Wallet.priAccount;
      const provider = Wallet.provider;
      if (acc) {
        l_t.s('Wallet connected!');
        LocalStore.add(LS_KEYS.WALLET_TYPE, walletType);
        dispatch(setPriAccount(acc));
        dispatch(setWalletType(walletType));
        props.onHide(!1);
        postWalletConnection(acc);
      }
    } catch (e) {
      Err.handle(e);
    }
  }

  //Disconnect wallet functionality
  const disconnect = (walletType) => {
    // add functionality for disconnecting from WalletConnect, using walletType param
    // ...
    // ...
    LocalStore.del(LS_KEYS.WALLET_TYPE);
    props.conTitleCbk(MISC.CONNECT_TTL);
    dispatch(walletConnected(!1));
    dispatch(setPriAccount(''));
    props.onHide(!1);
    l_t.s('Wallet disconnection success!');
}

  return (
    <CustomModal
      show={props.show}
      onHide={props.onHide}
      clsName="connect-modal"
      title="Connect To Wallet"
    >
      <ul>
        <li>
          <button
            className={
              `img--wallet-logo img--wallet-logo-mm${
                wallet.isConnected && rEqual(WALLET_TYPE.METAMASK, wallet.walletType) ? 
                ' disconnect-wallet' : 
                wallet.isConnected && rEqual(WALLET_TYPE.WALLET_CONNECT, wallet.walletType) ?
                ' disabled--wallet-btn' : ''
              }`
            }
            disabled={wallet.isConnected && rEqual(WALLET_TYPE.WALLET_CONNECT, wallet.walletType)}  
            onClick={ 
              wallet.isConnected ?
                _ => {
                  _.preventDefault(); 
                  _.stopPropagation();
                  disconnect();
                } :
                _ => {
                  _.preventDefault();
                  _.stopPropagation();
                  connect2wallet(WALLET_TYPE.METAMASK);
                }
            }
          >
            { 
              wallet.isConnected && rEqual(WALLET_TYPE.METAMASK, wallet.walletType) ? 
                'Disconnect from Metamask' : 
                'Metamask' 
            }
          </button>
        </li>
        {/* <li>
          <button 
            onClick={ 
              wallet.isConnected ?
              _ => {
                _.preventDefault(); 
                _.stopPropagation();
                disconnect();
              } :
              _ => {
                _.preventDefault();
                _.stopPropagation();
                connect2wallet(WALLET_TYPE.TRUST_WALLET);
              }
            }
          >
            {
              wallet.isConnected && rEqual(WALLET_TYPE.TRUST_WALLET, wallet.walletType) ? 
                'Disconnect from TrustWallet' : 
                'Connect To TrustWallet' 
            }
          </button>
        </li> */}
        <li>  
          <button 
            className={
              `img--wallet-logo img--wallet-logo-wc${
                wallet.isConnected && rEqual(WALLET_TYPE.WALLET_CONNECT, wallet.walletType) ? 
                ' disconnect-wallet' : 
                wallet.isConnected && rEqual(WALLET_TYPE.METAMASK, wallet.walletType) ?
                ' disabled--wallet-btn' : ''
              }`
            }
            disabled={wallet.isConnected && rEqual(WALLET_TYPE.METAMASK, wallet.walletType)} 
            onClick={ 
              wallet.isConnected ?
              _ => {
                _.preventDefault(); 
                disconnect();
              } :
              _ => {
                _.preventDefault();
                connect2wallet(WALLET_TYPE.WALLET_CONNECT);
              }
            }
          >
            {
              wallet.isConnected && rEqual(WALLET_TYPE.WALLET_CONNECT, wallet.walletType) ? 
                'Disconnect from WalletConnect' : 
                'WalletConnect' 
            }
          </button>
        </li>
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
