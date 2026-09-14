import { FaHome, FaBuilding } from "react-icons/fa";
import { MdRealEstateAgent } from "react-icons/md";
import { BsBuildingCheck } from "react-icons/bs";
import "./BottomNav.css";

const TABS = [
  { key: "rent", label: "Rent", path: "/", icon: FaHome },
  { key: "lease", label: "Lease", path: "/lease", icon: BsBuildingCheck },
  { key: "sale", label: "Plot", path: "/plot", icon: MdRealEstateAgent },
  { key: "showroom", label: "Showroom", path: "/showroom", icon: FaBuilding },
];

export default function BottomNav({ activeTab, navigate }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main">
      {TABS.map(({ key, label, path, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            className={`bottom-nav-btn ${active ? "active" : ""}`}
            onClick={() => navigate(path)}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav-icon-wrap">
              <Icon className="bottom-nav-icon" />
            </span>
            <span className="bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
