const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

/* =========================
   MULTER (MEMORY STORAGE)
   Files are never written to local disk — they stay in memory only
   long enough to be compressed and streamed up to Cloudinary. This is
   what makes image uploads work correctly on Render (and any host with
   an ephemeral/temporary filesystem): nothing depends on local disk.
========================= */
const storage = multer.memoryStorage();

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/i;
  const ok =
    allowed.test(file.originalname.split(".").pop() || "") ||
    /image\/(jpeg|png|webp)/.test(file.mimetype);

  if (ok) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) allowed"));
  }
};

/* =========================
   MULTER INSTANCE
========================= */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

/* =========================
   UPLOAD ONE BUFFER TO CLOUDINARY
========================= */
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pmvhouse", // all listing photos live under this Cloudinary folder
        resource_type: "image",
        format: "webp", // modern, small, widely-supported format
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url); // permanent HTTPS URL, works from anywhere
      }
    );
    stream.end(buffer);
  });

/* =========================
   IMAGE PROCESSOR
   Resizes + compresses with sharp (fast, small file size), then
   uploads the resulting buffer straight to Cloudinary — nothing is
   ever saved to the server's local disk.

   IMPORTANT: if a file fails to upload (bad Cloudinary credentials, no
   internet, etc.), this throws instead of silently skipping it — so the
   route handler can return a real error to the browser instead of quietly
   saving a listing with no photo.
========================= */
const processImages = async (files) => {
  const urls = [];

  for (const file of files) {
    try {
      const optimizedBuffer = await sharp(file.buffer)
        .resize(1200, 800, { fit: "cover" })
        .webp({ quality: 70 })
        .toBuffer();

      const url = await uploadBufferToCloudinary(optimizedBuffer);
      urls.push(url);
    } catch (err) {
      console.error("❌ Image upload failed:", err.message);
      throw new Error(`Image upload failed: ${err.message}`);
    }
  }

  return urls; // array of full Cloudinary https:// URLs, saved directly on the listing
};

/* =========================
   DELETE AN IMAGE FROM CLOUDINARY
   Given a stored image value (a Cloudinary URL for new listings, or a
   legacy local filename from before this update), remove it from
   Cloudinary if applicable. Legacy filenames are silently skipped since
   there is nothing on Cloudinary to delete for them.
========================= */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("res.cloudinary.com")) return;

    // Pull the "pmvhouse/xxxxx" public_id out of the Cloudinary URL
    const match = imageUrl.match(/pmvhouse\/([^./]+)\./);
    if (!match) return;

    const publicId = `pmvhouse/${match[1]}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  upload,
  processImages,
  deleteImage,
};
