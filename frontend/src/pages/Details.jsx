import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance, BASE_URL } from "../app";
import "../styles/details.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import { getCallHref, getWhatsAppHref } from "../config/contact";

import {
  FaBed,
  FaCouch,
  FaUtensils,
  FaBath,
  FaPhoneAlt,
  FaWhatsapp,
  FaArrowLeft
} from "react-icons/fa";

import {
  IoChevronBack,
  IoChevronForward,
  IoClose
} from "react-icons/io5";

export default function Details() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [popup, setPopup] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);

    axiosInstance.get(`/houses/${id}`)
      .then(res => {
        setHouse(res.data);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= LOADING SKELETON ================= */
  if (loading) {
    return (
      <div className="app-container">
        <div className="skeleton-image"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  /* ================= ERROR FALLBACK ================= */
  if (error || !house) {
    return (
      <div className="error-page">
        <h2>❌ Failed to load property</h2>
        <p>Please try again later</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const images = house?.images?.length > 0 ? house.images : ["fallback"];

  const getImageSrc = (img) => {
    if (!img || img === "fallback") return "/images/noimage.jpg";
    return img.startsWith("http")
      ? img
      : `${BASE_URL}/uploads/${img}`;
  };

  const nextImage = () => {
    setCurrentIndex(prev =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex(prev =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="app-container">

      {/* BACK */}
      <div className="back-button" onClick={() => navigate(-1)}>
        <div className="back-icon">
          <FaArrowLeft />
        </div>
        <span>Back</span>
      </div>

      {/* SLIDER */}
      <div className="slider">

        <img
          src={getImageSrc(images[currentIndex])}
          className="details-image"
          onClick={() => setPopup(true)}
          alt="house"
        />

        {images.length > 1 && (
          <>
            <button className="nav-btn left" onClick={prevImage}>
              <IoChevronBack />
            </button>

            <button className="nav-btn right" onClick={nextImage}>
              <IoChevronForward />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${currentIndex === index ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* POPUP */}
      {popup && (
        <div className="image-popup">
          <div className="close-btn" onClick={() => setPopup(false)}>
            <IoClose />
          </div>

          <img src={getImageSrc(images[currentIndex])} alt="popup" />

          {images.length > 1 && (
            <>
              <button className="popup-btn left" onClick={prevImage}>
                <IoChevronBack />
              </button>

              <button className="popup-btn right" onClick={nextImage}>
                <IoChevronForward />
              </button>
            </>
          )}
        </div>
      )}

      {/* INFO */}
      <div className="details-card">

        <div className="title-row">
          <h3>{house?.type} in {house?.area}</h3>

          <div className="price">
            ₹{house?.rent?.toLocaleString?.() || 0}
            <small>/month</small>
          </div>
        </div>

        <div className="location">
          <FaMapMarkerAlt /> {house?.area}
        </div>

        <div className="button-row">
          <button className="info-btn">{house?.type}</button>

          {house?.sqft && (
            <button className="info-btn">{house.sqft} sqft</button>
          )}

          <button className="info-btn">
            ₹{house?.advance?.toLocaleString?.() || 0}
          </button>
        </div>

      </div>

      {/* DETAILS */}
      <div className="house-details">

  <h3 className="section-title">Property Details</h3>

  <div className="details-grid">

    <div className="detail-box">
      <FaBed className="fa-icon" />
      <span className="detail-label">Bedrooms</span>
      <b className="detail-value">{house?.bedrooms || 1}</b>
    </div>

    <div className="detail-box">
      <FaCouch className="fa-icon" />
      <span className="detail-label">Hall</span>
      <b className="detail-value">1</b>
    </div>

    <div className="detail-box">
      <FaUtensils className="fa-icon" />
      <span className="detail-label">Kitchen</span>
      <b className="detail-value">1</b>
    </div>

    <div className="detail-box">
      <FaBath className="fa-icon" />
      <span className="detail-label">Bathroom</span>
      <b className="detail-value">{house?.bathrooms || 1}</b>
    </div>

  </div>

</div>

      <div className="contact-bar">
        <a href={getCallHref()} className="call-btn">
          <FaPhoneAlt /> Call
        </a>

        <a
          href={getWhatsAppHref()}
          target="_blank"
          rel="noreferrer"
          className="whatsapp-btn"
        >
          <FaWhatsapp /> WhatsApp
        </a>
      </div>

    </div>
  );
}