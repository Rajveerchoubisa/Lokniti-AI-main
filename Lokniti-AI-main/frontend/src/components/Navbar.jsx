import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
      {/* Logo */}
      <div className="text-xl font-bold">
        <span className="text-blue-400">Lokniti</span>AI
      </div>
      {/* Right Side Buttons */}
      <div className="flex items-center gap-4">
        <Link to="/signup" className="text-white  hover:text-blue-500 p-1 ">Sign Up</Link>
        <Link to="/signin" className="text-white  hover:text-blue-500 ">Sign In</Link>
      </div>
    </nav>
  );
}
