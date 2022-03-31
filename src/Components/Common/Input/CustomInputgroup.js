import React from "react";
import { InputGroup, FormControl, Form } from "react-bootstrap";
import "./inputStyle.scss";

const CustomInputgroup = ({ className, icon, title }) => {
  return (
    <InputGroup className={`customInp_style ${className}`}>
      <InputGroup.Text>
        <div className="coinSelect_wrap">
          <img src={icon} alt="coin_icon" />
          <div className="coinSelect">
            <span>{title}</span>
            <Form.Select aria-label="Default select example">
              <option>CST</option>
              <option value="1">LMES</option>
              <option value="2">ADF</option>
              <option value="3">MBG</option>
            </Form.Select>
          </div>
        </div>
      </InputGroup.Text>
      <FormControl placeholder="0.00" />
    </InputGroup>
  );
};

export default CustomInputgroup;
