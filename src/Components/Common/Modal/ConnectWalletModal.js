import React from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomModal from "./CustomModal";
import { setPriAccount, setWalletType, walletConnected } from "../../features/wallet";

import Wallet from "../../../services/wallet";
import CommonF from "../../../services/contracts/common";
import l_t from "../../../services/logging/l_t";
import { EVENT, MISC } from "../../../services/constants/common";
import log from "../../../services/logging/logger";
import toast from "../../../services/logging/toast";
import { WALLET_TYPE } from "../../../services/constants/wallet";
import { useEffect } from "react";
import { isAddr, rEqual } from "../../../services/utils";
import { Err } from "../../../services/xtras";

const trunc = a => `${a.slice(0, 5)}..${a.slice(39, 42)}`;

const ConnectWalletModal = (props) => {
  const dispatch = useDispatch();
  const wallet = useSelector(s => s.wallet);

  function postWalletConnection(addr) {
    CommonF.init({from: addr});
    dispatch(setPriAccount(addr));
    dispatch(walletConnected(isAddr(addr)));
    props.conTitleCbk(isAddr(addr) ? trunc(addr) : MISC.CONNECT_TTL);

  }

  useEffect(async() => {
    if(wallet.isConnected) {
      let acc = Wallet.priAccount;
      props.conTitleCbk(trunc(acc));
    } else{
      props.conTitleCbk(MISC.CONNECT_TTL)
    }
  }, [wallet.isConnected])
  
  
  window.addEventListener(EVENT.CHAIN_CHANGE, async e => {
    log.s(EVENT.CHAIN_CHANGE);
    if(!e.detail.isValidChain) postWalletConnection('');
  });

  const connect2wallet = async walletType => {
    try {
      await Wallet.init(walletType);
      await Wallet.ensureChain();
      let acc = Wallet.priAccount;
      if (acc) {
        l_t.s(walletType + ' Wallet connected successfully!');
        dispatch(setWalletType(walletType));
        props.onHide(!1);
        postWalletConnection(acc);
      }
    } catch (e) {
      Err.handle(e);
    }
  }

  //Disconnect wallet functionality
  const disconnect = () => {
    dispatch(walletConnected(!1));
    dispatch(setPriAccount(''));
    props.onHide(!1)
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
            onClick={ 
              wallet.isConnected ?
                _ => {
                  _.preventDefault(); 
                  disconnect();
                } :
                _ => {
                  _.preventDefault();
                  connect2wallet(WALLET_TYPE.METAMASK);
                }
            }
          >
            { 
              wallet.isConnected && rEqual(WALLET_TYPE.METAMASK, wallet.walletType) ? 
                'Disconnect from Metamask' : 
                'Connect To Metamask' 
            }
          </button>
        </li>
        <li>
          <button 
            onClick={ 
              wallet.isConnected ?
              _ => {
                _.preventDefault(); 
                disconnect();
              } :
              _ => {
                _.preventDefault();
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
        </li>
        <li>
          <button 
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
                'Connect To WalletConnect' 
            }
          </button>
        </li>
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
