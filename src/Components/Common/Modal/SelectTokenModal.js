import React from "react";
import CustomModal from "./CustomModal";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useSelector } from "react-redux";



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
      <div className="gradiantWrap">
        <input
          name="tokenSearch"
          className="searchInput_Style"
          onPaste={e => state.scbk(e.target.value)}
          onChange={e => state.scbk(e.target.value)}
          placeholder="Search name or paste address"
        />
      </div>
      <div className="tokenName">
        <h4>Token Name</h4>
        <hr />
      </div>

      <PerfectScrollbar>
        <div className="coinListBlockStyle">
          {swap.tokenList_chg.map((data, i) => (
            <CoinItem 
              key={i} 
              data={data} 
              cbk={state.cbk} 
              title={data.sym} 
              hideCbk={hideCbk} 
              iconImage={data.icon} 
              importCbk={state.importCbk} 
            />
          ))}
        </div>
      </PerfectScrollbar>
    </CustomModal>
  );
};
const CoinItem = ({ className, iconImage, title, hideCbk, data, cbk, importCbk }) => {
  return (
    <div 
      onClick={
        data.disabled ? 
        e => e.preventDefault() : 
        _ => cbk(title, data.addr, hideCbk(!0))
      }
      className={`coinItem ${data.disabled ? 'keep-disabled' : ''}`} 
    >
      <div className={`coinItem_style ${className}`}>
        
        <p className="titleStyle"> 
          <img src={iconImage} /> 
          {title} 
        </p>
        <p className="tokenDescription">
          <span className="tokenName">{data.name}</span>
          <span className="tokenBalance">{data.bal}</span>
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
