import React from "react";
import CustomModal from "./CustomModal";

const ConnectWalletModal = ({ show, onHide }) => {
  return (
    <CustomModal
      show={show}
      onHide={onHide}
      classname="ConctModl_Style"
      title="Connect To Wallet"
    >
      <ul>
        <li>
          <button>Connect To Metamask</button>
        </li>
        <li>
          <button>Connect To TrustWallet</button>
        </li>
      </ul>
    </CustomModal>
  );
};

export default ConnectWalletModal;
