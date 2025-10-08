// /pages/api/feature-product.ts
// /pages/api/featureProduct.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "@/pages/api/auth/[...nextauth]";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(403).json({ error: "Not authenticated" });
  }

  const { shopOwnerID } = req.body;

  if (!shopOwnerID) {
    return res.status(400).json({ error: "shopOwnerID is required" });
  }

  try {
    await dbConnect();

    // Update all products by this shopOwnerID to feature = true (or limit it to one product)
    await Product.updateMany(
      { shopOwnerID },
      {
        $set: {
          feature: true,
          featuredUntil: new Date(Date.now() + 10 * 1000), // 10 seconds feature
        },
      }
    );

    return res.status(200).json({ message: "Shop featured successfully." });
  } catch (error) {
    console.error("Error in featureProduct API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}