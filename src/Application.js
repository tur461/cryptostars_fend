import React from "react";
import { PrivateRoutes, PublicRoutes } from "./Routes";

const Application = () => {
  return (
    <>
      <PublicRoutes />
      <PrivateRoutes />
    </>
  );
};

export default Application;
