import React from "react";
import { Modal } from "react-bootstrap";
import "./ModalStyle.scss";

const CustomModal = ({ show, onHide, children, title, size, classname }) => {
  return (
    <>
      <Modal
        size={size}
        show={show}
        onHide={onHide}
        centered
        className={`modalStyle ${classname}`}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
      </Modal>
    </>
  );
};

export default CustomModal;
