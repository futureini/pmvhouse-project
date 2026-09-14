import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance, BASE_URL } from "../app";
import "../styles/details.css";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp
} from "react-icons/fa";
import { getCallHref, getWhatsAppHref } from "../config/contact";

import {
  IoChevronBack,
  IoChevronForward,
  IoClose
} from "react-icons/io5";

export default function PropertyDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [popup, setPopup] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);

    axiosInstance.get(`/properties/${id}`)
      .then(res => setProperty(res.data))
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ✅ FORMAT PRICE */
  const formatPrice = (val) =>
    val ? `₹${Number(val).toLocaleString("en-IN")}` : "₹0";

  /* ✅ FORMAT LABEL */
  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());

  if (loading) {
    return (
      <div className="app-container">
        <div className="skeleton-image"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="error-page">
        <h2>❌ Failed to load property</h2>
        <p>Something went wrong or property not found</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const images = property?.images?.length > 0
    ? property.images
    : ["fallback"];

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

      <div className="back-button" onClick={() => navigate(-1)}>
        <div className="back-icon">
          <FaArrowLeft />
        </div>
        <span>Back</span>
      </div>

      <div className="slider">

        <img
          src={getImageSrc(images[currentIndex])}
          className="details-image"
          onClick={() => setPopup(true)}
          onError={(e) => (e.target.src = "/images/noimage.jpg")}
          alt="property"
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

      <div className="details-card">
        <div className="title-row">
          <h3>{property.category} in {property.area}</h3>
          <div className="price">
            {formatPrice(property.category==="Lease" ? property.leaseAmount : property.price)}
          </div>
        </div>

        <div className="location">
          <FaMapMarkerAlt /> {property.location}
        </div>

        <div className="button-row">
          {property.type && <button className="info-btn">{property.type}</button>}
          {property.sqft && <button className="info-btn">{property.sqft} sqft</button>}
          {property.duration && <button className="info-btn">{property.duration} yrs</button>}
          {/* ❌ parking removed */}
        </div>
      </div>

      {/* DETAILS AUTO RENDER */}
      <div className="details-card">

        {Object.entries(property)
          .filter(([key]) =>
            !["_id","__v","images","category","phone","createdAt","updatedAt","parking"].includes(key) &&
            !(
              (property.category === "Lease" || property.category === "Showroom") 
              && key === "approval"
            ) // ❌ remove approval for Lease
          )
          .map(([key, value]) => {

            if (!value) return null;

            if (key === "price" || key === "leaseAmount") {
              return (
                <div className="info-row" key={key}>
                  <span className="label">{formatLabel(key)}</span>
                  <span className="value">{formatPrice(value)}</span>
                </div>
              );
            }

            return (
              <div className="info-row" key={key}>
                <span className="label">{formatLabel(key)}</span>
                <span className="value">{value}</span>
              </div>
            );
          })}

      </div>

      <div className="contact-bar">
        <a href={getCallHref()} className="call-btn">
          <FaPhoneAlt /> Call Owner
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