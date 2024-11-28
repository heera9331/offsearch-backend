import mongoose from "mongoose";
const Schema = mongoose.Schema;

const recordSchema = new Schema({
  impression: { type: Number, required: true },
  clicks: { type: Number, required: true },
  cpm: { type: Number, required: true },
  earnings: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Adding a compound index to ensure userId and createdAt are unique together
recordSchema.index({ userId: 1, createdAt: 1 }, { unique: true });

const User = mongoose.model("Record", recordSchema);
export default User;
