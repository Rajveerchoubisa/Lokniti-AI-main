import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import VerifyOTP from "./components/verify-otp";

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} /><Route path="/dashboard" element={<Dashboard />} />
    <Route path="/login" element={<Login />} /><Route path="/register" element={<SignUp />} />
    <Route path="/verify-otp" element={<VerifyOTP />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes><ToastContainer theme="dark" position="top-right" /></BrowserRouter>;
}
