import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  invoiceId: {
    type: Number,
    required: true
  },
  invoiceKey: {
    type: String,
    required: true
  },
  paymentData: {
    type: mongoose.Schema.Types.Mixed
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "EGP"
  },
  status: {
    type: String,
    enum: ["paid", "pending", "failed"],
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;