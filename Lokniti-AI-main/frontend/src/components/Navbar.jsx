import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";

export function Brand({ light = false }) {
  return <Link to="/" className={`brand ${light ? "brand--light" : ""}`} aria-label="Lokniti AI home"><span className="brand__mark">L</span><span>Lokniti <b>AI</b></span></Link>;
}
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container nav-wrap"><Brand />
    <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <HiX /> : <HiOutlineMenuAlt3 />}</button>
    <nav className={`nav-links ${open ? "is-open" : ""}`} aria-label="Primary navigation">
      <a href="#features" onClick={() => setOpen(false)}>Features</a><a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a><a href="#security" onClick={() => setOpen(false)}>Security</a><span className="nav-divider" />
      <Link to="/login">Sign in</Link><Link className="button button--dark button--small" to="/register">Try Lokniti free</Link>
    </nav></div></header>;
}
