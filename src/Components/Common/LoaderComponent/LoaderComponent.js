import React from "react";
import { Spinner } from "react-bootstrap";
import "./LoaderComponent.scss";

const LoaderComponent = () => {
  return (
    <div className="loaderStyle">
      <Spinner animation="border" variant="danger"/>
    </div>
  );
};

export default LoaderComponent;
