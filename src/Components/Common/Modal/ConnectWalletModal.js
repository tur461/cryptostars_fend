import React from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomModal from "./CustomModal";
import { Toast } from "../Toast/Toast";
import { setPriAccount, setWalletType, walletConnected, walletDisconnected } from "../../features/wallet";

import Wallet from "../../../services/wallet";
import CommonF from "../../../services/contracts/common";
import l_t from "../../../services/logging/l_t";
import { EVENT, MISC } from "../../../services/constants/common";
import log from "../../../services/logging/logger";
import toast from "../../../services/logging/toast";
import { WALLET_TYPE } from "../../../services/constants/wallet";
import { useEffect } from "react";
import { isAddr, rEqual } from "../../../services/utils";

const trunc = a => `${a.slice(0, 5)}..${a.slice(39, 42)}`;

const ConnectWalletModal = (props) => {
  const dispatch = useDispatch();
  const wallet = useSelector(s => s.wallet);

  function proc(acc) {
    dispatch(setPriAccount(acc));
    dispatch(walletConnected(isAddr(acc)));
    CommonF.init({from: acc});
    l_t.s('SUCCESS '+ acc);
    props.conTitleCbk(acc.length ? trunc(acc) : MISC.CONNECT_TTL);

  }

  useEffect(async() => {
    if(wallet.isConnected) {
      let acc = await Wallet.getPriAccount();
      props.conTitleCbk(trunc(acc));
    } else{
      props.conTitleCbk(MISC.CONNECT_TTL)
    }
  }, [wallet.isConnected])
  
  
  window.addEventListener(EVENT.CHAIN_CHANGE, async e => {
    log.s(EVENT.CHAIN_CHANGE);
    if(!e.detail.isValidChain) proc('');
  });

  const connect2wallet = async walletType => {
    try {
      await Wallet.init();
      await Wallet.ensureChain();
      let acc = Wallet.priAccount;
      if (acc) {
        l_t.s('Wallet connected successfully!');
        dispatch(setWalletType(walletType));
        props.onHide(!1);
        proc(acc);
      } else l_t.e('no account found!');
    } catch (error) {
      toast.e(error.message);
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
        {
        <li>
          <button 
            onClick={ 
              wallet.isConnected ?
                _ => disconnect() :
                _ => connect2wallet(WALLET_TYPE.METAMASK)
            }
          >
            { 
              wallet.isConnected && rEqual(WALLET_TYPE.METAMASK, wallet.walletType) ? 
                'Disconnect from Metamask' : 
                'Connect To Metamask' 
            }
          </button>
        </li> }
        <li>
          <button 
            onClick={ 
              wallet.isConnected ?
                _ => disconnect() :
                _ => connect2wallet(WALLET_TYPE.TRUST_WALLET)
            }
          >
            {
              wallet.isConnected && rEqual(WALLET_TYPE.TRUST_WALLET, wallet.walletType) ? 
                'Disconnect from TrustWallet' : 
                'Connect To TrustWallet' 
            }
          </button>
        </li>
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
