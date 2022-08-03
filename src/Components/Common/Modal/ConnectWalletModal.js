import React from "react";
import { useDispatch } from "react-redux";

import CustomModal from "./CustomModal";
import { Toast } from "../Toast/Toast";
import { setPriAccount, walletConnected } from "../../features/wallet";

import Wallet from "../../../services/wallet";
import CommonF from "../../../services/contracts/common";
import l_t from "../../../services/logging/l_t";
import { EVENT, MISC } from "../../../services/constants/common";
import log from "../../../services/logging/logger";

const trunc = a => `${a.slice(0, 5)}..${a.slice(39, 42)}`;

const ConnectWalletModal = (props) => {
  const dispatch = useDispatch();
  
  function proc(acc) {
    dispatch(walletConnected(acc.length ? !0 : !1));
    dispatch(setPriAccount(acc));
    CommonF.init({from: acc});
    props.conTitleCbk(acc.length ? trunc(acc) : MISC.CONNECT_TTL);
  }
  
  window.addEventListener(EVENT.CHAIN_CHANGE, async e => {
    log.s(EVENT.CHAIN_CHANGE);
    if(!e.detail.isValidChain) proc('');
  });

  const walletConnectCall = async (walletType, type) => {
    try {
      await Wallet.init();
      await Wallet.ensureChain();
      // if(!isValidChain) return props.onHide(!1);
      let acc = Wallet.priAccount;

      if (acc) {
        l_t.s('Wallet connected successfully!');
        props.onHide(!1);
        proc(acc);
      } else l_t.e('no account found!');
    } catch (error) {
      Toast.error(error.message);
    }
  }
  return (
    <CustomModal
      show={props.show}
      onHide={props.onHide}
      classname="ConctModl_Style"
      title="Connect To Wallet"
    >
      <ul>
        <li>
          <button onClick={() => walletConnectCall('Metamask', 'Metamask')}>Connect To Metamask</button>
        </li>
        <li>
          <button>Connect To TrustWallet</button>
        </li>
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
