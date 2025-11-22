import { Link } from "react-router-dom";
import Header from "../components/Navbar";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      {/* Fixed Header */}
      <div className="fixed bg-gray-900 top-0 left-0 w-full z-10">
        <Navbar/>
      </div>

      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white pt-16">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Lokniti</h1>
          <p className="text-lg text-gray-400 mb-6">
            Empowering legal professionals with AI-driven research and case management.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <button className="bg-blue-500 px-6 py-3 rounded text-white hover:bg-blue-600 transition">
                Get Started
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="bg-gray-700 px-6 py-3 rounded text-white hover:bg-gray-600 transition">
                Explore
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
