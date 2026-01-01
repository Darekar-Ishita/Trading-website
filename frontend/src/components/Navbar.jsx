import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaTachometerAlt,
  FaEye,
  FaNewspaper,
  FaClipboardList,
  FaMoon,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

export default function Sidebar() {
  const [open, setOpen] = useState(false); // start closed
  const { logout } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <FaUser />, color: "#F59E0B", text: "Profile", path: "/profile" },
    { icon: <FaTachometerAlt />, color: "#10B981", text: "Dashboard", path: "/dashboard" },
    { icon: <FaEye />, color: "#3B82F6", text: "Watchlist", path: "/watchlist" },
    { icon: <FaNewspaper />, color: "#8B5CF6", text: "News", path: "/news" },
    { icon: <FaClipboardList />, color: "#EF4444", text: "Orders", path: "/orders" },
    { icon: <FaMoon />, color: "#06B6D4", text: "Dark / Light", onClick: toggleTheme },
    { icon: <FaSignOutAlt />, color: "#F97316", text: "Logout", onClick: logout },
  ];

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>
      {/* Hamburger toggle */}
      <div
        className="logo"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", fontSize: "20px" }}
      >
        {open ? "Tradezy" : <FaBars size={24} />}
      </div>

      <div className="menu">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="menu-item"
            style={{ color: item.color }}
            onClick={() => {
              if (item.path) navigate(item.path);
              else if (item.onClick) item.onClick();
            }}
          >
            <span className="icon">{item.icon}</span>
            {open && <span className="menu-text">{item.text}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
