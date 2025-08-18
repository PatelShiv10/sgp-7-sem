const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const UserKey = require('../models/UserKey');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lawmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestMessages() {
  try {
    console.log('🧪 Creating test messages...');
    
    // First, let's create some test users if they don't exist
    let user1 = await User.findOne({ email: 'testuser1@example.com' });
    let user2 = await User.findOne({ email: 'testuser2@example.com' });
    
    if (!user1) {
      user1 = new User({
        firstName: 'Test',
        lastName: 'User1',
        email: 'testuser1@example.com',
        password: 'hashedpassword123',
        phone: '1234567890',
        agree: true,
        role: 'user'
      });
      await user1.save();
      console.log('✅ Created test user 1');
    }
    
    if (!user2) {
      user2 = new User({
        firstName: 'Test',
        lastName: 'User2',
        email: 'testuser2@example.com',
        password: 'hashedpassword123',
        phone: '0987654321',
        agree: true,
        role: 'lawyer'
      });
      await user2.save();
      console.log('✅ Created test user 2');
    }
    
    // Create test messages
    const chatId = `chat_${user1._id}_${user2._id}`;
    
    // Create a message with proper ephemeral key
    const testMessage1 = new Message({
      chatId: chatId,
      senderId: user1._id,
      receiverId: user2._id,
      encryptedContent: 'test-encrypted-content-1',
      nonce: 'test-nonce-1',
      ephemeralPublicKey: 'test-ephemeral-key-1',
      senderPublicKey: 'test-sender-public-key-1',
      messageType: 'text',
      metadata: {},
      isRead: false
    });
    
    await testMessage1.save();
    console.log('✅ Created test message 1 with ephemeral key');
    
    // Create a message without ephemeral key (legacy)
    const testMessage2 = new Message({
      chatId: chatId,
      senderId: user2._id,
      receiverId: user1._id,
      encryptedContent: 'test-encrypted-content-2',
      nonce: 'test-nonce-2',
      ephemeralPublicKey: 'LEGACY_MESSAGE_NO_EPHEMERAL_KEY',
      senderPublicKey: 'test-sender-public-key-2',
      messageType: 'text',
      metadata: {
        isLegacyMessage: true,
        migrationDate: new Date().toISOString()
      },
      isRead: false
    });
    
    await testMessage2.save();
    console.log('✅ Created test message 2 (legacy)');
    
    // Create another message with proper ephemeral key
    const testMessage3 = new Message({
      chatId: chatId,
      senderId: user1._id,
      receiverId: user2._id,
      encryptedContent: 'test-encrypted-content-3',
      nonce: 'test-nonce-3',
      ephemeralPublicKey: 'test-ephemeral-key-3',
      senderPublicKey: 'test-sender-public-key-3',
      messageType: 'text',
      metadata: {},
      isRead: false
    });
    
    await testMessage3.save();
    console.log('✅ Created test message 3 with ephemeral key');
    
    console.log('✅ Test messages created successfully');
    console.log(`📨 Total messages in database: ${await Message.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error creating test messages:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run test
createTestMessages();
