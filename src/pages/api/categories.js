import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    // Check if we need to include subcategories
    const includeSubcategories = req.query.includeSubcategories === 'true';
    console.log("Include subcategories:", includeSubcategories);

    // Get all products
    const products = await Product.find({});
    console.log("Total products found:", products.length);
    
    // Category counts with subcategories
    const categoryData = products.reduce((acc, product) => {
      if (product.category) {
        if (!acc[product.category]) {
          acc[product.category] = {
            count: 0,
            subcategories: {}
          };
        }
        
        acc[product.category].count += 1;
        
        // If product has subcategory, count it too
        if (product.subcategory && includeSubcategories) {
          acc[product.category].subcategories[product.subcategory] = 
            (acc[product.category].subcategories[product.subcategory] || 0) + 1;
        }
      }
      return acc;
    }, {});

    console.log("Category data:", categoryData);

    // Format the response
    const categories = Object.keys(categoryData).map((category, index) => {
      const categoryObj = {
        _id: (index + 1).toString(),
        name: category,
        productCount: categoryData[category].count
      };
      
      // Add subcategories if requested
      if (includeSubcategories) {
        const subcategories = Object.keys(categoryData[category].subcategories).map((subcat, subIndex) => ({
          _id: `${index + 1}-${subIndex + 1}`,
          name: subcat,
          productCount: categoryData[category].subcategories[subcat]
        }));
        
        categoryObj.subcategories = subcategories;
      }
      
      return categoryObj;
    });

    console.log("Final categories:", categories);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
}