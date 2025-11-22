import { useState } from "react";
import { FaUser, FaCog, FaHistory, FaFolder, FaUpload, FaCamera, FaMicrophone } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import Header from "../components/Header";

export default function Dashboard() {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
      </div>

      <div className="flex flex-col h-screen bg-gray-900 text-white pt-16"> 
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 p-5 flex flex-col gap-4">
            <nav className="flex flex-col gap-3">
              <button className="flex items-center gap-2"><FaUser /> Profile</button>
              <button className="flex items-center gap-2"><FaCog /> Settings</button>
              <button className="flex items-center gap-2"><FaHistory /> Search History</button>
              <button className="flex items-center gap-2"><FaFolder /> Cases</button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
              {/* Search Input */}
              <div className="flex items-center bg-gray-700 px-3 py-2 rounded w-1/2 border border-gray-600">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-transparent outline-none text-white"
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="text-blue-400 hover:text-blue-300">
                  <IoSend size={20} />
                </button>
              </div>

              {/* Action Buttons with Icons */}
              <div className="flex gap-3">
                <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">
                  <FaUpload size={20} />
                </button>
                <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">
                  <FaCamera size={20} />
                </button>
                <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">
                  <FaMicrophone size={20} />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <div className="bg-gray-800 p-4 mt-2 rounded">
                <h3 className="font-semibold">Case Title #1</h3>
                <p className="text-sm text-gray-400">Brief description of the case and its details...</p>
              </div>
              <div className="bg-gray-800 p-4 mt-2 rounded">
                <h3 className="font-semibold">Case Title #2</h3>
                <p className="text-sm text-gray-400">Brief description of the case and its details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
