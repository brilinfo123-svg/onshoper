export default async function handler(req, res) {
    const { userId } = req.body;
  
    const favorites = await Favorite.find({ userId }).select("productId");
  
    res.status(200).json({
      favorites: favorites.map(f => f.productId),
    });
  }
  