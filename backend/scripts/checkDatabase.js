const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const UserKey = require('../models/UserKey');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lawmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    // Check all collections
    const messages = await Message.find({});
    const users = await User.find({});
    const userKeys = await UserKey.find({});
    
    console.log(`📨 Messages: ${messages.length}`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`🔑 User Keys: ${userKeys.length}`);
    
    if (messages.length > 0) {
      console.log('\n📝 Sample messages:');
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`  Message ${index + 1}:`, {
          id: msg._id,
          chatId: msg.chatId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          hasEphemeralKey: !!msg.ephemeralPublicKey,
          ephemeralKeyValue: msg.ephemeralPublicKey,
          hasEncryptedContent: !!msg.encryptedContent,
          hasNonce: !!msg.nonce,
          createdAt: msg.createdAt,
          keys: Object.keys(msg.toObject())
        });
      });
    }
    
    if (users.length > 0) {
      console.log('\n👤 Sample users:');
      users.slice(0, 3).forEach((user, index) => {
        console.log(`  User ${index + 1}:`, {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
      });
    }
    
    if (userKeys.length > 0) {
      console.log('\n🔑 Sample user keys:');
      userKeys.slice(0, 3).forEach((key, index) => {
        console.log(`  Key ${index + 1}:`, {
          userId: key.userId,
          hasPublicKey: !!key.publicKey,
          publicKeyLength: key.publicKey ? key.publicKey.length : 0,
          createdAt: key.createdAt
        });
      });
    }
    
    // Check if there are any messages without ephemeral keys
    const messagesWithoutEphemeralKey = await Message.find({
      $or: [
        { ephemeralPublicKey: { $exists: false } },
        { ephemeralPublicKey: null },
        { ephemeralPublicKey: '' },
        { ephemeralPublicKey: undefined }
      ]
    });
    
    console.log(`\n⚠️ Messages without ephemeral keys: ${messagesWithoutEphemeralKey.length}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run check
checkDatabase();
