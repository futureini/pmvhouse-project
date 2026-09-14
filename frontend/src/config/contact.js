/**
 * ==========================================================================
 * SINGLE SOURCE OF TRUTH — public Call / WhatsApp contact number
 * ==========================================================================
 * Every public-facing Call button and WhatsApp button in the app must use
 * THIS number — never a property's/house's registered owner phone number
 * from the database.
 *
 * The registered owner/customer phone number entered in Admin → Add House /
 * Add Property is stored for admin record-keeping only (see AdminList.jsx).
 * It must never be used as the destination for a public Call or WhatsApp
 * action, and the backend already strips it out of public API responses
 * (see backend/routes/houseRoutes.js and propertyRoutes.js).
 *
 * To change the public contact number in the future, change it ONLY here —
 * every screen imports from this file rather than hardcoding the number.
 * ==========================================================================
 */

// Digits only, with country code, no "+" or spaces (matches tel:/wa.me format).
export const PUBLIC_CONTACT_NUMBER = "917358523204";

// Convenience helpers so call sites don't re-build these URLs by hand.
export const getCallHref = () => `tel:+${PUBLIC_CONTACT_NUMBER}`;

export const getWhatsAppHref = (message = "") => {
  const base = `https://wa.me/${PUBLIC_CONTACT_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
