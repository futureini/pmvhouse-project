import { useState } from "react";
import { axiosInstance } from "../app";
import { useNavigate } from "react-router-dom";
import "../styles/addhouse.css";

import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function AddProperty() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "Land",
    area: "",
    location: "",
    sqft: "", // ✅ ADDED
    approval: "DTCP",
    price: "",
    phone: "",
    images: []
  });

  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* 🔥 IMAGE COMPRESSION */
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;

        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImage = async (e) => {
    const files = Array.from(e.target.files);

    const compressedImages = await Promise.all(
      files.map((file) => compressImage(file))
    );

    setForm({ ...form, images: compressedImages });

    const previewUrls = compressedImages.map((file) =>
      URL.createObjectURL(file)
    );
    setPreview(previewUrls);
  };

  const removeImage = (index) => {
    const newPreview = preview.filter((_, i) => i !== index);
    const newImages = form.images.filter((_, i) => i !== index);

    setPreview(newPreview);
    setForm({ ...form, images: newImages });
  };

  const validate = () => {
    if (!form.area) return alert("Area required");
    if (!form.location) return alert("Location required");
    if (!form.price) return alert("Price required");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(form).forEach(key => {
        if (key === "images") {
          form.images.forEach(img => data.append("images", img));
        } else {
          data.append(key, form[key]);
        }
      });

      await axiosInstance.post("/properties", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/admin");
      }, 1500);

    } catch (err) {
      console.log(err);
      alert("❌ " + (err.response?.data?.error || "Failed to add property"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-container">

      <div className="add-header">
        <span onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </span>
      </div>

      <h2 className="add-title">Add Property</h2>

      <form onSubmit={submit}>

        <label>Type</label>
        <select name="type" onChange={handleChange}>
          <option>Land</option>
          <option>Plot</option>
          <option>House</option>
        </select>

        <label>Area</label>
        <input name="area" onChange={handleChange} required />

        <label>Location</label>
        <input name="location" onChange={handleChange} required />

        <label>Sqft</label>
<input name="sqft" onChange={handleChange} />

        <label>Approval</label>
        <select name="approval" onChange={handleChange}>
          <option>DTCP</option>
          <option>CMDA</option>
          <option>Patta</option>
        </select>

        <label>Price</label>
        <input type="number" name="price" onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" onChange={handleChange} />

        <label>Upload Photos</label>
        <div className="upload-box">
          <FaUpload />
          <input type="file" multiple onChange={handleImage} />
        </div>

        <div className="image-preview-grid">
          {preview.map((img, index) => (
            <div className="img-box" key={index}>
              <img src={img} alt="preview" />
              <button
                type="button"
                className="delete-img"
                onClick={() => removeImage(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {success && (
          <div className="success-msg">
            ✅ Property Added Successfully!
          </div>
        )}

      </form>
    </div>
  );
}