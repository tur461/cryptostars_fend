import React from "react";
import { Container, Accordion } from "react-bootstrap";

const FaqAccordianItem = ({ no, title, text, eventKey }) => {
  return (
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header>
        <span className="noList">
          {no}
          <span>-</span>
        </span>
        {title}
      </Accordion.Header>
      <Accordion.Body>{text}</Accordion.Body>
    </Accordion.Item>
  );
};

export default FaqAccordianItem;
