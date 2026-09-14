import { useEffect, useState } from "react";
import { axiosInstance, BASE_URL } from "../app";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/addhouse.css";

import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function EditProperty() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState({
    type: "Land",
    area: "",
    location: "",
    approval: "DTCP",
    price: "",
    leaseAmount: "",
    duration: "",
    sqft: "", // ✅ ADDED
    shopName: "",
    // parking: "",
    phone: "",
    images: []
  });

  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD PROPERTY
  ========================= */
  useEffect(() => {
    axiosInstance.get(`/properties/${id}`)
      .then(res => {
        setProperty(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  /* =========================
     CATEGORY CHECK
  ========================= */
  const isLease = property.category === "Lease";
  const isShowroom = property.category === "Showroom";
  const isPlot = property.category === "Plot";

  /* =========================
     INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setNewImages(e.target.files);
  };

  /* =========================
     REMOVE EXISTING IMAGE
  ========================= */
  const removeImage = (index) => {
    const updated = [...property.images];
    updated.splice(index, 1);
    setProperty({ ...property, images: updated });
  };

  /* =========================
     UPDATE PROPERTY
  ========================= */
  const update = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(property).forEach(key => {
        if (key !== "images") {
          data.append(key, property[key]);
        }
      });

      // existing images
      data.append("existingImages", JSON.stringify(property.images || []));

      // new images
      for (let i = 0; i < newImages.length; i++) {
        data.append("images", newImages[i]);
      }

      await axiosInstance.put(`/properties/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("✅ Property Updated");
      navigate("/admin");

    } catch (err) {
      console.log(err);
      alert("❌ " + (err.response?.data?.error || "Update failed"));
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="add-container">

      {/* HEADER */}
      <div className="add-header">
        <span onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </span>
      </div>

      <h2 className="add-title">Edit Property</h2>

      <form onSubmit={update}>

        {/* COMMON */}
        <label>Area</label>
        <input name="area" value={property.area} onChange={handleChange} />

        <label>Location</label>
        <input name="location" value={property.location} onChange={handleChange} />

        {/* ================= PLOT ================= */}
        {isPlot && (
          <>
            <label>Sqft</label>
            <input name="sqft" value={property.sqft || ""} onChange={handleChange} />

            <label>Price</label>
            <input type="number" name="price" value={property.price || ""} onChange={handleChange} />
          </>
        )}

        {/* ================= LEASE ================= */}
        {isLease && (
          <>
            <label>Sqft</label>
            <input name="sqft" value={property.sqft || ""} onChange={handleChange} />

            <label>Lease Amount</label>
            <input type="number" name="leaseAmount" value={property.leaseAmount || ""} onChange={handleChange} />

            <label>Duration</label>
            <input name="duration" value={property.duration || ""} onChange={handleChange} />
          </>
        )}

        {/* ================= SHOWROOM ================= */}
        {isShowroom && (
          <>
            <label>Shop Name</label>
            <input name="shopName" value={property.shopName || ""} onChange={handleChange} />

            <label>Sqft</label>
            <input name="sqft" value={property.sqft || ""} onChange={handleChange} />

            <label>Price</label>
            <input type="number" name="price" value={property.price || ""} onChange={handleChange} />

            {/* <label>Parking</label>
            <input name="parking" value={property.parking || ""} onChange={handleChange} /> */}
          </>
        )}

        {/* ================= COMMON ================= */}
        <label>Phone</label>
        <input name="phone" value={property.phone} onChange={handleChange} />

        {/* ================= EXISTING IMAGES ================= */}
        <label>Existing Images</label>
        <div className="image-preview-grid">
          {property.images?.map((img, i) => (
            <div key={i} className="img-box">
              <img
                src={img.startsWith("http") ? img : `${BASE_URL}/uploads/${img}`}
                alt=""
                onError={(e) => {
                  e.target.src = "/images/noimage.jpg";
                }}
              />
              <button
                type="button"
                className="delete-img"
                onClick={() => removeImage(i)}
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* ================= NEW IMAGES ================= */}
        <label>Upload New Images</label>
        <div className="upload-box">
          <FaUpload />
          <input type="file" multiple onChange={handleImage} />
        </div>

        <button type="submit" className="submit-btn">
          Update
        </button>

      </form>
    </div>
  );
}