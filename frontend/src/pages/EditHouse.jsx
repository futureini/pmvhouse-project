import { useEffect, useState } from "react";
import { axiosInstance, BASE_URL } from "../app";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/addhouse.css";
import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function EditHouse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [house, setHouse] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH HOUSE
  ========================= */
  useEffect(() => {
    if (!id) return;

    axiosInstance.get(`/houses/${id}`)
      .then(res => setHouse(res.data))
      .catch(err => {
        console.error(err);
        alert("❌ Failed to load house");
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setHouse(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  /* =========================
     HANDLE NEW IMAGES
  ========================= */
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreview(urls);
  };

  /* =========================
     REMOVE EXISTING IMAGE
  ========================= */
  const removeImage = (img) => {
    setHouse(prev => ({
      ...prev,
      images: prev.images.filter(i => i !== img)
    }));
  };

  /* =========================
     UPDATE HOUSE
  ========================= */
  const update = async (e) => {
    e.preventDefault();

    try {
      setLoading(true); // ✅ loading start

      const data = new FormData();

      Object.keys(house).forEach(key => {
        if (key !== "images") {
          data.append(key, house[key]);
        }
      });

      data.append("existingImages", JSON.stringify(house.images || []));

      newImages.forEach(img => data.append("images", img));

      const token = localStorage.getItem("token");

      await axiosInstance.put(`/houses/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ House Updated Successfully");
      navigate("/admin");

    } catch (err) {
      console.error(err);
      alert("❌ " + (err.response?.data?.error || "Update failed"));
    } finally {
      setLoading(false); // ✅ loading stop
    }
  };

  /* =========================
     IMAGE URL FIX
  ========================= */
  const getImageSrc = (img) => {
    if (!img) return "/images/noimage.jpg";

    return img.startsWith("http")
      ? img
      : `${BASE_URL}/uploads/${img}`;
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!house) return <p>House not found</p>;

  return (
    <div className="add-container">

      {/* BACK */}
      <div className="add-header">
        <span onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </span>
      </div>

      <h2 className="add-title">Edit House</h2>

      <form onSubmit={update}>

        <label>Area</label>
        <input name="area" value={house.area || ""} onChange={handleChange} />

        <label>House Type</label>
        <div className="type-box">
          {["1 BHK", "2 BHK", "3 BHK"].map((t) => (
            <label key={t} className={house.type === t ? "active" : ""}>
              <input
                type="radio"
                name="type"
                value={t}
                checked={house.type === t}
                onChange={handleChange}
              />
              {t}
            </label>
          ))}
        </div>

        <label>Preference</label>
        <div className="type-box">
          {["Bachelor", "Family", "Bachelor/Family"].map((p) => (
            <label key={p} className={house.preference === p ? "active" : ""}>
              <input
                type="radio"
                name="preference"
                value={p}
                checked={house.preference === p}
                onChange={handleChange}
              />
              {p}
            </label>
          ))}
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="verified"
            checked={house.verified || false}
            onChange={handleChange}
          />
          Verified Property
        </label>

        <label>Rent</label>
        <input
          type="number"
          name="rent"
          value={house.rent || ""}
          onChange={handleChange}
        />

        <label>Advance</label>
        <input
          type="number"
          name="advance"
          value={house.advance || ""}
          onChange={handleChange}
        />

        <label>Sqft</label>
        <input
          name="sqft"
          value={house.sqft || ""}
          onChange={handleChange}
        />

        <label>Bedrooms</label>
        <input
          name="bedrooms"
          value={house.bedrooms || ""}
          onChange={handleChange}
        />

        <label>Bathrooms</label>
        <input
          name="bathrooms"
          value={house.bathrooms || ""}
          onChange={handleChange}
        />

        <label>Existing Images</label>
        <div className="image-preview-grid">
          {house.images?.map((img, i) => (
            <div key={i} className="image-box">
              <img src={getImageSrc(img)} alt="" />
              <button type="button" onClick={() => removeImage(img)}>
                ❌
              </button>
            </div>
          ))}
        </div>

        <label>Upload New Images</label>
        <div className="upload-box">
          <FaUpload />
          <input type="file" multiple accept="image/*" onChange={handleNewImages} />
        </div>

        <div className="image-preview-grid">
          {preview.map((img, i) => (
            <img key={i} src={img} alt="" />
          ))}
        </div>

        <label>Phone</label>
        <input
          name="phone"
          value={house.phone || ""}
          onChange={handleChange}
        />

        {/* ✅ UPDATED BUTTON */}
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>

      </form>
    </div>
  );
}