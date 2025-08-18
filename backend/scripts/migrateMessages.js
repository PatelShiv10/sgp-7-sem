const mongoose = require('mongoose');
const Message = require('../models/Message');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lawmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateMessages() {
  try {
    console.log('🔧 Starting message migration...');
    
    // First, let's see what messages we have
    const allMessages = await Message.find({});
    console.log(`📨 Total messages in database: ${allMessages.length}`);
    
    // Check which messages don't have ephemeralPublicKey
    const messagesWithoutEphemeralKey = await Message.find({
      $or: [
        { ephemeralPublicKey: { $exists: false } },
        { ephemeralPublicKey: null },
        { ephemeralPublicKey: '' },
        { ephemeralPublicKey: undefined }
      ]
    });
    
    console.log(`📨 Found ${messagesWithoutEphemeralKey.length} messages without ephemeral keys`);
    
    if (messagesWithoutEphemeralKey.length === 0) {
      console.log('✅ All messages already have ephemeral keys');
      return;
    }
    
    // Show some sample messages for debugging
    console.log('🔍 Sample messages without ephemeral keys:');
    messagesWithoutEphemeralKey.slice(0, 3).forEach((msg, index) => {
      console.log(`  Message ${index + 1}:`, {
        id: msg._id,
        hasEphemeralKey: !!msg.ephemeralPublicKey,
        ephemeralKeyValue: msg.ephemeralPublicKey,
        keys: Object.keys(msg.toObject())
      });
    });
    
    // For each message without ephemeral key, we'll mark it as legacy
    // and add a flag to indicate it cannot be decrypted with the new system
    let updatedCount = 0;
    for (const message of messagesWithoutEphemeralKey) {
      try {
        // Update the message to mark it as legacy
        await Message.updateOne(
          { _id: message._id },
          {
            $set: {
              ephemeralPublicKey: 'LEGACY_MESSAGE_NO_EPHEMERAL_KEY',
              'metadata.isLegacyMessage': true,
              'metadata.migrationDate': new Date().toISOString()
            }
          }
        );
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update message ${message._id}:`, error);
      }
    }
    
    console.log('✅ Migration completed successfully');
    console.log(`📝 Updated ${updatedCount} legacy messages`);
    
    // Verify the migration
    const remainingMessagesWithoutKey = await Message.find({
      $or: [
        { ephemeralPublicKey: { $exists: false } },
        { ephemeralPublicKey: null },
        { ephemeralPublicKey: '' },
        { ephemeralPublicKey: undefined }
      ]
    });
    
    console.log(`🔍 Verification: ${remainingMessagesWithoutKey.length} messages still without ephemeral keys`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateMessages();
