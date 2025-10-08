import mongoose from "mongoose";


// Coordinate schema for location
const coordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const locationSchema = new mongoose.Schema({
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, default: "" },
  address: { type: String }, // Full address
  coordinates: coordinateSchema
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    SaleType: { type: String }, // NEW
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },

    feature: { type: Boolean, default: false },
    featuredUntil: { type: Date, default: null },

    rentalType: { type: String },
    condition: { type: String, enum: ["New", "Good", "Fair"] },
    price: { type: Number, required: true },
    priceWeek: { type: Number },
    priceMonth: { type: Number },
    formattedPrice: { type: String }, // NEW

    ownerEmail: { type: String },
    shopOwnerID: { type: String },
    hasPaid: { type: Boolean, default: false },
    paidUntil: { type: Date, default: null },

    location: locationSchema,
    pickup: {
      address: { type: String, default: "" },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
      }
    },
    // latitude: { type: Number },
    // longitude: { type: Number },

    images: [{ type: String }],
    coverImage: { type: String },

    rentalTermsFile: { type: String },
    pickupOption: {
      type: String,
      enum: ["Owner", "Customer"],
      required: true,
    },

    termsAccepted: { type: Boolean, default: false },

    // SOCIAL LINKS
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },

    // GENERAL PRODUCT DETAILS
    brand: { type: String },
    fuel: { type: String },
    KmDriven: { type: String },
    model: { type: String },
    year: { type: String },

    // VEHICLES - CAR
    SpareParts: { type: String },
    carBrand: { type: String },
    carModel: { type: String },
    transmission: { type: String },
    OwnersNo: { type: String },

    // Commercial Vehicles
    commercialBrand: { type: String },
    commercialModel: { type: String },
    // End Commercial Vehicles

    // BICYCLES
    BicyclesBrand: { type: String },

    // MOBILE
    MobileBrand: { type: String },
    TabsType: { type: String },
    AccessoriesType: { type: String },
    MobileModel: { type: String },
    // MOBILE

    // JOBS
    salaryPeriod: { type: String },
    positionType: { type: String },
    salaryFrom: { type: String },
    salaryTo: { type: String },

    // APARTMENT
    apartmentType: { type: String },
    bhk: { type: String },
    bathrooms: { type: String },
    furnishing: { type: String },
    listedBy: { type: String },
    superBuiltupArea: { type: String },
    carpetArea: { type: String },
    bachelorsAllowed: { type: String },
    maintenance: { type: String },
    totalFloors: { type: String },
    floorNo: { type: String },
    carParking: { type: String },
    facing: { type: String },
    projectName: { type: String },

    // COMMERCIAL PROPERTY
    CommercialSubtype: { type: String },

    // LAND & PLOTS
    landPlotArea: { type: String },
    landLength: { type: String },
    landBreadth: { type: String },

    // SHOPS & OFFICE
    ConstructionStatus: { type: String },

    // PG & GUEST HOUSE
    mealsIncluded: { type: String },
    pgSubtype: { type: String },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent model overwrite issue in dev
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
