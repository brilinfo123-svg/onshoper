import { useState } from "react";
import styles from "@/styles/blog.module.scss";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import Image from "next/image";
import SEO from "next/head";

export default function BlogPage() {
  const [search, setSearch] = useState("");

  // Filter blogs by title, category, or excerpt
  const filteredBlogs = blogs.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.category.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SEO>
        <title>OnShoper Blogs – Tips, Guides & Safety Advice</title>
        <meta
          name="description"
          content="Explore OnShoper Blogs for buying, selling, and renting tips, marketplace guides, and safety advice. Stay updated with the latest insights to make smarter deals."
        />
        <link rel="canonical" href="https://onshoper.com/blog" />
        <meta name="robots" content="index, follow" />
      </SEO>
   
      <div className={styles.container}>
      <div className={styles.headingWrper}>
        <h1>Onshoper Blogs</h1>
        <p>Buying, selling & renting tips • Marketplace guides • Safety advice.</p>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
            <img src="/icons/search.svg" className={styles.searchIcon} alt="search" />
            <input
                type="text"
                placeholder="Search blogs..."
                className={styles.searchBar}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>

      </div>

      <div className={styles.grid}>
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((post) => (
            <div key={post.slug} className={styles.card}>
              <Image
                src={`/icons/${post.icon}`}
                alt={post.category}
                className={styles.categoryIcon}
                width={50}
                height={50}
              />

              <p className={styles.category}>{post.category}</p>

              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <p>{post.excerpt}</p>

              <small>{post.date}</small>

              <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                Read more
              </Link>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No blogs found.</p>
        )}
      </div>
    </div>
    </>
  );
}
