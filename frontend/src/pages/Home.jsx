import { useEffect, useState } from "react";
import { axiosInstance, BASE_URL } from "../app";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/home.css";
import logo from "../assets/logo.png";
import BottomNav from "../components/BottomNav";
import PromoBanner from "../components/PromoBanner";

import { FaPhoneAlt, FaMapMarkerAlt, FaWhatsapp, FaInbox } from "react-icons/fa";
import { PUBLIC_CONTACT_NUMBER } from "../config/contact";

export default function Home() {

  const [houses, setHouses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rent");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/lease") setActiveTab("lease");
    else if (location.pathname === "/plot") setActiveTab("sale");
    else if (location.pathname === "/showroom") setActiveTab("showroom");
    else setActiveTab("rent");
  }, [location.pathname]);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/houses"),
      axiosInstance.get("/properties")
    ])
      .then(([houseRes, propertyRes]) => {
        setHouses(houseRes?.data || []);
        setProperties(propertyRes?.data || []);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (activeTab === "lease") return p.category === "Lease";
    if (activeTab === "sale") return p.category === "Plot";
    if (activeTab === "showroom") return p.category === "Showroom";
    return false;
  });

  const getImage = (item) => {
    if (!item?.images || item.images.length === 0) return "/images/noimage.jpg";
    const img = item.images[0];
    return img.startsWith("http") ? img : `${BASE_URL}/uploads/${img}`;
  };

  const whatsappMessage = encodeURIComponent(`Hi, I want to post my property.`);

  return (
    <div className="main-container">

      {/* HEADER */}
      <div className="header">
        <div className="header-center">
          <div className="logo-badge">
            <img
              src={logo}
              className="logo"
              alt="PMV Properties - Ponnamaravathy Property Marketplace"
            />
          </div>
        </div>
      </div>

      {/* STICKY OFFERS / PROMO BANNER */}
      <PromoBanner />

      {/* 🔥 SKELETON LOADING */}
      {loading && (
        <>
          {[1,2,3].map(i => (
            <div className="house-card skeleton" key={i}>
              <div className="skeleton-img"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text small"></div>
            </div>
          ))}
        </>
      )}

      {/* RENT */}
      {!loading && activeTab === "rent" && houses.map((house) => (
        <div className="house-card" key={house?._id}>
          <div className="image-wrapper">
            <img src={getImage(house)} className="house-image" alt="" />

            {house?.preference && (
              <div className={`pref-badge ${
                house.preference === "Bachelor"
                  ? "pref-bachelor"
                  : house.preference === "Family"
                  ? "pref-family"
                  : "pref-both"
              }`}>
                {house.preference}
              </div>
            )}

            {house?.verified && <div className="verified-badge">✔ Verified</div>}
          </div>

          <div className="house-info">
            <div className="title-row">
              <h3>{house?.type} in {house?.area}</h3>
              <div className="price">
                ₹{house?.rent?.toLocaleString?.() || "0"} <small>/month</small>
              </div>
            </div>

            <div className="location">
              <FaMapMarkerAlt /> {house?.area}
            </div>

            <div className="button-row">
              <button className="info-btn">{house?.type}</button>
              {house?.sqft && <button className="info-btn">{house.sqft} sqft</button>}
              <button className="info-btn">
                ₹{house?.advance?.toLocaleString?.() || "0"}
              </button>
            </div>

            <button className="details-btn" onClick={() => navigate(`/details/${house?._id}`)}>
              View Details
            </button>
          </div>
        </div>
      ))}

      {/* PROPERTIES */}
      {!loading && activeTab !== "rent" && filteredProperties.map((p) => (
        <div className="house-card" key={p?._id}>
          <div className="image-wrapper">
            <img src={getImage(p)} className="house-image" alt="" />
          </div>

          <div className="house-info">
            <div className="title-row">
              <h3>{p?.shopName ? `${p.shopName} in ${p.area}` : `${p.category} in ${p.area}`}</h3>
              <div className="price">
                ₹{(p.category === "Lease" ? p.leaseAmount : p.price)?.toLocaleString?.() || "0"}
              </div>
            </div>

            <div className="location">
              <FaMapMarkerAlt /> {p?.location}
            </div>

            <div className="button-row">
              <button className="info-btn">{p.type || p.category}</button>
              <button className="info-btn">{p.sqft || "--"} sqft</button>
              {p.duration && <button className="info-btn">{p.duration} yrs</button>}
            </div>

            <button className="details-btn" onClick={() => navigate(`/property-details/${p?._id}`)}>
              View Details
            </button>
          </div>
        </div>
      ))}

      {/* EMPTY STATE */}
      {!loading && activeTab === "rent" && houses.length === 0 && (
        <div className="empty-state">
          <FaInbox className="empty-icon" />
          <p>No houses available right now</p>
          <span>Please check back soon</span>
        </div>
      )}

      {!loading && activeTab !== "rent" && filteredProperties.length === 0 && (
        <div className="empty-state">
          <FaInbox className="empty-icon" />
          <p>No {activeTab === "sale" ? "plots" : activeTab} listed right now</p>
          <span>Please check back soon</span>
        </div>
      )}

      {/* FLOAT */}
      <div className="owner-float-wrapper">
        <div className="owner-float">
          <span className="owner-text">House Owner?</span>

          <div className="owner-actions">
            <a href={`tel:+${PUBLIC_CONTACT_NUMBER}`} className="owner-call-btn">
              <FaPhoneAlt /> Call
            </a>

            <a
              href={`https://wa.me/${PUBLIC_CONTACT_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="owner-whatsapp-btn"
            >
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} navigate={navigate} />

    </div>
  );
}