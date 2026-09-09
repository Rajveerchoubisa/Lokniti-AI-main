import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import AuthShell from "../components/AuthShell";
const AUTH_API = import.meta.env.VITE_AUTH_API_URL || "http://localhost:5000/api/auth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" }); const [show, setShow] = useState(false); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  const submit = async e => { e.preventDefault(); setLoading(true); try { const {data} = await axios.post(`${AUTH_API}/login`, form); localStorage.setItem("lokniti_token", data.token); localStorage.setItem("lokniti_user", JSON.stringify(data.user)); toast.success("Welcome back"); navigate("/dashboard"); } catch(err) { toast.error(err.response?.data?.message || "Unable to sign in"); } finally { setLoading(false); } };
  return <AuthShell eyebrow="WELCOME BACK" title="Sign in to Lokniti" text="Continue your legal research workspace."><form className="auth-form" onSubmit={submit}><label>Email address<div className="field"><FiMail/><input type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></label><label>Password<div className="field"><FiLock/><input type={show?"text":"password"} autoComplete="current-password" placeholder="Enter your password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)} aria-label="Toggle password">{show?<FiEyeOff/>:<FiEye/>}</button></div></label><div className="form-row"><label className="checkbox"><input type="checkbox"/> Remember me</label><button type="button" className="link-button" onClick={()=>toast.info("Password recovery is coming soon")}>Forgot password?</button></div><button className="button button--primary submit-button" disabled={loading}>{loading?<><i className="spinner"/> Signing in…</>:"Sign in"}</button></form><p className="auth-switch">New to Lokniti? <Link to="/register">Create an account</Link></p><div className="demo-entry"><span>Want to explore first?</span><Link to="/dashboard">Continue as guest →</Link></div></AuthShell>;
}
