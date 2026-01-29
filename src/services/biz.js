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
