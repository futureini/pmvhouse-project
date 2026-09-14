const router = require("express").Router();
const Property = require("../models/Property");
const { upload, processImages, deleteImage } = require("../middleware/upload");
const verifyToken = require("../middleware/auth");
const { optionalVerifyToken } = require("../middleware/auth");

/* ================= GET ALL ================= */
// PUBLIC route — strip the private registered phone number unless the
// request comes from a verified admin (same rule as houseRoutes.js).
router.get("/", optionalVerifyToken, async (req, res) => {
  try {
    const projection = req.isAdmin ? {} : { phone: 0 };
    const data = await Property.find({}, projection).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

/* ================= GET ONE ================= */
router.get("/:id", optionalVerifyToken, async (req, res) => {
  try {
    const projection = req.isAdmin ? {} : { phone: 0 };
    const data = await Property.findById(req.params.id, projection);

    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

/* ================= ADD ================= */
router.post("/", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const images = req.files?.length ? await processImages(req.files) : [];

    const {
      category,
      type,
      area,
      location,
      approval,
      price,
      leaseAmount,
      duration,
      shopName,
      sqft,
      parking,
      phone,
    } = req.body;

    if (!area || !location) {
      return res.status(400).json({ error: "Area & location required" });
    }

    if (category === "Lease") {
      if (!leaseAmount) {
        return res.status(400).json({ error: "Lease amount required" });
      }
    } else {
      if (!price) {
        return res.status(400).json({ error: "Price required" });
      }
    }

    const property = new Property({
      category: category || "Plot",
      type,
      area,
      location,
      approval,
      phone,
      price: category === "Lease" ? undefined : Number(price),
      leaseAmount: category === "Lease" ? Number(leaseAmount) : undefined,
      duration,
      shopName,
      sqft,
      parking,
      images,
    });

    await property.save();

    res.json({ message: "Property added", property });
  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ error: err.message || "Add failed" });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const existingImages = JSON.parse(req.body.existingImages || "[]");

    const newImages = req.files?.length ? await processImages(req.files) : [];

    const {
      category,
      type,
      area,
      location,
      approval,
      price,
      leaseAmount,
      duration,
      shopName,
      sqft,
      parking,
      phone,
    } = req.body;

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        category,
        type,
        area,
        location,
        approval,
        phone,
        price: category === "Lease" ? undefined : Number(price),
        leaseAmount: category === "Lease" ? Number(leaseAmount) : undefined,
        duration,
        shopName,
        sqft,
        parking,
        images: [...existingImages, ...newImages],
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message || "Update failed" });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (property?.images?.length) {
      await Promise.all(property.images.map((img) => deleteImage(img)));
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
