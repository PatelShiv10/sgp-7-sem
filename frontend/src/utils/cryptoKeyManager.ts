import { generateKeyPair, storePrivateKey, getStoredPrivateKey, removePrivateKey, sendPublicKeyToBackend } from './crypto';

export interface CryptoKeyStatus {
  hasPrivateKey: boolean;
  hasPublicKey: boolean;
  isInitialized: boolean;
  userId?: string;
}

/**
 * Check the current status of crypto keys for a user
 */
export const checkCryptoKeyStatus = (userId: string): CryptoKeyStatus => {
  const privateKey = getStoredPrivateKey(userId);
  
  return {
    hasPrivateKey: !!privateKey,
    hasPublicKey: false, // We don't store public key locally
    isInitialized: !!privateKey,
    userId
  };
};

/**
 * Initialize crypto keys for a user (generate, store, and send to backend)
 */
export const initializeCryptoKeys = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔑 Initializing crypto keys for user:', userId);
    
    // Check if keys already exist
    const existingPrivateKey = getStoredPrivateKey(userId);
    if (existingPrivateKey) {
      console.log('✅ Crypto keys already exist for user');
      return true;
    }
    
    // Generate new key pair
    const keyPair = generateKeyPair();
    console.log('🔑 Generated new key pair');
    
    // Store private key locally
    storePrivateKey(keyPair.privateKey, userId);
    console.log('🔑 Stored private key locally');
    
    // Send public key to backend
    const success = await sendPublicKeyToBackend(keyPair.publicKey, userId);
    
    if (success) {
      console.log('✅ Crypto keys initialized successfully');
      return true;
    } else {
      // If backend call fails, remove the stored private key
      removePrivateKey();
      console.error('❌ Failed to send public key to backend');
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing crypto keys:', error);
    // Clean up on error
    removePrivateKey();
    return false;
  }
};

/**
 * Regenerate crypto keys for a user (remove old ones and create new ones)
 */
export const regenerateCryptoKeys = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔄 Regenerating crypto keys for user:', userId);
    
    // Remove existing keys
    removePrivateKey();
    console.log('🗑️ Removed existing private key');
    
    // Initialize new keys
    const success = await initializeCryptoKeys(userId);
    
    if (success) {
      console.log('✅ Crypto keys regenerated successfully');
      return true;
    } else {
      console.error('❌ Failed to regenerate crypto keys');
      return false;
    }
  } catch (error) {
    console.error('❌ Error regenerating crypto keys:', error);
    return false;
  }
};

/**
 * Validate crypto keys for a user
 */
export const validateCryptoKeys = async (userId: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const status = checkCryptoKeyStatus(userId);
    
    if (!status.hasPrivateKey) {
      return { isValid: false, error: 'No private key found' };
    }
    
    if (!status.isInitialized) {
      return { isValid: false, error: 'Crypto keys not properly initialized' };
    }
    
    // Test encryption/decryption
    const { testEncryptionDecryption } = await import('./crypto');
    const testResult = testEncryptionDecryption();
    
    if (!testResult) {
      return { isValid: false, error: 'Crypto system test failed' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
};

/**
 * Get crypto key information for debugging
 */
export const getCryptoKeyInfo = (userId: string): any => {
  const privateKey = getStoredPrivateKey(userId);
  const status = checkCryptoKeyStatus(userId);
  
  return {
    status,
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey ? privateKey.length : 0,
    privateKeyPreview: privateKey ? `${privateKey.substring(0, 10)}...` : 'None',
    timestamp: new Date().toISOString()
  };
};
