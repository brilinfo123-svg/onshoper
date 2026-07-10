import connectToDatabase from "../../../lib/mongodb";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const mongooseInstance = await connectToDatabase();

    const db = mongooseInstance.connection.db;

    const { id } = req.query;

    await db.collection("products").updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          status: "active",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Product republished successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}