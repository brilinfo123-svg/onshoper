import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
import ShopOwner from "@/models/ShopOwner";
import categoryRules from "@/config/categoryRules";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

// const uploadToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
//       if (error || !result) return reject(error);
//       resolve(result.secure_url);
//     });
//     streamifier.createReadStream(file.buffer).pipe(stream);
//   });
// };

const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test";
const client = new MongoClient(uri);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });


  const form = new IncomingForm({
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error parsing form data" });

    const images: string[] = [];
    let coverImage = "";
    let rentalTermsFile = "";
    
    const uploadToCloudinary = async (file: any, folder: string): Promise<string> => {
      const fileBuffer = await fs.readFile(file.filepath); // ✅ Read buffer from disk
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream); // ✅ Use buffer here
      });
    };
    
    
    // ✅ Handle multiple images
    if (files.images) {
      const fileArray = Array.isArray(files.images) ? files.images : [files.images];
      for (const file of fileArray) {
        const url = await uploadToCloudinary(file, 'product-images');
        images.push(url);
      }
    }
    
    // ✅ Handle single cover image
    if (files.coverImage) {
      const coverFile = Array.isArray(files.coverImage) ? files.coverImage[0] : files.coverImage;
      coverImage = await uploadToCloudinary(coverFile, 'product-cover');
    }
    
    // ✅ Handle rental terms file
    if (files.rentalTermsFile) {
      const termsFile = Array.isArray(files.rentalTermsFile) ? files.rentalTermsFile[0] : files.rentalTermsFile;
      rentalTermsFile = await uploadToCloudinary(termsFile, 'rental-terms');
    }
    

    const category = fields.category?.toString();
    const subCategory = fields.subcategory?.toString() || "";

    // ✅ Common fields
    let document: any = {
      title: fields.title?.toString() || "",
      SaleType: fields.SaleType?.toString() || "",
      description: fields.description?.toString() || "",
      termsAccepted: fields.termsAccepted?.toString().toLowerCase() === "true",
      category,
      subcategory: fields.subcategory?.toString() || "",
      price: parseFloat(fields.price as string) || 0,
      priceWeek: parseFloat(fields.priceWeek as string) || 0,
      priceMonth: parseFloat(fields.priceMonth as string) || 0,
      SalePrice: fields.SalePrice?.toString() || "",
      images,
      coverImage,
      location: {
        state: fields.state?.toString() || "",
        stateCode: fields.stateCode?.toString() || "",
        city: fields.city?.toString() || "",
        area: fields.area?.toString() || "",
        coordinates: {
          lat: parseFloat(fields.latitude as string) || 0,
          lng: parseFloat(fields.longitude as string) || 0
        }
      },
      // latitude: parseFloat(fields.latitude as string) || null,
      // longitude: parseFloat(fields.longitude as string) || null,
      pickup: {
        address: fields.pickupAddress?.toString() || "",
        coordinates: {
          lat: parseFloat(fields.pickupLat as string) || null,
          lng: parseFloat(fields.pickupLng as string) || null
        }
      },
      
      instagram: fields.instagram?.toString() || "",
      facebook: fields.facebook?.toString() || "",
      twitter: fields.twitter?.toString() || "",
      ownerEmail: fields.ownerEmail?.toString() || "",
      shopOwnerID: fields.shopOwnerID?.toString() || "",
      rentalType: fields.rentalType?.toString() || "",
      condition: fields.condition?.toString() || "",
      pickupOption: fields.pickupOption?.toString() || "",
      feature: fields.feature?.toString().toLowerCase() === "true",
      rentalTermsFile,
      createdAt: new Date(),
    };

    // ✅ Add category-specific fields
    if (subCategory === "Shops & Offices") {
      Object.assign(document, {
        furnishing: fields.furnishing?.toString() || "",
        listedBy: fields.listedBy?.toString() || "",
        superBuiltupArea: fields.superBuiltupArea?.toString() || "",
        carpetArea: fields.carpetArea?.toString() || "",
        maintenance: fields.maintenance?.toString() || "",
        carParking: fields.carParking?.toString() || "",
        projectName: fields.projectName?.toString() || "",
        ConstructionStatus: fields.ConstructionStatus?.toString() || "",
      });
    }
    if (subCategory === "House & Apartments") {
      Object.assign(document, {
        apartmentType: fields.apartmentType?.toString() || "",
        bhk: fields.bhk?.toString() || "",
        bathrooms: fields.bathrooms?.toString() || "",
        furnishing: fields.furnishing?.toString() || "",
        listedBy: fields.listedBy?.toString() || "",
        superBuiltupArea: fields.superBuiltupArea?.toString() || "",
        carpetArea: fields.carpetArea?.toString() || "",
        maintenance: fields.maintenance?.toString() || "",
        totalFloors: fields.totalFloors?.toString() || "",
        floorNo: fields.floorNo?.toString() || "",
        carParking: fields.carParking?.toString() || "",
        facing: fields.facing?.toString() || "",
        projectName: fields.projectName?.toString() || "",
        bachelorsAllowed: fields.bachelorsAllowed?.toString() || "",
        ConstructionStatus: fields.ConstructionStatus?.toString() || "",
      });
    }

    if (subCategory === "Commercial Properties") {
      Object.assign(document, {
        CommercialSubtype: fields.CommercialSubtype?.toString() || "",
        furnishing: fields.furnishing?.toString() || "",
        carParking: fields.carParking?.toString() || "",
        projectName: fields.projectName?.toString() || "",
        listedBy: fields.listedBy?.toString() || "",
        superBuiltupArea: fields.superBuiltupArea?.toString() || "",
        carpetArea: fields.carpetArea?.toString() || "",
        maintenance: fields.maintenance?.toString() || "",
        ConstructionStatus: fields.ConstructionStatus?.toString() || "",
      });
    }
    if (subCategory === "PG & Guest House") {
      Object.assign(document, {
        pgSubtype: fields.pgSubtype?.toString() || "",
        bachelorsAllowed: fields.bachelorsAllowed?.toString() || "",
        mealsIncluded: fields.mealsIncluded?.toString() || "",
        furnishing: fields.furnishing?.toString() || "",
        carParking: fields.carParking?.toString() || "",
        listedBy: fields.listedBy?.toString() || "",
      });
    }
    if (subCategory === "Land & Plots") {
      Object.assign(document, {
        listedBy: fields.listedBy?.toString() || "",
        landPlotArea: fields.landPlotArea?.toString() || "",
        landLength: fields.landLength?.toString() || "",
        landBreadth: fields.landBreadth?.toString() || "",
        facing: fields.facing?.toString() || "",
        projectName: fields.projectName?.toString() || "",
      });
    }

    if (subCategory === "Accessories") {
      Object.assign(document, {
        AccessoriesType: fields.AccessoriesType?.toString() || "",
      });
    }
    
    if (subCategory === "Tablets") {
      Object.assign(document, {
        TabsType: fields.TabsType?.toString() || "",
      });
    }
    
    if (subCategory === "Mobile Phones" && fields.MobileBrand) {
      Object.assign(document, {
        MobileBrand: fields.MobileBrand.toString(),
        MobileModel: fields.MobileModel.toString(),
      });
    }



    

    // if (category === "PG & Guest House") {
    //   Object.assign(document, {
        
    //   });
    // }

    if (subCategory === "Cars") {
      Object.assign(document, {
        carModel: fields.carModel?.toString() || "",
        carBrand: fields.carBrand?.toString() || "",
        transmission: fields.transmission?.toString() || "",
        OwnersNo: fields.OwnersNo?.toString() || "",
        fuel: fields.fuel?.toString() || "",
        KmDriven: fields.KmDriven?.toString() || "",
        year: fields.year?.toString() || "",
      });
    }

    if (category === "Commercial Vehicles") {
      Object.assign(document, {
        commercialBrand: fields.commercialBrand?.toString() || "",
        commercialModel: fields.commercialModel?.toString() || "",
        transmission: fields.transmission?.toString() || "",
        OwnersNo: fields.OwnersNo?.toString() || "",
        fuel: fields.fuel?.toString() || "",
        KmDriven: fields.KmDriven?.toString() || "",
        year: fields.year?.toString() || "",
      });
    }

    if (category === "Jobs") {
      Object.assign(document, {
        salaryPeriod: fields.salaryPeriod?.toString() || "",
        positionType: fields.positionType?.toString() || "",
        salaryFrom: fields.salaryFrom?.toString() || "",
        salaryTo: fields.salaryTo?.toString() || "",
      });
    }

    if (subCategory === "Motorcycles" || subCategory === "Scooters") {
      Object.assign(document, {
        brand: fields.brand?.toString() || "",
        model: fields.model?.toString() || "",
        year: fields.year?.toString() || "",
        fuel: fields.fuel?.toString() || "",
        OwnersNo: fields.OwnersNo?.toString() || "",
        KmDriven: fields.KmDriven?.toString() || "",
      });
    }

    if (subCategory === "Bicycles") {
      Object.assign(document, {
        BicyclesBrand: fields.BicyclesBrand?.toString() || "",
      });
    }


    if (subCategory === "Spare Parts") {
      Object.assign(document, {
        SpareParts: fields.SpareParts?.toString() || "",
      });
    }

    try {
      await client.connect();
      const db = client.db("test");
      const productsCollection = db.collection("products");
      const shopOwnersCollection = db.collection("shopowners");
    
      const shopOwnerID = document.shopOwnerID;
      const category = fields.category?.toString();
      const rules = categoryRules[category];

      if (!category || !rules) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing category"
        });
      }

      // ✅ Fetch shop owner record
      const existingShopOwner = await shopOwnersCollection.findOne({ shopOwnerID });

      // ✅ Count unpaid products in this category
      const unpaidCount = await productsCollection.countDocuments({
        shopOwnerID,
        category,
        isPaid: false
      });

      // ✅ Check if user has paid for this category
      const hasPaidForCategory = existingShopOwner?.paidCategories?.includes(category);

      // ✅ Enforce category-specific limit
      if (unpaidCount >= rules.freeLimit && !hasPaidForCategory) {
        return res.status(403).json({
          success: false,
          message: `Product limit reached for category "${category}". Please pay ₹${rules.pricePerExtra} to post more.`,
          redirectUrl: `/subscription?category=${encodeURIComponent(category)}`
        });
      }

      // ✅ Mark product as paid if category is unlocked
      const isPaid = hasPaidForCategory === true;
      document.isPaid = isPaid;

      if (isPaid) {
        const expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 2 months
        document.feature = true;
        document.featuredUntil = expiryDate;
        document.expiresAt = expiryDate;
      }
    
      // Insert new product
      const result = await productsCollection.insertOne(document);
    
      return res.status(200).json({ success: true, insertedId: result.insertedId });
    } catch (error) {
      console.error("MongoDB Insert Error:", error);
      return res.status(500).json({ success: false, message: "MongoDB Insert Failed" });
    } finally {
      await client.close();
    }
  });
}
