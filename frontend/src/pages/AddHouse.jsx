import { useState } from "react";
import { axiosInstance } from "../app";
import { useNavigate } from "react-router-dom";
import "../styles/addhouse.css";
import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function AddHouse() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    area: "",
    type: "2 BHK",
    rent: "",
    advance: "",
    sqft: "",
    bedrooms: "",
    bathrooms: "",
    phone: "",
    preference: "Family",
    verified: false,
    images: []
  });

  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImage = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: files }));

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreview(previewUrls);
  };

  const validate = () => {
    if (!form.area) return alert("Area required");
    if (!form.rent) return alert("Rent required");
    if (!form.advance) return alert("Advance required");
    if (!form.phone) return alert("Phone required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "images") {
          form.images.forEach((img) => data.append("images", img));
        } else {
          data.append(key, form[key]);
        }
      });

      const token = localStorage.getItem("token");

      await axiosInstance.post("/houses", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ House Added");
      navigate("/admin");

    } catch (err) {
      console.error(err);
      alert("❌ " + (err.response?.data?.error || "Failed to add house"));
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

      <h2>Add House</h2>

      <form onSubmit={handleSubmit}>

        <input name="area" placeholder="Area" onChange={handleChange} required />

        <div className="type-box">
          {["1 BHK", "2 BHK", "3 BHK"].map((t) => (
            <label key={t} className={form.type === t ? "active" : ""}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange}/>
              {t}
            </label>
          ))}
        </div>

        <div className="type-box">
          {["Bachelor", "Family", "Bachelor/Family"].map((p) => (
            <label key={p} className={form.preference === p ? "active" : ""}>
              <input type="radio" name="preference" value={p} checked={form.preference === p} onChange={handleChange}/>
              {p}
            </label>
          ))}
        </div>

        <label className="checkbox-row">
          <input type="checkbox" name="verified" checked={form.verified} onChange={handleChange}/>
          Verified
        </label>

        <input type="number" name="rent" placeholder="Rent" onChange={handleChange} required />
        <input type="number" name="advance" placeholder="Advance" onChange={handleChange} required />
        <input name="sqft" placeholder="Sqft" onChange={handleChange} />
        <input name="bedrooms" placeholder="Bedrooms" onChange={handleChange} />
        <input name="bathrooms" placeholder="Bathrooms" onChange={handleChange} />

        <div className="upload-box">
          <FaUpload />
          <input type="file" multiple accept="image/*" onChange={handleImage} />
        </div>

        <div className="image-preview-grid">
          {preview.map((img, i) => <img key={i} src={img} alt="" />)}
        </div>

        <input name="phone" placeholder="Phone" onChange={handleChange} required />

        <button
  type="submit"
  className="submit-btn"
  disabled={loading}
>
  {loading ? "Submitting..." : "Submit"}
</button>

      </form>
    </div>
  );
}