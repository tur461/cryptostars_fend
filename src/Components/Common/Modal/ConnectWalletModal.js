import React from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomModal from "./CustomModal";
import { Toast } from "../Toast/Toast";
import { setPriAccount, walletConnected } from "../../features/wallet";

import Wallet from "../../../services/wallet";
import CommonF from "../../../services/contracts/common";
import l_t from "../../../services/logging/l_t";
import { EVENT, MISC } from "../../../services/constants/common";
import log from "../../../services/logging/logger";
import { useEffect } from "react";

const trunc = a => `${a.slice(0, 5)}..${a.slice(39, 42)}`;

const ConnectWalletModal = (props) => {
  const dispatch = useDispatch();
  const wallet = useSelector(s => s.wallet);

  function proc(acc) {
    dispatch(walletConnected(acc.length ? !0 : !1));
    dispatch(setPriAccount(acc));
    CommonF.init({from: acc});

    // props.conTitleCbk(acc.length ? trunc(acc) : MISC.CONNECT_TTL);

  }

  useEffect(async() => {
    if(wallet.isConnected) {
      let acc = await Wallet.getPriAccount();
      props.conTitleCbk(trunc(acc));
    } else{
      props.conTitleCbk(MISC.CONNECT_TTL)
    }
  }, [wallet.isConnected, wallet.getPriAccount])
  
  
  window.addEventListener(EVENT.CHAIN_CHANGE, async e => {
    log.s(EVENT.CHAIN_CHANGE);
    if(!e.detail.isValidChain) proc('');
  });

  const walletConnectCall = async (walletType, type) => {
    try {
      Wallet.init();
      let isValidChain = await Wallet.checkChain();
      if(!isValidChain) {
        props.onHide(false);
        return;
      }
      let acc = await Wallet.getPriAccount();

      if (acc) {
        l_t.s('Wallet connected successfully!');
        console.log("aaaaaaaaaaaaaaaaaaaa",acc)
        props.onHide(false);
        proc(acc);
      } else l_t.e('no account found!');
    } catch (error) {
      Toast.error(error.message);
    }
  }

  //Disconnect wallet functionality
  const disconnect = () => {
    dispatch(walletConnected(false));
    dispatch(setPriAccount(''));
    // l_t.s('Wallet Disconnected!');
    props.onHide(false)
}

  return (
    <CustomModal
      show={props.show}
      onHide={props.onHide}
      classname="ConctModl_Style"
      title="Connect To Wallet"
    >
      <ul>
        {
       <li>
          <button 
            onClick={ wallet.isConnected ?
              _ => disconnect() :
              _ => walletConnectCall('Metamask', 'Metamask')
            }
          >{ wallet.isConnected ? 'Disconnect from Metamask' : 'Connect To Metamask' }</button>
        </li> }
        { 
        <li>
          <button 
            onClick={ wallet.isConnected ?
              _ => disconnect() :
              _ => walletConnectCall('Trustwallet', 'Metamask')
            }
          >{ wallet.isConnected ? 'Disconnect from Trustwallet' : 'Connect To Trustwallet' }</button>
        </li>}
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
