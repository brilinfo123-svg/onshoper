import mongoose from 'mongoose';

// Define the schema
const localShopsSchema = new mongoose.Schema(
  {
    featured: { type: Boolean, default: false },
    category: { type: String, required: true },
    fullName: { type: String, required: false },
    businessName: { type: String, required: false },
    gstNumber: { type: String },
    openTime: { type: String },
    closeTime: { type: String },
    flexibleTime: { type: Boolean, default: false },
    closedDays: { type: [String], default: [] },
    homeDelivery: { type: Boolean, default: false },
    services: [
      {
        name: { type: String, required: false },
        price: { type: Number, required: false },
        discount: { type: Number, default: 0 },
      },
    ],
    mobileNumber: { type: String },
    email: { type: String, required: true, unique: true },
    userEmail: { type: String },
    createdAt: { type: Date, default: Date.now },
    websiteLink: { type: String },
    paymentMethods: { type: [String], default: [] },
    offers: [
      {
        offerTitle: { type: String, required: false },
        offerDescription: { type: String },
        offerExpiry: { type: Date },
      },
    ],
    currentAddress: { type: String, required: false },
    currentLocation: { type: String },
    latitude: { type: Number, required: false }, // Added latitude
    longitude: { type: Number, required: false }, // Added longitude
    profileImage: { type: String, default: null },
    portfolioImages: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Middleware to validate image URLs before saving
localShopsSchema.pre('save', function (next) {
  const shop = this;

  // Validate profileImage
  if (shop.profileImage && typeof shop.profileImage !== 'string') {
    return next(new Error('Invalid profileImage format. It must be a string URL.'));
  }

  // Validate portfolioImages
  if (
    shop.portfolioImages &&
    (!Array.isArray(shop.portfolioImages) || shop.portfolioImages.some((img) => typeof img !== 'string'))
  ) {
    return next(new Error('Invalid portfolioImages format. All entries must be string URLs.'));
  }

  next();
});

// Model definition
const LocalShopsModel =
  mongoose.models.LocalShops || mongoose.model('LocalShops', localShopsSchema);

export default LocalShopsModel;
