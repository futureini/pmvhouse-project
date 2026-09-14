import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";

import Home from "./pages/Home";
import Details from "./pages/Details";
import AdminList from "./pages/AdminList";
import AddHouse from "./pages/AddHouse";
import EditHouse from "./pages/EditHouse";
import EditProperty from "./pages/EditProperty";
import Login from "./pages/Login";
import AddProperty from "./pages/AddProperty";
import PropertyDetails from "./pages/PropertyDetails";

/* ✅ NEW IMPORTS */
import AddLease from "./pages/AddLease";
import AddShowroom from "./pages/AddShowroom";

/* 🔐 PROTECTED ROUTE */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <BrowserRouter>
        <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />

        {/* 🔥🔥 ADD THESE (MAIN FIX) */}
        <Route path="/lease" element={<Home />} />
        <Route path="/plot" element={<Home />} />
        <Route path="/showroom" element={<Home />} />

        <Route path="/details/:id" element={<Details />} />
        <Route path="/property-details/:id" element={<PropertyDetails />} />
        <Route path="/details-property/:id" element={<PropertyDetails />} />
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminList />
            </PrivateRoute>
          }
        />

        {/* ================= ADD ================= */}
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <AddHouse />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-property"
          element={
            <PrivateRoute>
              <AddProperty />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-lease"
          element={
            <PrivateRoute>
              <AddLease />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-showroom"
          element={
            <PrivateRoute>
              <AddShowroom />
            </PrivateRoute>
          }
        />

        {/* ================= EDIT ================= */}
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditHouse />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-property/:id"
          element={
            <PrivateRoute>
              <EditProperty />
            </PrivateRoute>
          }
        />

      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;