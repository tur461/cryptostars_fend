import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Swap } from "../../Components/Pages";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/swap" element={<Swap />} />
    </Routes>
  );
};

export default PublicRoutes;
