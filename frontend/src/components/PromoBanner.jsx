import { useEffect, useRef, useState } from "react";
import { FaShieldAlt, FaTags, FaHandshake, FaBullhorn } from "react-icons/fa";
import "./PromoBanner.css";

/* Simple, dependency-free content slides. Swap/extend this array any time —
   each slide just needs an icon, gradient, title and subtitle. */
const SLIDES = [
  {
    icon: FaShieldAlt,
    gradient: "linear-gradient(120deg, #950505 0%, #e0342f 55%, #ff7a45 100%)",
    title: "100% Verified Houses",
    subtitle: "Every listing checked before it goes live",
  },
  {
    icon: FaTags,
    gradient: "linear-gradient(120deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
    title: "Zero Brokerage Deals",
    subtitle: "Direct owner contact, no hidden fees",
  },
  {
    icon: FaHandshake,
    gradient: "linear-gradient(120deg, #064e3b 0%, #16a34a 55%, #4ade80 100%)",
    title: "List Your Property Free",
    subtitle: "Reach genuine tenants & buyers today",
  },
  {
    icon: FaBullhorn,
    gradient: "linear-gradient(120deg, #4c0519 0%, #be123c 55%, #fb7185 100%)",
    title: "New Listings Every Week",
    subtitle: "Fresh houses, plots & showrooms in Ponnamaravathy",
  },
];

const AUTO_SLIDE_MS = 3200;

export default function PromoBanner() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);

  const goTo = (i) => setIndex((i + SLIDES.length) % SLIDES.length);

  const restartTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_SLIDE_MS);
  };

  useEffect(() => {
    restartTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      goTo(diff < 0 ? index + 1 : index - 1);
      restartTimer();
    }
  };

  return (
    <div className="promo-banner-wrap">
      <div
        className="promo-banner"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="promo-track"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {SLIDES.map(({ icon: Icon, gradient, title, subtitle }, i) => (
            <div className="promo-slide" style={{ background: gradient }} key={i}>
              <div className="promo-icon-badge">
                <Icon />
              </div>
              <div className="promo-text">
                <h4>{title}</h4>
                <p>{subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="promo-dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`promo-dot ${i === index ? "active" : ""}`}
              onClick={() => {
                goTo(i);
                restartTimer();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
