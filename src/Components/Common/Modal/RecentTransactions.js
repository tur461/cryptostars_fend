import React from "react";
import CustomModal from "./CustomModal";
import "./ModalStyle.scss";

const RecentTransactions = ({ size, show, onHide }) => {
  return (
    <CustomModal
      size={size}
      show={show}
      onHide={onHide}
      title="Recent Transactions"
    >
      <div className="no_record text-center">
        <p>No recent Transactions</p>
      </div>
    </CustomModal>
  );
};

export default RecentTransactions;
