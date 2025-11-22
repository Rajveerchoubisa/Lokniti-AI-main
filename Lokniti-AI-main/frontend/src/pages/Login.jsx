// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";


// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // pre-fill email if remembered
//     const saved = localStorage.getItem("lokniti_email");
//     if (saved) setEmail(saved);
//   }, []);

//   function validateEmail(value) {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     if (!email || !validateEmail(email)) {
//       setError("Please enter a valid email address.");
//       return;
//     }
//     if (!password || password.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setError(data?.message || "Login failed. Please check your credentials.");
//         setLoading(false);
//         return;
//       }

//       const token = data?.token;
//       if (!token) {
//         setError("Unexpected server response: missing token.");
//         setLoading(false);
//         return;
//       }

//       localStorage.setItem("lokniti_token", token);
//       if (remember) localStorage.setItem("lokniti_email", email);
//       else localStorage.removeItem("lokniti_email");

//       setLoading(false);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       setError("Network error. Please try again.");
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black px-4">
//       <div className="w-full max-w-md">
//         <div className="bg-gradient-to-br from-[#041024] to-[#001429] rounded-2xl shadow-xl p-8 border border-blue-800/20">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow">
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-white">
//                 <path fill="currentColor" d="M12 2L2 7v6c0 5 6 9 10 9s10-4 10-9V7l-10-5z" />
//               </svg>
//             </div>
//             <div>
//               <h1 className="text-white text-2xl font-semibold">Lokniti AI</h1>
//               <p className="text-blue-200 text-sm">Sign in to continue</p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4" noValidate>
//             {error && (
//               <div className="rounded-md bg-red-900/60 text-red-200 px-4 py-2 text-sm">
//                 {error}
//               </div>
//             )}

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-blue-100">Email address</label>
//               <div className="mt-1 relative">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full rounded-lg bg-black/60 border border-blue-800/40 px-3 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="you@example.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-blue-100">Password</label>
//               <div className="mt-1 relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   autoComplete="current-password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full rounded-lg bg-black/60 border border-blue-800/40 px-3 py-2 pr-10 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter your password"
//                   required
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((s) => !s)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                   className="absolute inset-y-0 right-2 flex items-center px-2"
//                 >
//                   {showPassword ? (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M4.03 3.97a.75.75 0 10-1.06 1.06l1.13 1.13A9.018 9.018 0 001 10c2.5 3.5 6 5 9 5 1.03 0 2.03-.12 2.97-.36l1.13 1.13a.75.75 0 101.06-1.06L4.03 3.97z" />
//                     </svg>
//                   ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M10 3c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7zM10 13a3 3 0 110-6 3 3 0 010 6z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-sm text-blue-200">
//               <label className="inline-flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={remember}
//                   onChange={(e) => setRemember(e.target.checked)}
//                   className="h-4 w-4 rounded border-blue-600 bg-black/40 text-blue-500 focus:ring-blue-500"
//                 />
//                 Remember me
//               </label>

//               <a href="/forgot-password" className="hover:underline">
//                 Forgot password?
//               </a>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:opacity-95 disabled:opacity-60"
//               >
//                 {loading ? (
//                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
//                   </svg>
//                 ) : null}
//                 Sign in
//               </button>
//             </div>

//             <div className="text-center text-sm text-blue-300">
//               Don’t have an account? <a href="/register" className="text-white font-semibold hover:underline">Create one</a>
//             </div>

//             <div className="pt-4">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center" aria-hidden="true">
//                   <div className="w-full border-t border-blue-800/30"></div>
//                 </div>
//                 <div className="relative flex justify-center text-xs"> 
//                   <span className="bg-black px-2 text-blue-300">Or continue with</span>
//                 </div>
//               </div>

//               <div className="mt-3 grid grid-cols-1 gap-3">
//                 <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-blue-800/30 px-3 py-2 text-sm text-blue-200">Google</button>
                
//               </div>
//             </div>
//           </form>
//         </div>

//         <p className="mt-4 text-center text-xs text-blue-400">By continuing, you agree to Lokniti AI's <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.</p>
//       </div>
//     </div>
//   );
// }




























import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Store token
      localStorage.setItem("lokniti_token", res.data.token);
      localStorage.setItem("lokniti_user", JSON.stringify(res.data.user));
      toast.success("Login successful", { position: "top-center", autoClose: 1500 });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: true,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#041024] to-[#001429] rounded-2xl shadow-2xl p-8 border border-blue-800/20">
          {/* Header / Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-white">
                <path fill="currentColor" d="M12 2L2 7v6c0 5 6 9 10 9s10-4 10-9V7l-10-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">Lokniti AI</h1>
              <p className="text-blue-200 text-sm">Sign in to continue</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-black/60 border border-blue-800/40 text-white p-3 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-black/60 border border-blue-800/40 text-white p-3 pr-10 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-200 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:opacity-95 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Links */}
          <div className="flex items-center justify-between mt-4 text-sm text-blue-200">
            <Link to="/forgot-password" className="hover:underline">Forgot Password?</Link>
            <div onClick={() => navigate("/register")} className="hover:underline cursor-pointer">Create account</div>
          </div>

          {/* Social Login / Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-blue-800/30"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#041024] px-2 text-blue-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-800/30 px-3 py-2 text-sm text-blue-200 hover:bg-white/2"
              >
                Google
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-blue-400">By continuing, you agree to Lokniti AI's <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
        </div>
      </div>
    </div>
  );
}

/* Eye Icons */
function EyeOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}


