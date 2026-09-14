import { useEffect, useState } from "react";
import { axiosInstance, BASE_URL } from "../app";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

export default function AdminList() {
  const [houses, setHouses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadData();
  }, []);

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = async () => {
    try {
      setLoading(true);

      const [houseRes, propertyRes] = await Promise.all([
        axiosInstance.get("/houses"),
        axiosInstance.get("/properties"),
      ]);

      setHouses(Array.isArray(houseRes.data) ? houseRes.data : []);
      setProperties(Array.isArray(propertyRes.data) ? propertyRes.data : []);
    } catch (err) {
      console.log("LOAD ERROR:", err);
      setHouses([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE HOUSE
  ========================= */
  const deleteHouse = async (id) => {
    if (!window.confirm("Delete house?")) return;

    try {
      const token = localStorage.getItem("token");

      await axiosInstance.delete(`/houses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("House deleted");
      loadData();
    } catch (err) {
      console.log("DELETE HOUSE ERROR:", err);
      alert("Delete failed");
    }
  };

  /* =========================
     DELETE PROPERTY
  ========================= */
  const deleteProperty = async (id) => {
    if (!window.confirm("Delete property?")) return;

    try {
      const token = localStorage.getItem("token");

      await axiosInstance.delete(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Property deleted");
      loadData();
    } catch (err) {
      console.log("DELETE PROPERTY ERROR:", err);
      alert("Delete failed");
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* =========================
     IMAGE FALLBACK
  ========================= */
  const getImage = (img) => {
    if (!img) return "/images/noimage.jpg";
    return img.startsWith("http") ? img : `${BASE_URL}/uploads/${img}`;
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Panel</h2>

        <div className="btn-group">
          <button onClick={() => navigate("/add")} className="add-btn">
            + Add House
          </button>

          <button onClick={() => navigate("/add-property")} className="add-btn">
            + Add Property
          </button>

          <button onClick={()=>navigate("/add-lease")} className="add-btn">
  + Add Lease
</button>

<button onClick={()=>navigate("/add-showroom")} className="add-btn">
  + Add Showroom
</button>

          <button onClick={logout} className="delete-btn">
            Logout
          </button>
        </div>
      </div>

      {/* ================= HOUSES ================= */}
      <h3>🏠 Houses</h3>

      {houses.length === 0 ? (
        <p className="empty">No houses found</p>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {houses.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <img
                        src={getImage(h.images?.[0])}
                        className="admin-img"
                        onError={(e) => (e.target.src = "/images/noimage.jpg")}
                        alt="house"
                      />
                    </td>

                    <td>{h.phone || "-"}</td>

                    <td className="action-btns">
                      <button
                        onClick={() => navigate("/edit/" + h._id)}
                        className="edit-btn"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteHouse(h._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="mobile-list">
            {houses.map((h) => (
              <div key={h._id} className="admin-card">
                <img
                  src={getImage(h.images?.[0])}
                  onError={(e) => (e.target.src = "/images/noimage.jpg")}
                  alt=""
                />

                <p><b>Phone:</b> {h.phone || "-"}</p>

                <div className="admin-actions">
                  <button
                    onClick={() => navigate("/edit/" + h._id)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteHouse(h._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= PROPERTIES ================= */}
      <h3>🏢 Properties</h3>

      {properties.length === 0 ? (
        <p className="empty">No properties found</p>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Location</th>
<th>Category</th>
<th>Phone</th> {/* ✅ ADDED */}
{/* <th>Price</th> */}
                </tr>
              </thead>

              <tbody>
                {properties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={getImage(p.images?.[0])}
                        className="admin-img thumb"
                        onError={(e) => (e.target.src = "/images/noimage.jpg")}
                        alt="property"
                      />
                    </td>

                    <td>{p.location || "-"}</td>

                    <td>{p.category || "-"}</td>
                    <td>{p.phone || "-"}</td> {/* ✅ ADDED */}

                    {/* <td>
                      ₹{p.price?.toLocaleString?.() || p.leaseAmount || 0}
                    </td> */}

                    <td className="action-btns">
                      <button
                        onClick={() => navigate("/edit-property/" + p._id)}
                        className="edit-btn"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProperty(p._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="mobile-list">
            {properties.map((p) => (
              <div key={p._id} className="admin-card">
                <img
                  src={getImage(p.images?.[0])}
                  onError={(e) => (e.target.src = "/images/noimage.jpg")}
                  alt=""
                />

                <p><b>Location:</b> {p.location || "-"}</p>
                <p><b>Type:</b> {p.category || "-"}</p>
                <p>
                  <b>Price:</b> ₹
                  {p.price?.toLocaleString?.() || p.leaseAmount || 0}
                </p>

                <div className="admin-actions">
                  <button
                    onClick={() => navigate("/edit-property/" + p._id)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProperty(p._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}