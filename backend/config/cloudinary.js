const cloudinary = require("cloudinary").v2;

/* =========================
   CLOUDINARY CONFIG
   Reads credentials from environment variables.
   Sign up free at https://cloudinary.com (25GB storage/bandwidth free tier)
   and paste the 3 values from your Dashboard into .env / your host's
   environment variables.
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   STARTUP SANITY CHECK
   Prints a loud, unmissable warning in the terminal the moment the server
   starts if any Cloudinary credential is missing — instead of failing
   silently later on the first image upload.
========================= */
const missing = [
  !process.env.CLOUDINARY_CLOUD_NAME && "CLOUDINARY_CLOUD_NAME",
  !process.env.CLOUDINARY_API_KEY && "CLOUDINARY_API_KEY",
  !process.env.CLOUDINARY_API_SECRET && "CLOUDINARY_API_SECRET",
].filter(Boolean);

if (missing.length) {
  console.warn(
    `⚠️  Cloudinary is NOT configured — missing: ${missing.join(", ")}. ` +
      `Image uploads will fail until these are set in backend/.env (see .env.example).`
  );
} else {
  console.log(`✅ Cloudinary configured (cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`);
}

module.exports = cloudinary;
