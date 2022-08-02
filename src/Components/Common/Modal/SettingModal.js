import React from "react";
import CustomModal from "./CustomModal";
import external from "../../../Assets/Images/external-link.svg";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import "./ModalStyle.scss";

const SettingModal = ({ size, show, onHide, states }) => {
  return (
    <CustomModal size={size} show={show} onHide={onHide} title="Settings">
      <div className="stting_modl">
        <h6 className="slipTolrnc_text">
          Slippage tolerance{" "}
          <Link to="#">
            <img
              data-tip
              data-for="registerTip"
              src={external}
              alt="icon"
              className="toleranceIcon"
            />
          </Link>
        </h6>
        <ReactTooltip
          id="registerTip"
          place="right"
          effect="solid"
          className="tooltipbox"
        >
          Your transaction will revert if the price changes unfavorably by more
          than this percentage.
        </ReactTooltip>
        <div className="selct_area">
          <div className="d-flex">
            <span>
              <button>0.1%</button>
              <button>0.5%</button>
              <button>1%</button>
            </span>
            <span className="d-flex align-items-center">
              <input
                type="number"
                scale="lg"
                step={0.1}
                min={0.1}
                placeholder="5%"
                className="me-1"
                value={states.slip.val}
                onChange={states.slip.cbk}
              />{" "}
              %
            </span>
          </div>
        </div>
        <h6>Transaction deadline</h6>
        <div className="selct_area dedline">
          <div className="d-flex align-items-center">
            <input 
              type="number" 
              placeholder="20" 
              step="1" 
              min="1"
              value={states.dLine.val}
              onChange={states.dLine.cbk} 
            /> &nbsp;
            <span>Minutes</span>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default SettingModal;
