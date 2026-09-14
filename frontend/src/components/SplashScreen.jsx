import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "./SplashScreen.css";

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show the splash briefly, then fade it out and hand control back to the app.
    const fadeTimer = setTimeout(() => setFadeOut(true), 1600);
    const doneTimer = setTimeout(() => onFinish?.(), 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? "splash-fade-out" : ""}`}>
      <div className="splash-logo-wrap">
        <img
          src={logo}
          alt="PMV Properties - Ponnamaravathy Property Marketplace"
          className="splash-logo"
        />
      </div>

      <div className="splash-progress" aria-hidden="true">
        <span className="splash-progress-fill"></span>
      </div>
    </div>
  );
}
