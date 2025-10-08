import mongoose from 'mongoose';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { lat, lng, distance = 10000 } = req.query; // Default 10KM

  console.log('API Called with params:', { lat, lng, distance });

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  // Validate coordinates
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  
  if (isNaN(latNum) || isNaN(lngNum)) {
    return res.status(400).json({ message: 'Invalid coordinates' });
  }

  try {
    // MongoDB connection check
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
    }

    // Check if geospatial index exists
    const indexes = await Product.collection.indexes();
    const hasGeoIndex = indexes.some(index => 
      index.key && ('location.coordinates' in index.key || 'pickup.coordinates' in index.key)
    );
    
    console.log('Has geospatial index:', hasGeoIndex);
    if (!hasGeoIndex) {
      console.log('Creating geospatial indexes...');
      await Product.collection.createIndex({ "location.coordinates": "2dsphere" });
      await Product.collection.createIndex({ "pickup.coordinates": "2dsphere" });
      console.log('Geospatial indexes created');
    }

    // Create aggregation pipeline - FIXED VERSION
    const pipeline = [
      {
        $addFields: {
          // Use pickup coordinates if available, otherwise use location coordinates
          effectiveCoords: {
            $cond: {
              if: {
                $and: [
                  { $ifNull: ["$pickup.coordinates.lat", false] },
                  { $ifNull: ["$pickup.coordinates.lng", false] }
                ]
              },
              then: {
                type: "Point",
                coordinates: ["$pickup.coordinates.lng", "$pickup.coordinates.lat"]
              },
              else: {
                type: "Point", 
                coordinates: ["$location.coordinates.lng", "$location.coordinates.lat"]
              }
            }
          }
        }
      },
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lngNum, latNum]
          },
          distanceField: "distance",
          maxDistance: parseInt(distance),
          spherical: true,
          query: { 
            // Only include products that have coordinates
            $or: [
              { "location.coordinates.lat": { $exists: true } },
              { "pickup.coordinates.lat": { $exists: true } }
            ]
          },
          key: "effectiveCoords" // Use our computed field
        }
      },
      { 
        $match: {
          // Ensure we only get products within the distance
          distance: { $lte: parseInt(distance) }
        }
      },
      { $limit: 100 }
    ];

    console.log('Executing aggregation pipeline');
    const products = await Product.aggregate(pipeline);
    console.log(`Found ${products.length} products within ${distance/1000}km`);

    // Log first few products for debugging
    if (products.length > 0) {
      console.log('Sample products:', products.slice(0, 3).map(p => ({
        title: p.title,
        distance: p.distance,
        location: p.location,
        pickup: p.pickup
      })));
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching nearby products:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}