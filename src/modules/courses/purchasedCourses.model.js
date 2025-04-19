import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const purchaseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  purchaseMethod: {
    type: String,
    enum: ["hardCode", "payment"],
    required: true
  },
  redeemedCode: {
    type: String
  },
  paymentDetails: {
    amount: {
      type: Number
    },
    transactionId: {
      type: String
    }
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
});

const purchaseModel = mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
export default purchaseModel;
