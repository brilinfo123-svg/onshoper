import dbConnect from '@/lib/mongodb';
import Review from "../../models/Review";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { comment, rating, ShopKeeperID, VisitedUserShopID } = req.body;

      if (!comment || !rating || !ShopKeeperID || !VisitedUserShopID) {
        return res.status(400).json({ message: "All fields are required!" });
      }

      // Ensure rating is a valid number
      const numericRating = parseFloat(rating);
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: "Invalid rating value!" });
      }

      const review = new Review({ comment, rating: numericRating, ShopKeeperID, VisitedUserShopID });
      await review.save();

      return res.status(201).json({ message: "Review submitted successfully!", review });
    } catch (error) {
      console.error("POST Error:", error);
      return res.status(500).json({ message: "Error saving review", error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const { ShopKeeperID } = req.query;

      if (!ShopKeeperID) {
        return res.status(400).json({ message: "ShopKeeperID is required!" });
      }

      console.log("Fetching reviews for ShopKeeperID:", ShopKeeperID);

      const reviews = await Review.find({ ShopKeeperID });

      // Ensure all ratings are numbers before calculating average
      const totalRatings = reviews.reduce((acc, review) => acc + (parseFloat(review.rating) || 0), 0);
      const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : "0.0";

      return res.status(200).json({ reviews, averageRating: parseFloat(averageRating) }); // Return average as number
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
