const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["1 BHK", "2 BHK", "3 BHK"],
      required: true,
    },

    rent: {
      type: Number,
      required: true,
      min: 0,
    },

    advance: {
      type: Number,
      required: true,
      min: 0,
    },

    sqft: {
      type: String,
      default: "",
    },

    bedrooms: {
      type: Number,
      default: 1,
    },

    bathrooms: {
      type: Number,
      default: 1,
    },

    phone: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    preference: {
      type: String,
      enum: ["Bachelor", "Family", "Bachelor/Family", ""],
      default: "",
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("House", houseSchema);
