// scripts/generate-sitemap.js
import fs from "fs";
import path from "path";

async function generateSitemap() {
  try {
    // Static URLs
    const urls = [
      {
        loc: "https://onshoper.com/",
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: "https://onshoper.com/ProductForm",
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: "https://onshoper.com/install",
        changefreq: "monthly",
        priority: 0.9,
      },
      {
        loc: "https://onshoper.com/blog",
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: "https://onshoper.com/contact-us",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: "https://onshoper.com/login",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: "https://onshoper.com/privacy-policy",
        changefreq: "yearly",
        priority: 0.6,
      },
      {
        loc: "https://onshoper.com/terms-and-conditions",
        changefreq: "yearly",
        priority: 0.6,
      },
    ];

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

    // Write sitemap.xml
    const filePath = path.join(process.cwd(), "public", "sitemap.xml");
    fs.writeFileSync(filePath, sitemap, "utf8");

    console.log("✅ Sitemap generated successfully!");
    console.log("📄 File:", filePath);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
  }
}

generateSitemap();