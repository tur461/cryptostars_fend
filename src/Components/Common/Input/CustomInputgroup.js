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
      {/* <FormControl placeholder="0.00" value={states.token.val} onChange={states.token.cbk} type='number'  /> */}
      <FormControl onChange={states.token.cbk} value={states.token.val} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false"  />
    </InputGroup>
  );
};

export default CustomInputgroup;