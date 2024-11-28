import mongoose from "mongoose";
const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema({
  type: { type: String, required: true },
  bankName: { type: String },
  bankNumber: { type: String },
  ifscCode: { type: String },
  holderName: { type: String },
  upiId: { type: String },
  paypalEmail: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
export default PaymentMethod;
