import React from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomModal from "./CustomModal";
import { Toast } from "../Toast/Toast";
import { setPriAccount, walletConnected, walletDisconnected } from "../../features/wallet";

import Wallet from "../../../services/wallet";
import CommonF from "../../../services/contracts/common";
import l_t from "../../../services/logging/l_t";
import { EVENT, MISC } from "../../../services/constants/common";
import log from "../../../services/logging/logger";
import { useEffect } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';

const trunc = a => `${a.slice(0, 5)}..${a.slice(39, 42)}`;

const ConnectWalletModal = (props) => {
  const dispatch = useDispatch();
  const wallet = useSelector(s => s.wallet);

    const provider = new WalletConnectProvider({
      rpc: {
        338 : "https://cronos-testnet-3.crypto.org:8545/"
      },
    });

    console.log(provider,"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
    

  function proc(acc) {
    dispatch(walletConnected(acc.length ? !0 : !1));
    dispatch(setPriAccount(acc));
    CommonF.init({from: acc});

    // props.conTitleCbk(acc.length ? trunc(acc) : MISC.CONNECT_TTL);
  }

  useEffect(async() => {

    if(wallet.isConnected) {
      console.log("wallet.priAccount",wallet.priAccount)
      props.conTitleCbk(trunc(wallet.priAccount));
    } else{
      props.conTitleCbk(MISC.CONNECT_TTL)
    }

  }, [wallet.isConnected])


  window.addEventListener(EVENT.CHAIN_CHANGE, async e => {
    log.s(EVENT.CHAIN_CHANGE);
    if(!e.detail.isValidChain) proc('');
  });

  const walletConnectCall = async (type) => {

    if(type=='Metamask')
    {
    try {
      Wallet.init();
      let isValidChain = await Wallet.checkChain();
      if(!isValidChain) {
        props.onHide(false);
        return;
      }
      let acc = await Wallet.getPriAccount();

      if (acc) {
        dispatch(setPriAccount(acc))
        l_t.s('Wallet connected successfully!');
        props.onHide(false);
        proc(acc);
      } else l_t.e('no account found!');
    } catch (error) {
      Toast.error(error.message);
    }
  }
  else if(type=='Trustwallet')
  {
    try {
      Wallet.init();
      let isValidChain = await Wallet.checkChain();
      if(!isValidChain) {
        props.onHide(false);
        return;
      }
      //  Enable session (triggers QR Code modal)
      await provider.enable();

      let acc =  provider.accounts[0];

      if (acc) {
        dispatch(setPriAccount(acc))
        l_t.s('Wallet connected successfully!');
        props.onHide(false);
        proc(acc);
      } else l_t.e('no account found!');
    }catch(error) {
      Toast.error(error.message)
    }
  }
  }

  const disconnect = () => {
    dispatch(walletConnected(false));
    dispatch(setPriAccount(''));
    l_t.s("Wallet Disconnected")
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
              _ => walletConnectCall('Metamask')
            }
          >{ wallet.isConnected ? 'Disconnect from Metamask' : 'Connect To Metamask' }</button>
        </li> }
        { 
        <li>
          <button 
            onClick={ wallet.isConnected ?
              _ => disconnect() :
              _ => walletConnectCall('Trustwallet')
            }
          >{ wallet.isConnected ? 'Disconnect from Trustwallet' : 'Connect To Trustwallet' }</button>
        </li>}
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
