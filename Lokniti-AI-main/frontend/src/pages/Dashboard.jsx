import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiFileText, FiHome, FiLogOut, FiMenu, FiMessageSquare, FiPaperclip, FiPlus, FiSend, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { Brand } from "../components/Navbar";

const RAG_API = import.meta.env.VITE_RAG_API_URL || "http://localhost:8000";
const HISTORY_KEY = "lokniti_research_history";
const prompts = ["Summarise this document", "What are the key legal issues?", "What was the final decision?", "Find similar precedents"];

const createSessionId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const readHistory = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function Dashboard() {
  const navigate = useNavigate(); const inputRef = useRef(null); const bottomRef = useRef(null);
  const initialHistory = useRef(readHistory()).current;
  const initialConversation = initialHistory[0] || null;
  const [history, setHistory] = useState(initialHistory);
  const [sidebar, setSidebar] = useState(false); const [file, setFile] = useState(initialConversation?.file || null); const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(initialConversation?.uploaded || false); const [uploading, setUploading] = useState(false); const [question, setQuestion] = useState(""); const [asking, setAsking] = useState(false); const [messages, setMessages] = useState(initialConversation?.messages || []);
  const [sessionId, setSessionId] = useState(initialConversation?.sessionId || createSessionId);
  const user = (() => { try { return JSON.parse(localStorage.getItem("lokniti_user")) || {}; } catch { return {}; } })();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);
  useEffect(() => {
    if (!file || !uploaded) return;
    const record = {
      sessionId,
      file: { name: file.name, size: file.size, type: file.type },
      uploaded,
      messages,
      updatedAt: new Date().toISOString(),
    };
    setHistory((current) => {
      const next = [record, ...current.filter((item) => item.sessionId !== sessionId)].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, [file, uploaded, messages, sessionId]);
  const selectFile = (picked) => { if (!picked) return; const allowed = ["application/pdf", "image/png", "image/jpeg"]; if (!allowed.includes(picked.type)) return toast.error("Please select a PDF, PNG, or JPG file."); if (picked.size > 20 * 1024 * 1024) return toast.error("File size must be under 20 MB."); setFile(picked); setUploaded(false); setMessages([]); };
  const uploadFile = async () => { if (!file) return; setUploading(true); const body = new FormData(); body.append("file", file); try { await axios.post(`${RAG_API}/upload?session_id=${encodeURIComponent(sessionId)}`, body); setUploaded(true); toast.success("Document is ready for questions"); inputRef.current?.focus(); } catch (error) { toast.error(error.response?.data?.detail || "Could not process the document. Is the AI service running?"); } finally { setUploading(false); } };
  const ask = async (text = question) => { const clean = text.trim(); if (!clean || asking) return; if (!uploaded) return toast.info("Upload and process a document first"); setMessages(m => [...m, { role: "user", text: clean }]); setQuestion(""); setAsking(true); try { const { data } = await axios.post(`${RAG_API}/chat`, { session_id: sessionId, question: clean }); const answer = typeof data?.answer === "string" ? data.answer.trim() : ""; setMessages(m => [...m, { role: "assistant", text: answer || "The model returned an empty response. Please try rephrasing your question." }]); } catch (error) { const detail = error.response?.data?.detail; setMessages(m => [...m, { role: "assistant", text: typeof detail === "string" ? detail : "I couldn’t reach the research service. Please try again.", error: true }]); } finally { setAsking(false); } };
  const reset = () => { setSessionId(createSessionId()); setFile(null); setUploaded(false); setMessages([]); setQuestion(""); setSidebar(false); };
  const openConversation = (conversation) => { setSessionId(conversation.sessionId); setFile(conversation.file); setUploaded(conversation.uploaded); setMessages(conversation.messages || []); setQuestion(""); setSidebar(false); };
  const deleteConversation = () => { const next = history.filter((item) => item.sessionId !== sessionId); setHistory(next); localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); setSessionId(createSessionId()); setFile(null); setUploaded(false); setMessages([]); setQuestion(""); };
  const logout = () => { localStorage.removeItem("lokniti_token"); localStorage.removeItem("lokniti_user"); navigate("/"); };
  return <div className="workspace">
    <aside className={`workspace-sidebar ${sidebar ? "open" : ""}`}><div className="side-head"><Brand light/><button onClick={() => setSidebar(false)}><FiX/></button></div><button className="new-research" onClick={reset}><FiPlus/> New research</button><nav className="side-nav"><span>WORKSPACE</span><Link className="active" to="/dashboard"><FiMessageSquare/> Document chat</Link><Link to="/"><FiHome/> Home</Link></nav><div className="recent"><span>RECENT</span>{history.length ? history.map((conversation) => <button className={conversation.sessionId === sessionId ? "active" : ""} key={conversation.sessionId} onClick={() => openConversation(conversation)}><FiFileText/><div><b>{conversation.file.name}</b><small>{conversation.messages.length ? `${Math.ceil(conversation.messages.length / 2)} question${conversation.messages.length > 2 ? "s" : ""}` : "Ready to research"}</small></div></button>) : <p>No recent documents</p>}</div><div className="side-user"><div className="avatar">{(user.fullName || "Guest").charAt(0)}</div><div><b>{user.fullName || "Guest researcher"}</b><small>{user.email || "Local workspace"}</small></div><button onClick={logout} title="Sign out"><FiLogOut/></button></div></aside>
    {sidebar && <button className="side-backdrop" onClick={() => setSidebar(false)} aria-label="Close menu"/>}
    <main className="workspace-main"><header className="workspace-header"><button className="mobile-menu" onClick={() => setSidebar(true)}><FiMenu/></button><div><h1>Document research</h1><p>Ask questions grounded in your case file</p></div><div className="secure-badge"><span/> Private session</div></header>
      <div className="workspace-content">{!file ? <section className="empty-workspace"><div className="empty-icon"><HiOutlineSparkles/></div><span className="kicker">YOUR AI LEGAL RESEARCHER</span><h2>What would you like to understand?</h2><p>Upload a judgment, petition, order, or scanned legal document to begin a focused research session.</p><label className={`upload-zone ${dragging ? "dragging" : ""}`} onDragOver={e => {e.preventDefault(); setDragging(true)}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault(); setDragging(false); selectFile(e.dataTransfer.files[0])}}><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => selectFile(e.target.files[0])}/><FiUploadCloud/><b>Drop your document here</b><span>or click to browse your files</span><small>PDF, PNG, JPG · Maximum 20 MB</small></label><div className="privacy-note"><span>✓</span><div><b>Your research stays yours</b><p>Documents are used only to answer questions in this session.</p></div></div></section> : <section className="chat-workspace"><div className="file-banner"><div className="file-type">{file.type === "application/pdf" ? "PDF" : "IMG"}</div><div><b>{file.name}</b><span>{(file.size / 1024 / 1024).toFixed(2)} MB · {uploaded ? "Ready to research" : "Waiting to process"}</span></div><div className="file-actions">{!uploaded && <button className="button button--primary button--small" onClick={uploadFile} disabled={uploading}>{uploading ? <><i className="spinner"/> Reading document…</> : "Process document"}</button>}<button onClick={deleteConversation} aria-label="Delete conversation"><FiTrash2/></button></div></div>
          {messages.length === 0 ? <div className="chat-intro"><div className="empty-icon small"><HiOutlineSparkles/></div><h2>{uploaded ? "Your document is ready" : "Ready when you are"}</h2><p>{uploaded ? "Choose a starting point or ask your own question below." : "Process the document to begin asking questions."}</p>{uploaded && <div className="prompt-grid">{prompts.map(p => <button key={p} onClick={() => ask(p)}>{p}<FiSend/></button>)}</div>}</div> : <div className="messages">{messages.map((m,i) => <div className={`message ${m.role} ${m.error ? "error" : ""}`} key={i}>{m.role === "assistant" && <div className="ai-avatar">✦</div>}<div><span>{m.role === "assistant" ? "Lokniti AI" : "You"}</span><p>{m.text}</p></div></div>)}{asking && <div className="message assistant"><div className="ai-avatar">✦</div><div><span>Lokniti AI</span><div className="typing"><i/><i/><i/></div></div></div>}<div ref={bottomRef}/></div>}
        </section>}</div>
      <form className={`composer ${!file ? "disabled" : ""}`} onSubmit={e => {e.preventDefault(); ask();}}><button type="button" title="Choose another file" onClick={reset}><FiPaperclip/></button><textarea ref={inputRef} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => {if(e.key === "Enter" && !e.shiftKey){e.preventDefault(); ask();}}} placeholder={uploaded ? "Ask anything about this document…" : "Process your document to start asking…"} disabled={!uploaded} rows="1"/><button className="send-button" type="submit" disabled={!question.trim() || asking || !uploaded}><FiSend/></button></form><p className="ai-disclaimer">Lokniti AI can make mistakes. Verify important legal information.</p>
    </main></div>;
}
