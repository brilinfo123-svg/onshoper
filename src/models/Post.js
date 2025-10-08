// /models/Post.js
import mongoose from 'mongoose';

// Define the schema for the Post collection
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create and export the Post model
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
