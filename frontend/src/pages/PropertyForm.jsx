import { useState } from "react";
import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function PropertyForm({
  title,
  fields,
  onSubmit,
  navigate,
}) {
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* 📸 IMAGE PREVIEW */
  const handleImage = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previewUrls = files.map((file) =>
      URL.createObjectURL(file)
    );
    setPreview(previewUrls);
  };

  /* ✅ VALIDATION */
  const validate = () => {
    for (let field of fields) {
      if (field.required && !form[field.name]) {
        alert(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      images.forEach((img) => data.append("images", img));

      await onSubmit(data);

      /* 🎉 SUCCESS ANIMATION */
      setSuccess(true);
      setTimeout(() => {
        navigate("/admin");
      }, 1500);

    } catch (err) {
      console.log(err);
      alert("❌ " + (err.response?.data?.error || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-container">

      {/* BACK */}
      <div className="add-header">
        <span onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </span>
      </div>

      <h2 className="add-title">{title}</h2>

      <form onSubmit={submitForm}>

        {fields.map((field) => (
          <div key={field.name}>
            <label>{field.label}</label>

            {field.type === "select" ? (
              <select name={field.name} onChange={handleChange}>
                {field.options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === "radio" ? (
              <div className="type-box">
                {field.options.map((opt) => (
                  <label
                    key={opt}
                    className={form[field.name] === opt ? "active" : ""}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={opt}
                      onChange={handleChange}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type={field.type}
                name={field.name}
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        {/* IMAGE UPLOAD */}
        <label>Upload Images</label>
        <div className="upload-box">
          <FaUpload />
          <input type="file" multiple onChange={handleImage} />
        </div>

        {/* 🔥 PREVIEW */}
        <div className="image-preview-grid">
  {preview.map((img, i) => (
    <div className="img-box" key={i}>
      <img src={img} alt="preview" />
    </div>
  ))}
</div>

        <button className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* 🎉 SUCCESS */}
        {success && (
          <div className="success-msg">
            ✅ Successfully Added!
          </div>
        )}
      </form>
    </div>
  );
}