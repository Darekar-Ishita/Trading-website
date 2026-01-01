import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stockSymbol: { type: String, required: true },
    price: { type: Number, required: true }, // buy price per unit
    quantity: { type: Number, required: true },
    type: { type: String, enum: ["BUY", "SELL"], default: "BUY" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
