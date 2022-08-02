import React from "react";
import { Container } from "react-bootstrap";
import "./Layout.scss";


const Layout = ({ children }) => {

  return (
    <Container fluid className="layoutOuter">
      <Container>{children}</Container>
    </Container>
  );
};

export default Layout;
