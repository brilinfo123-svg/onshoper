// scripts/generate-sitemap.js
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

// MongoDB connection string (replace with your actual URI)
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "test"; // apna DB name daalo
const COLLECTION_NAME = "products"; // jisme products store hote hain

async function generateSitemap() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const product = await db.collection(COLLECTION_NAME).find({}, { projection: { _id: 1 } }).toArray();

    // Static URLs
    const staticUrls = [
      { loc: "https://onshoper.com/", changefreq: "daily", priority: 1.0 },
      { loc: "https://onshoper.com/ProductForm", changefreq: "weekly", priority: 0.8 },
      { loc: "https://onshoper.com/subscription", changefreq: "monthly", priority: 0.7 },
      { loc: "https://onshoper.com/filter", changefreq: "daily", priority: 0.9 },
      { loc: "https://onshoper.com/privacy-policy", changefreq: "yearly", priority: 0.6 },
      { loc: "https://onshoper.com/terms-of-service", changefreq: "yearly", priority: 0.6 },
    ];

    // Dynamic product URLs from DB
    const productUrls = product.map((p) => ({
      loc: `https://onshoper.com/product/${p._id}`,
      changefreq: "weekly",
      priority: 0.8,
    }));

    const urls = [...staticUrls, ...productUrls];

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

    // Write to public/sitemap.xml
    const filePath = path.join(process.cwd(), "public", "sitemap.xml");
    fs.writeFileSync(filePath, sitemap, "utf8");

    console.log("✅ Sitemap generated at:", filePath);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
  } finally {
    await client.close();
  }
}

generateSitemap();
