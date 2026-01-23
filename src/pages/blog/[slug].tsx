import styles from "@/styles/blogSlug.module.scss";
import { useRouter } from "next/router";
import { blogs } from "@/data/blogs";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

export default function BlogPost() {
  const router = useRouter();
  const post = blogs.find((b) => b.slug === router.query.slug);

  if (!post) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      
      {/* CATEGORY ICON + NAME */}
      <div className={styles.categoryRow}>
        <Image
          src={`/icons/${post.icon}`}
          alt={post.category}
          className={styles.categoryIcon}
          width={100}
          height={100}
        />
        <p className={styles.category}>{post.category}</p>
      </div>

      <h1>{post.title}</h1>
      <small>{post.date}</small>

      <div className={styles.content}>
        {/* <ReactMarkdown>{post.content}</ReactMarkdown> */}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }}/>

      </div>

      <div className={styles.cta}>
        <h3>Post Your Free Ad on Onshoper</h3>
        <a href="/ProductForm" className={styles.btn}>Post Free Ad</a>
      </div>
    </div>
  );
}
