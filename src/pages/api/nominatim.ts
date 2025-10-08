export default async function handler(req, res) {
    const { q } = req.query;
  
    if (!q) return res.status(400).json({ error: 'Query is required' });
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=IN&q=${encodeURIComponent(q)}`,
        {
          headers: {
            'User-Agent': 'your-app-name', // Update this
            Referer: 'https://yourdomain.com', // Optional
          },
        }
      );
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Nominatim fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch from Nominatim' });
    }
  }
  