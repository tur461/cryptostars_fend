import React from "react";
import { URL } from "../../../services/constants/common";
import { toDateTimeStr } from "../../../services/utils";
import CustomModal from "./CustomModal";
import "./ModalStyle.scss";

const RecentTransactions = ({ size, show, onHide, recentTxList }) => {
  return (
    <CustomModal
      size={size}
      show={show}
      onHide={onHide}
      title="Recent Transactions"
    >
      <ul className="no_record text-center list--recent-txs">
        {
          recentTxList.length ?
          recentTxList.map(tx => (
            <li className="item--recent-tx" key={tx.tStampJs}>
                <p>
                  Swap
                  <span>{tx.pair}</span>
                  on
                  <span>{toDateTimeStr(tx.tStampJs)}</span>
                </p>
                <a 
                  href={`${URL.CRONOS_EXPLORER_BASE}/tx/${tx.hash}`}
                  target='_blank'
                  rel="noopener noreferrer"
                >view on explorer</a>
            </li>
          )) :
          <p>No recent Transactions</p>
        }
      </ul>
    </CustomModal>
  );
};

export default RecentTransactions;
