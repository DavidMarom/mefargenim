import clientPromise from './mongo';

const DB_NAME = 'main';
const COLLECTION_NAME = 'likes';

/**
 * Check if a user has liked a business
 * @param {string} userId - User's Firebase UID
 * @param {string} businessId - Business MongoDB _id
 * @returns {Promise<boolean>} - True if user has liked the business
 */
export async function hasUserLiked(userId, businessId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const like = await collection.findOne({ 
      userId: userId, 
      businessId: businessId.toString() 
    });
    
    return !!like;
  } catch (error) {
    console.error('Error checking like:', error);
    throw error;
  }
}

/**
 * Toggle like for a business (like if not liked, unlike if liked)
 * @param {string} userId - User's Firebase UID
 * @param {string} businessId - Business MongoDB _id
 * @returns {Promise<Object>} - Result with liked status
 */
export async function toggleLike(userId, businessId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const businessIdStr = businessId.toString();
    const existingLike = await collection.findOne({ 
      userId: userId, 
      businessId: businessIdStr 
    });
    
    if (existingLike) {
      // Unlike - remove the like
      await collection.deleteOne({ 
        userId: userId, 
        businessId: businessIdStr 
      });
      return { liked: false, action: 'unliked' };
    } else {
      // Like - add the like
      await collection.insertOne({
        userId: userId,
        businessId: businessIdStr,
        createdAt: new Date(),
      });
      return { liked: true, action: 'liked' };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Get all likes for a specific business
 * @param {string} businessId - Business MongoDB _id
 * @returns {Promise<number>} - Count of likes
 */
export async function getLikeCount(businessId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const count = await collection.countDocuments({ 
      businessId: businessId.toString() 
    });
    
    return count;
  } catch (error) {
    console.error('Error getting like count:', error);
    throw error;
  }
}

/**
 * Get all businesses a user has liked
 * @param {string} userId - User's Firebase UID
 * @returns {Promise<Array>} - Array of business IDs the user has liked
 */
export async function getUserLikedBusinesses(userId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const likes = await collection.find({ userId: userId }).toArray();
    return likes.map(like => like.businessId);
  } catch (error) {
    console.error('Error getting user liked businesses:', error);
    throw error;
  }
}
