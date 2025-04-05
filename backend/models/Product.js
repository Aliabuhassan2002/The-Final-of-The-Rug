///////////////////////////////////////////////////////////////ai
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true }, // Easier price filtering
    category: { type: String, enum: ["carpet", "accessory"], required: true },
    size: { type: String, required: true, index: true }, // Indexing for filtering
    style: {
      type: String,
      enum: [
        "traditional",
        "modern",
        "bohemian",
        "transitional",
        "vintage",
        "contemporary",
        "minimalist",
        "coastal",
      ],
      index: true,
    },
    roomType: {
      type: String,
      enum: [
        "living-room",
        "bedroom",
        "dining-room",
        "office",
        "hallway",
        "outdoor",
      ],
      index: true,
    },
    pattern: {
      type: String,
      enum: ["solid", "geometric", "floral", "abstract", "striped", "oriental"],
    },
    color: { type: String, required: true, index: true }, // Indexing for filtering
    colors: [{ type: String }],
    material: { type: String, required: true, index: true }, // Indexing for filtering
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    isDeleted: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);
productSchema.virtual("displayColors").get(function () {
  return this.colors?.length ? this.colors : this.color ? [this.color] : [];
});

module.exports = mongoose.model("Product", productSchema);
