import mongoose, { Schema, Model } from "mongoose";

const ItemSchema = new Schema(
  {
    clientId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    pieces: { type: Number, default: 1 },
    photos: [{ type: String }],
    barcode: { type: String, unique: true },
    uid: { type: String, unique: true },
    isLocked: { type: Boolean, default: false },

    action: {
      type: String,
      enum: ["SALE", "DISTRIBUTE", "DONATE", "OTHER"],
      required: false,
    },
    actionNote: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Item: Model<any> =
  mongoose.models.Item || mongoose.model("Item", ItemSchema);

export default Item;
