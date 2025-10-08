// /pages/api/posts.js
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const posts = await Post.find({});
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else if (req.method === 'POST') {
    const { title, content } = req.body;

    try {
      const newPost = new Post({ title, content });
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create a post' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
