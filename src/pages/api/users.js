// /pages/api/users.js
import connectToDatabase from '@/lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      // Extract user data from the request body
      const { name, email, password } = req.body;

      // Check if all required fields are provided
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Create a new user document
      const newUser = new User({
        name,
        email,
        password, // Add password field
      });

      // Save the new user document to the database
      await newUser.save();

      // Return a success response
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      // Log error for debugging
      console.error(error);

      // Return an error response with the error message
      res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch all users from the database
      const users = await User.find();

      // Return the users
      res.status(200).json(users);
    } catch (error) {
      // Log error for debugging
      console.error(error);

      // Return an error response
      res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  } else {
    // If the method is not allowed, return a 405 error
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
