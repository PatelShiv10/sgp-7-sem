# Crypto Key Implementation with TweetNaCl

This document describes the implementation of public/private key pair generation using TweetNaCl for secure end-to-end encryption in the LawMate application.

## Overview

The implementation provides:
1. **Frontend key generation** using TweetNaCl
2. **Secure private key storage** in browser localStorage
3. **Public key transmission** to backend via API
4. **Message encryption/decryption** capabilities
5. **Automatic key initialization** on user login

## Architecture

### Frontend Components

#### 1. Crypto Utilities (`frontend/src/utils/crypto.ts`)
- `generateKeyPair()`: Creates new public/private key pair using TweetNaCl
- `storePrivateKey()`: Securely stores private key in localStorage
- `getStoredPrivateKey()`: Retrieves private key for current user
- `sendPublicKeyToBackend()`: Sends public key to backend API
- `initializeUserKeys()`: Complete key initialization workflow
- `getPeerPublicKey()`: Retrieves a peer's public key from backend
- `getPeersPublicKeys()`: Retrieves multiple peers' public keys in batch
- `encryptMessage()`: Encrypts messages using recipient's public key
- `decryptMessage()`: Decrypts messages using sender's public key

#### 2. Message Encryption Utilities (`frontend/src/utils/messageEncryption.ts`)
- `encryptMessageForRecipient()`: Encrypts message for specific recipient
- `decryptMessageForRecipient()`: Decrypts message using recipient's private key
- `encryptMessageForMultipleRecipients()`: Encrypts message for multiple recipients
- `batchRetrievePublicKeys()`: Batch retrieve public keys for multiple users
- `MessageEncryptionHelper`: Helper class for message encryption operations

#### 2. React Hook (`frontend/src/hooks/useCrypto.ts`)
- `useCrypto()`: Manages crypto state and operations
- Provides loading states, key status, and operation methods
- Integrates with authentication context

#### 3. UI Components
- `CryptoKeyManager`: Key management interface
- `CryptoDemo`: Demonstration of encryption/decryption
- `PeerKeyRetriever`: Interface for retrieving peer public keys

### Backend Components

#### 1. Database Model (`backend/models/UserKey.js`)
```javascript
{
  userId: ObjectId,      // Reference to User
  publicKey: String,     // Base64 encoded public key
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. API Controller (`backend/controllers/keyController.js`)
- `POST /api/keys`: Store user's public key
- `GET /api/keys/:userId`: Retrieve user's public key
- `POST /api/keys/batch`: Get multiple users' public keys
- `DELETE /api/keys/:userId`: Delete user's public key

#### 3. Routes (`backend/routes/keys.js`)
- Protected routes requiring authentication
- JWT token validation

## Security Features

### 1. Key Generation
- Uses TweetNaCl's `nacl.box.keyPair()` for cryptographically secure key generation
- Keys are 32 bytes (256 bits) for both public and private keys
- Base64 encoding for storage and transmission

### 2. Private Key Storage
- Stored locally in browser localStorage
- Tied to specific user ID to prevent cross-user access
- Never transmitted to server
- Includes creation timestamp for audit purposes

### 3. Public Key Management
- Stored securely in MongoDB
- Associated with user account
- Accessible for message encryption
- Protected by authentication middleware

### 4. Message Encryption
- Uses TweetNaCl's `nacl.box()` for authenticated encryption
- Ephemeral key pairs for forward secrecy
- Random nonces for each encryption
- JSON format for encrypted data storage

## API Endpoints

### Store Public Key
```http
POST /api/keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "publicKey": "base64_encoded_public_key",
  "userId": "user_id"
}
```

### Get Public Key
```http
GET /api/keys/:userId
Authorization: Bearer <jwt_token>
```

### Get Multiple Public Keys
```http
POST /api/keys/batch
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2", ...]
}
```

### Delete Public Key
```http
DELETE /api/keys/:userId
Authorization: Bearer <jwt_token>
```

## Usage Examples

### 1. Initialize Keys on Login
```typescript
// Automatically called after successful login
await initializeUserKeys(userId);
```

### 2. Encrypt a Message
```typescript
const encrypted = encryptMessage(
  "Hello, world!",
  recipientPublicKey,
  senderPrivateKey
);
```

### 3. Decrypt a Message
```typescript
const decrypted = decryptMessage(
  encryptedData,
  senderPublicKey,
  recipientPrivateKey
);
```

### 4. Check Key Status
```typescript
const { hasKeys, isLoading } = useCrypto();
```

### 5. Retrieve Peer's Public Key
```typescript
const { getPeerKey, getMultiplePeerKeys } = useCrypto();

// Get single peer key
const peerKey = await getPeerKey('user123');

// Get multiple peer keys
const peerKeys = await getMultiplePeerKeys(['user123', 'user456']);
```

### 6. Encrypt Message for Recipient
```typescript
import { encryptMessageForRecipient } from '@/utils/messageEncryption';

const encryptedMessage = await encryptMessageForRecipient(
  "Hello, this is a secret message!",
  "recipientUserId",
  "senderPrivateKey"
);
```

### 7. Use Message Encryption Helper
```typescript
import { MessageEncryptionHelper } from '@/utils/messageEncryption';

const helper = new MessageEncryptionHelper(
  'senderId',
  'senderPrivateKey',
  'senderPublicKey'
);

const encryptedMessage = await helper.encryptForRecipient(
  "Secret message",
  "recipientId"
);
```

## Installation and Setup

### Frontend Dependencies
```bash
npm install tweetnacl tweetnacl-util
```

### Backend Setup
1. The UserKey model is automatically created when the server starts
2. Key routes are automatically registered in `server.js`
3. Authentication middleware protects all key endpoints

## Demo Page

Visit `/crypto-demo` to see the crypto functionality in action:
- Generate crypto keys
- Encrypt and decrypt messages
- View key status and management

## Security Considerations

1. **Private Key Protection**: Never expose private keys to the server
2. **Key Rotation**: Consider implementing key rotation mechanisms
3. **Backup**: Users should backup their private keys securely
4. **Browser Security**: Keys are vulnerable to XSS attacks
5. **Key Recovery**: No mechanism for key recovery if lost

## Future Enhancements

1. **Key Rotation**: Automatic key renewal
2. **Key Backup**: Secure backup mechanisms
3. **Key Verification**: Digital signatures for key authenticity
4. **Forward Secrecy**: Perfect forward secrecy implementation
5. **Key Escrow**: Optional key recovery for legal compliance

## Testing

1. **Unit Tests**: Test key generation and encryption functions
2. **Integration Tests**: Test API endpoints
3. **Security Tests**: Verify key isolation and protection
4. **Browser Tests**: Test localStorage persistence

## Troubleshooting

### Common Issues

1. **Keys not generating**: Check TweetNaCl installation
2. **API errors**: Verify authentication token
3. **Encryption failures**: Ensure valid public/private key pairs
4. **Storage issues**: Check localStorage availability

### Debug Information

Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'crypto:*');
```

## Dependencies

### Frontend
- `tweetnacl`: Cryptography library
- `tweetnacl-util`: Utility functions for TweetNaCl

### Backend
- `mongoose`: Database ODM
- `jsonwebtoken`: JWT authentication
- `express`: Web framework
