const router = require("express").Router();
const House = require("../models/House");
const { upload, processImages, deleteImage } = require("../middleware/upload");
const verifyToken = require("../middleware/auth");
const { optionalVerifyToken } = require("../middleware/auth");

/* ================= GET ALL ================= */
// PUBLIC route, but the registered owner/customer phone number is private:
// only include it in the response when the request is from a verified admin.
router.get("/", optionalVerifyToken, async (req, res) => {
  try {
    const projection = req.isAdmin ? {} : { phone: 0 };
    const houses = await House.find({}, projection).sort({ createdAt: -1 });

    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

/* ================= GET BY ID ================= */
// Same rule applies here — this endpoint previously returned the full
// document (including phone) to anyone, which is the exact leak the public
// Call/WhatsApp number policy exists to prevent.
router.get("/:id", optionalVerifyToken, async (req, res) => {
  try {
    const projection = req.isAdmin ? {} : { phone: 0 };
    const house = await House.findById(req.params.id, projection);

    if (!house) return res.status(404).json({ error: "Not found" });

    res.json(house);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

/* ================= ADD ================= */
router.post("/", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const images = req.files?.length ? await processImages(req.files) : [];

    const house = new House({
      area: req.body.area,
      type: req.body.type,
      sqft: req.body.sqft || "",
      rent: Number(req.body.rent),
      advance: Number(req.body.advance),
      bedrooms: Number(req.body.bedrooms) || 1,
      bathrooms: Number(req.body.bathrooms) || 1,
      phone: req.body.phone,
      preference: req.body.preference || "",
      verified: req.body.verified === "true" || req.body.verified === true,
      images,
    });

    await house.save();
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Add failed" });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    let existingImages = JSON.parse(req.body.existingImages || "[]");

    const newImages = req.files?.length ? await processImages(req.files) : [];

    const updated = await House.findByIdAndUpdate(
      req.params.id,
      {
        area: req.body.area,
        type: req.body.type,
        sqft: req.body.sqft || "",
        rent: Number(req.body.rent),
        advance: Number(req.body.advance),
        bedrooms: Number(req.body.bedrooms) || 1,
        bathrooms: Number(req.body.bathrooms) || 1,
        phone: req.body.phone,
        preference: req.body.preference || "",
        verified: req.body.verified === "true" || req.body.verified === true,
        images: [...existingImages, ...newImages],
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Update failed" });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (house?.images?.length) {
      await Promise.all(house.images.map((img) => deleteImage(img)));
    }

    await House.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
