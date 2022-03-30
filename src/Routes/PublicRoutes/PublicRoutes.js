import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "../../Components/Pages";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default PublicRoutes;
