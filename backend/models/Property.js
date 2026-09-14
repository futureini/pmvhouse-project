const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    /* =========================
       CATEGORY (NEW SYSTEM)
    ========================= */
    category: {
      type: String,
      enum: ["Rent", "Lease", "Plot", "Showroom"],
      default: "Plot",
    },

    /* =========================
       OLD TYPE (KEEP FOR SAFETY)
    ========================= */
    type: {
      type: String,
      enum: ["Land", "Plot", "House"],
    },

    /* =========================
       COMMON FIELDS
    ========================= */
    area: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    /* =========================
       APPROVAL (FOR LAND/PLOT)
    ========================= */
    approval: {
      type: String,
      enum: ["DTCP", "CMDA", "Patta", "None"],
      default: "None",
    },

    /* =========================
       RENT / SHOWROOM PRICE
    ========================= */
    price: {
      type: Number,
    },

    /* =========================
       LEASE (ONE-TIME)
    ========================= */
    leaseAmount: {
      type: Number,
    },

    duration: {
      type: String, // e.g. "3 Years"
    },

    /* =========================
       SHOWROOM SPECIFIC
    ========================= */
    shopName: {
      type: String,
    },

    sqft: {
      type: String,
    },

    parking: {
      type: String, // Yes / No
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
