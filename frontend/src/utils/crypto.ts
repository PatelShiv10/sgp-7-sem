import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface StoredKeyPair {
  publicKey: string;
  privateKey: string;
  userId: string;
  createdAt: string;
}

export interface PeerPublicKey {
  userId: string;
  publicKey: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate a new public/private key pair using TweetNaCl
 */
export const generateKeyPair = (): KeyPair => {
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey)
  };
};

/**
 * Store the private key securely in localStorage
 */
export const storePrivateKey = (privateKey: string, userId: string): void => {
  const keyData: StoredKeyPair = {
    publicKey: '', // We don't store public key locally
    privateKey,
    userId,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('lawmate_private_key', JSON.stringify(keyData));
};

/**
 * Retrieve the stored private key from localStorage
 */
export const getStoredPrivateKey = (userId: string): string | null => {
  try {
    const stored = localStorage.getItem('lawmate_private_key');
    if (!stored) return null;

    const keyData: StoredKeyPair = JSON.parse(stored);

    // Verify the key belongs to the current user
    if (keyData.userId !== userId) {
      console.warn('Stored private key belongs to different user');
      return null;
    }

    return keyData.privateKey;
  } catch (error) {
    console.error('Error retrieving private key:', error);
    return null;
  }
};

/**
 * Check if a private key exists for the current user
 */
export const hasPrivateKey = (userId: string): boolean => {
  return getStoredPrivateKey(userId) !== null;
};

/**
 * Remove the stored private key from localStorage
 */
export const removePrivateKey = (): void => {
  localStorage.removeItem('lawmate_private_key');
};

/**
 * Send public key to backend
 */
export const sendPublicKeyToBackend = async (publicKey: string, userId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        publicKey,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send public key: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending public key to backend:', error);
    return false;
  }
};

/**
 * Retrieve a peer's public key from the backend
 */
export const getPeerPublicKey = async (peerUserId: string): Promise<PeerPublicKey | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/api/keys/${peerUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Public key not found for user: ${peerUserId}`);
        return null;
      }
      throw new Error(`Failed to retrieve public key: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving peer public key:', error);
    return null;
  }
};

/**
 * Retrieve multiple peers' public keys from the backend
 */
export const getPeersPublicKeys = async (peerUserIds: string[]): Promise<Record<string, PeerPublicKey>> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/keys/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userIds: peerUserIds
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve public keys: ${response.statusText}`);
    }

    const data = await response.json();
    return data.keys || {};
  } catch (error) {
    console.error('Error retrieving peers public keys:', error);
    return {};
  }
};

/**
 * Initialize crypto keys for a user
 * This function generates keys, stores the private key locally, and sends the public key to the backend
 */
export const initializeUserKeys = async (userId: string): Promise<boolean> => {
  try {
    // Check if keys already exist
    if (hasPrivateKey(userId)) {
      console.log('Keys already exist for user');
      return true;
    }

    // Generate new key pair
    const keyPair = generateKeyPair();

    // Store private key locally
    storePrivateKey(keyPair.privateKey, userId);

    // Send public key to backend
    const success = await sendPublicKeyToBackend(keyPair.publicKey, userId);

    if (success) {
      console.log('Crypto keys initialized successfully');
      return true;
    } else {
      // If backend call fails, remove the stored private key
      removePrivateKey();
      return false;
    }
  } catch (error) {
    console.error('Error initializing user keys:', error);
    return false;
  }
};

/**
 * Encrypt a message using the recipient's public key and sender's private key
 */
export const encryptMessage = (message: string, recipientPublicKey: string, senderPrivateKey: string): string => {
  try {
    const ephemeralKeyPair = nacl.box.keyPair();
    const nonce = nacl.randomBytes(24);

    const encrypted = nacl.box(
      nacl.util.decodeUTF8(message),
      nonce,
      decodeBase64(recipientPublicKey),
      decodeBase64(senderPrivateKey)
    );

    const encryptedData = {
      encrypted: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
      ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey)
    };

    return JSON.stringify(encryptedData);
  } catch (error) {
    console.error('Error encrypting message:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypt a message using the recipient's private key and sender's public key
 */
export const decryptMessage = (encryptedData: string, senderPublicKey: string, recipientPrivateKey: string): string => {
  try {
    const data = JSON.parse(encryptedData);

    const decrypted = nacl.box.open(
      decodeBase64(data.encrypted),
      decodeBase64(data.nonce),
      decodeBase64(senderPublicKey),
      decodeBase64(recipientPrivateKey)
    );

    if (!decrypted) {
      throw new Error('Failed to decrypt message');
    }

    return nacl.util.encodeUTF8(decrypted);
  } catch (error) {
    console.error('Error decrypting message:', error);
    throw new Error('Failed to decrypt message');
  }
};
