import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold">Lokniti</h1>
        <nav className="flex gap-6">
          <a href="#" className="hover:text-blue-400">Search</a>
          <a href="#" className="hover:text-blue-400">Cases</a>
          <a href="#" className="hover:text-blue-400">Settings</a>
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4">
        <span className="text-sm">John Doe</span>
        <FaUserCircle className="text-2xl" />
      </div>
    </header>
  );
}
