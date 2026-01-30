import { ObjectId } from 'mongodb';
import clientPromise from './mongo';

const DB_NAME = 'main';
const COLLECTION_NAME = 'biz';

/**
 * Get all documents from the Biz collection
 * @returns {Promise<Array>} - Array of all Biz documents
 */
export async function getAllBizDocuments() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const documents = await collection.find({}).toArray();
    return documents;
  } catch (error) {
    console.error('Error fetching Biz documents:', error);
    throw error;
  }
}

/**
 * Get the most recent businesses (sorted by createdAt, newest first)
 * @param {number} limit - Number of businesses to return (default: 3)
 * @returns {Promise<Array>} - Array of the most recent business documents
 */
export async function getRecentBusinesses(limit = 3) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const documents = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  } catch (error) {
    console.error('Error fetching recent businesses:', error);
    throw error;
  }
}

/**
 * Get a business by MongoDB _id
 * @param {string} businessId - Business MongoDB _id
 * @returns {Promise<Object|null>} - Business document if found, null otherwise
 */
export async function getBusinessById(businessId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Validate ObjectId format
    if (!ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID format');
    }
    
    const business = await collection.findOne({ _id: new ObjectId(businessId) });
    return business;
  } catch (error) {
    console.error('Error fetching business by id:', error);
    throw error;
  }
}

/**
 * Get a business by userId
 * @param {string} userId - User's Firebase UID
 * @returns {Promise<Object|null>} - Business document if found, null otherwise
 */
export async function getBusinessByUserId(userId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const business = await collection.findOne({ userId: userId });
    return business;
  } catch (error) {
    console.error('Error fetching business by userId:', error);
    throw error;
  }
}

/**
 * Create a new business for a user
 * @param {string} userId - User's Firebase UID
 * @param {Object} businessData - Business data to save
 * @returns {Promise<Object>} - Created business document
 */
export async function createBusiness(userId, businessData) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const businessDocument = {
      ...businessData,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(businessDocument);
    
    return {
      ...businessDocument,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error('Error creating business:', error);
    throw error;
  }
}

/**
 * Create a new business without userId (for admin use)
 * MongoDB will automatically generate the _id
 * @param {Object} businessData - Business data to save
 * @returns {Promise<Object>} - Created business document
 */
export async function createBusinessAdmin(businessData) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const businessDocument = {
      ...businessData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(businessDocument);
    
    return {
      ...businessDocument,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error('Error creating business (admin):', error);
    throw error;
  }
}

/**
 * Update a business by userId
 * @param {string} userId - User's Firebase UID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Update result
 */
export async function updateBusinessByUserId(userId, updateData) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.updateOne(
      { userId: userId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error updating business:', error);
    throw error;
  }
}

/**
 * Delete a business by userId
 * @param {string} userId - User's Firebase UID
 * @returns {Promise<Object>} - Delete result
 */
export async function deleteBusinessByUserId(userId) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ userId: userId });
    
    return result;
  } catch (error) {
    console.error('Error deleting business:', error);
    throw error;
  }
}
