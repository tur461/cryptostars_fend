import React, { useState } from "react";
import { InputGroup, FormControl, Form } from "react-bootstrap";
import SelectTokenModal from "../Modal/SelectTokenModal";
import "./inputStyle.scss";

const CustomInputgroup = ({ className, icon, title, states }) => {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    states.tList.resetTList_chg();
  };
  const handleShow = () => setShow(true);
  return (
    <InputGroup className={`customInp_style ${className}`}>
      <InputGroup.Text>
        <div className="coinSelect_wrap">
          <img src={icon} alt="coin_icon" />
          <div className="coinSelect">
            <span>{title} </span>
            <span className="selectOption" onClick={handleShow}>
              {states.tList.val}
            </span>
          </div>
          <SelectTokenModal show={show} hideCbk={handleClose} state={states.tList} />
        </div>
      </InputGroup.Text>
      <FormControl 
        type="text" 
        minLength="1" 
        maxLength="79" 
        placeholder="0.0" 
        spellCheck="false" 
        autoCorrect="off" 
        autoComplete="off" 
        inputMode="decimal" 
        value={states.token.val} 
        onChange={states.token.cbk} 
        pattern="^[0-9]*[.,]?[0-9]*$" 
      />
                        
    </InputGroup>
  );
};

export default CustomInputgroup;
