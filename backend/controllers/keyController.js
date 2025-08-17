const UserKey = require('../models/UserKey');
const User = require('../models/User');

/**
 * Store a user's public key
 * POST /api/keys
 */
exports.storePublicKey = async (req, res) => {
  try {
    const { publicKey, userId } = req.body;
    const requestingUserId = req.user.id; // From JWT token

    // Validate input
    if (!publicKey || !userId) {
      return res.status(400).json({ 
        message: 'Public key and user ID are required' 
      });
    }

    // Ensure the requesting user can only store their own key
    if (requestingUserId !== userId) {
      return res.status(403).json({ 
        message: 'You can only store your own public key' 
      });
    }

    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if a key already exists for this user
    let userKey = await UserKey.findOne({ userId });

    if (userKey) {
      // Update existing key
      userKey.publicKey = publicKey;
      userKey.updatedAt = new Date();
      await userKey.save();
    } else {
      // Create new key record
      userKey = new UserKey({
        userId,
        publicKey
      });
      await userKey.save();
    }

    res.status(200).json({
      message: 'Public key stored successfully',
      userId: userKey.userId,
      createdAt: userKey.createdAt,
      updatedAt: userKey.updatedAt
    });

  } catch (error) {
    console.error('Error storing public key:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get a user's public key
 * GET /api/keys/:userId
 */
exports.getPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    // Find the user's public key
    const userKey = await UserKey.findOne({ userId });
    
    if (!userKey) {
      return res.status(404).json({ 
        message: 'Public key not found for this user' 
      });
    }

    res.status(200).json({
      userId: userKey.userId,
      publicKey: userKey.publicKey,
      createdAt: userKey.createdAt,
      updatedAt: userKey.updatedAt
    });

  } catch (error) {
    console.error('Error retrieving public key:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get multiple users' public keys
 * POST /api/keys/batch
 */
exports.getPublicKeysBatch = async (req, res) => {
  try {
    const { userIds } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        message: 'User IDs array is required' 
      });
    }

    // Find public keys for all requested users
    const userKeys = await UserKey.find({ 
      userId: { $in: userIds } 
    });

    // Create a map of userId to public key
    const keysMap = {};
    userKeys.forEach(key => {
      keysMap[key.userId.toString()] = {
        publicKey: key.publicKey,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt
      };
    });

    res.status(200).json({
      keys: keysMap
    });

  } catch (error) {
    console.error('Error retrieving public keys batch:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

/**
 * Delete a user's public key
 * DELETE /api/keys/:userId
 */
exports.deletePublicKey = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id; // From JWT token

    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    // Ensure the requesting user can only delete their own key
    if (requestingUserId !== userId) {
      return res.status(403).json({ 
        message: 'You can only delete your own public key' 
      });
    }

    // Find and delete the user's public key
    const userKey = await UserKey.findOneAndDelete({ userId });
    
    if (!userKey) {
      return res.status(404).json({ 
        message: 'Public key not found for this user' 
      });
    }

    res.status(200).json({
      message: 'Public key deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting public key:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};
