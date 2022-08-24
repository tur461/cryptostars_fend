import React from "react";
import CustomModal from "./CustomModal";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useSelector } from "react-redux";
import { nullFunc } from "../../../services/utils";



const SelectTokenModal = ({ size, show, hideCbk, state }) => {
  const swap = useSelector(s => s.swap);
  return (
    <CustomModal
      size={size}
      show={show}
      onHide={hideCbk}
      classname="selectCurrency_modal"
      title="Select a Token"
    >
      {/* <div className="gradiantWrap">
        <input
          name="tokenSearch"
          className="searchInput_Style"
          onPaste={e => state.searchCallback(e.target.value)}
          onChange={e => state.searchCallback(e.target.value)}
          placeholder="Search name or paste address"
        />
      </div> */}
      {/* <div className="tokenName">
        <h4>Token Name</h4>
        <hr />
      </div> */}

      <PerfectScrollbar>
        <div className="coinListBlockStyle">
          {swap.tokenList_chg.map((data, i) => (
            <CoinItem 
              key={i} 
              iconImage={data.icon} 
              title={data.sym} 
              hideCbk={hideCbk} 
              data={data} 
              tokenSelectCbk={state.tokenSelectCallback} 
              importCbk={state.importCbk}
            />
          ))}
        </div>
      </PerfectScrollbar>
    </CustomModal>
  );
};
const CoinItem = ({ 
  tokenSelectCbk, 
  data, 
  title, 
  hideCbk, 
  className, 
  iconImage, 
  importCbk,
}) => {
  return (
    <div 
      className={`coinItem${data.disabled ? ' keep-disabled' : ''}`}
      onClick={
        data.disabled ? 
        nullFunc : 
        _ => tokenSelectCbk(title, data.addr, data.icon, hideCbk(!0))
      }
    >
      <div className={`coinItem_style ${className}`}>
        
        <p className="titleStyle"> 
          <img src={iconImage} alt='token_icon' className="img--token_icon"/> 
          {title} 
        </p>
        <p className="tokenDescription">
          <span className="tokenName">{data.name}</span>
        </p>
      </div>
      <button 
        onClick={importCbk}
        style={{display: data.imported ? 'none' : 'inline-block' }}
      >Import</button>
    </div>
  );
};
export default SelectTokenModal;
