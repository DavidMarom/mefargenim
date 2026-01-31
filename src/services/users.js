import clientPromise from './mongo';

const DB_NAME = 'main';
const COLLECTION_NAME = 'users';

/**
 * Check if a user exists in MongoDB by email
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} - User document if found, null otherwise
 */
export async function findUserByEmail(email) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const user = await collection.findOne({ email: email });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

/**
 * Create a new user in MongoDB
 * @param {Object} userData - User data to save
 * @returns {Promise<Object>} - Created user document
 */
export async function createUser(userData) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const userDocument = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(userDocument);
    
    // Return the created user document
    return {
      ...userDocument,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user in MongoDB
 * @param {string} email - User's email address
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Update result
 */
export async function updateUser(email, updateData) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.updateOne(
      { email: email },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get all users from MongoDB
 * @returns {Promise<Array>} - Array of all user documents
 */
export async function getAllUsers() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const users = await collection.find({}).toArray();
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}
