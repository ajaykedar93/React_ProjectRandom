// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Flex from "./Pages/Flex"; // ✅ your file: src/Pages/Flex.jsx

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Route */}
        <Route path="/flex" element={<Flex />} />

        {/* Default redirect (open app -> Flex page) */}
        <Route path="/" element={<Navigate to="/flex" replace />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/flex" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
