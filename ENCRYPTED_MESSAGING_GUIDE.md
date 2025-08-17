# Encrypted Messaging Implementation Guide

This guide explains how to use the encrypted messaging functionality in your LawMate application.

## Overview

The encrypted messaging system provides end-to-end encryption for messages using TweetNaCl cryptography. Messages are encrypted on the client-side before being sent to the server, ensuring that only the intended recipient can decrypt them.

## Core Components

### 1. Backend API Endpoints

#### Fetch Encrypted Messages
```http
GET /api/messages/:chatId
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "message_id",
        "chatId": "chat_id",
        "senderId": {
          "_id": "sender_user_id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "receiverId": {
          "_id": "receiver_user_id",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "encryptedContent": "base64_encrypted_content",
        "nonce": "base64_nonce",
        "senderPublicKey": "base64_sender_public_key",
        "messageType": "text",
        "metadata": {},
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

#### Send Encrypted Message
```http
POST /api/messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "chatId": "chat_id",
  "receiverId": "receiver_user_id",
  "encryptedContent": "base64_encrypted_content",
  "nonce": "base64_nonce",
  "messageType": "text",
  "metadata": {}
}
```

### 2. Frontend Utilities

#### Message Service (`frontend/src/utils/messageService.ts`)

```typescript
// Fetch messages for a specific chat
const result = await getChatMessages(chatId, limit, offset);

// Send an encrypted message
const sentMessage = await sendEncryptedMessage(
  message,
  receiverId,
  senderPrivateKey,
  chatId,
  messageType,
  metadata
);

// Decrypt a received message
const decryptedContent = decryptReceivedMessage(
  encryptedContent,
  nonce,
  senderPublicKey,
  recipientPrivateKey
);
```

#### React Hook (`frontend/src/hooks/useEncryptedMessages.ts`)

```typescript
const {
  messages,
  isLoading,
  loadChatMessages,
  getDecryptedMessages,
  sendMessage
} = useEncryptedMessages();

// Load messages for a chat
await loadChatMessages(chatId);

// Get decrypted messages for display
const decryptedMessages = getDecryptedMessages();

// Send a message
await sendMessage(message, receiverId);
```

## Usage Examples

### 1. Fetch and Display Encrypted Messages

```typescript
import { useEncryptedMessages } from '@/hooks/useEncryptedMessages';

const MyComponent = () => {
  const { messages, isLoading, loadChatMessages, getDecryptedMessages } = useEncryptedMessages();
  const [chatId, setChatId] = useState('');

  const handleFetchMessages = async () => {
    await loadChatMessages(chatId);
  };

  const decryptedMessages = getDecryptedMessages();

  return (
    <div>
      <input 
        value={chatId} 
        onChange={(e) => setChatId(e.target.value)} 
        placeholder="Enter chat ID"
      />
      <button onClick={handleFetchMessages} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Messages'}
      </button>

      <div>
        {decryptedMessages.map((message) => (
          <div key={message.id}>
            <p><strong>From:</strong> {message.senderId.firstName} {message.senderId.lastName}</p>
            <p><strong>Message:</strong> {message.decryptedContent}</p>
            <p><strong>Time:</strong> {new Date(message.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. Send an Encrypted Message

```typescript
import { useEncryptedMessages } from '@/hooks/useEncryptedMessages';

const SendMessageComponent = () => {
  const { sendMessage } = useEncryptedMessages();
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const handleSend = async () => {
    try {
      await sendMessage(message, receiverId);
      setMessage('');
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  };

  return (
    <div>
      <input 
        value={receiverId} 
        onChange={(e) => setReceiverId(e.target.value)} 
        placeholder="Receiver User ID"
      />
      <textarea 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Your message"
      />
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};
```

### 3. Direct API Usage

```typescript
import { getChatMessages, decryptReceivedMessage } from '@/utils/messageService';

const fetchAndDecryptMessages = async (chatId: string) => {
  try {
    // 1. Fetch encrypted messages from API
    const result = await getChatMessages(chatId);
    
    // 2. Decrypt each message
    const decryptedMessages = result.messages.map(message => ({
      ...message,
      decryptedContent: decryptReceivedMessage(
        message.encryptedContent,
        message.nonce,
        message.senderPublicKey,
        getPrivateKey() // Your private key from localStorage
      )
    }));

    return decryptedMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};
```

## Security Features

### 1. End-to-End Encryption
- Messages are encrypted using the recipient's public key
- Only the recipient can decrypt messages using their private key
- Server cannot read the actual message content

### 2. Key Management
- Private keys are stored locally in browser localStorage
- Public keys are stored on the server for distribution
- Keys are automatically generated on user login

### 3. Authentication
- All API endpoints require JWT authentication
- Users can only access messages they're involved in (sender or receiver)

## Error Handling

### Common Errors and Solutions

1. **"No public key found for receiver"**
   - Ensure the receiver has generated crypto keys
   - Check if the receiver ID is correct

2. **"Private key not found"**
   - User needs to generate crypto keys first
   - Keys are automatically generated on login

3. **"Failed to decrypt message"**
   - Verify the sender's public key is correct
   - Check if the message was encrypted properly

4. **"Chat not found"**
   - Ensure the chat ID is valid
   - Check if the user has access to this chat

## Testing

### 1. Test with Two Users

1. **Login with User A** and generate crypto keys
2. **Login with User B** and generate crypto keys
3. **Send a message from User A to User B**
4. **Fetch messages as User B** to see the decrypted content

### 2. Verify Encryption

- Check that the server only stores encrypted content
- Verify that messages are automatically decrypted on the client
- Confirm that the server cannot read the actual message content

## Integration with Existing Chat System

To integrate encrypted messaging with your existing chat system:

1. **Replace plain text messages** with encrypted messages
2. **Use the `sendMessage` function** from `useEncryptedMessages` hook
3. **Display decrypted messages** using `getDecryptedMessages()`
4. **Handle chat creation** using `generateChatId()` utility

## Performance Considerations

1. **Message Decryption** happens on the client-side
2. **Key Caching** is implemented for faster peer key retrieval
3. **Pagination** is supported for large message histories
4. **Lazy Loading** can be implemented for better performance

## Troubleshooting

### Debug Mode
Enable debug logging to troubleshoot issues:

```typescript
localStorage.setItem('debug', 'crypto:*');
```

### Common Issues
1. **Keys not generating**: Check TweetNaCl installation
2. **API errors**: Verify authentication token
3. **Decryption failures**: Ensure valid key pairs
4. **Storage issues**: Check localStorage availability

## API Reference

### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:chatId` | Fetch messages for a chat |
| POST | `/api/messages` | Send an encrypted message |
| GET | `/api/messages/chats` | Get user's chat list |
| PUT | `/api/messages/:chatId/read` | Mark messages as read |
| DELETE | `/api/messages/:messageId` | Delete a message |
| GET | `/api/messages/unread/count` | Get unread count |

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/keys` | Store user's public key |
| GET | `/api/keys/:userId` | Get user's public key |
| POST | `/api/keys/batch` | Get multiple users' public keys |
| DELETE | `/api/keys/:userId` | Delete user's public key |

This implementation provides a complete end-to-end encrypted messaging system that can be easily integrated into your LawMate application.
