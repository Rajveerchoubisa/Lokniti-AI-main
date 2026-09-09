import { Link } from "react-router-dom";
import { Brand } from "./Navbar";
import { HiCheck } from "react-icons/hi";

export default function AuthShell({ eyebrow, title, text, children }) {
  return <div className="auth-page"><section className="auth-story"><Brand light/><div><span className="kicker light">LEGAL RESEARCH, SIMPLIFIED</span><h1>Move from dense documents to <em>clear direction.</em></h1><p>Lokniti helps you understand case files faster, with answers grounded in the material you provide.</p><ul><li><HiCheck/> Ask questions in natural language</li><li><HiCheck/> Analyse PDFs and scanned files</li><li><HiCheck/> Explore relevant legal precedents</li></ul></div><small>Built to support research, not replace legal judgment.</small></section><main className="auth-main"><Link className="auth-back" to="/">← Back to home</Link><div className="auth-card"><span className="kicker">{eyebrow}</span><h2>{title}</h2><p>{text}</p>{children}</div></main></div>;
}
