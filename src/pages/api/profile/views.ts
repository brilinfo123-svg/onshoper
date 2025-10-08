// pages/api/profile/views.ts

import { NextApiRequest, NextApiResponse } from 'next';

let viewCounts: Record<string, number> = {}; // This is a placeholder, use a database in real-world apps.

const getProfileViews = (profileId: string) => {
  return viewCounts[profileId] || 0;
};

const incrementProfileViews = (profileId: string) => {
  if (!viewCounts[profileId]) {
    viewCounts[profileId] = 0;
  }
  viewCounts[profileId] += 1;
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { profileId } = req.query;

  if (req.method === 'GET') {
    // Get the current view count for the profile
    const views = getProfileViews(profileId as string);
    return res.status(200).json({ views });
  }

  if (req.method === 'POST') {
    // Increment the view count for the profile
    incrementProfileViews(profileId as string);
    return res.status(200).json({ message: 'View count updated successfully.' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
};
