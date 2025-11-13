import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  reason: { type: String, required: true },
  comment: { type: String }, // ✅ optional comment field
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
