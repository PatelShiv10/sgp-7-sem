import { encryptMessage, decryptMessage, getPeerPublicKey } from './crypto';
import type { PeerPublicKey } from './crypto';

export interface EncryptedMessage {
  id: string;
  senderId: string;
  recipientId: string;
  encryptedContent: string;
  senderPublicKey: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DecryptedMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Encrypt a message for a specific recipient
 */
export const encryptMessageForRecipient = async (
  message: string,
  recipientId: string,
  senderPrivateKey: string,
  messageId?: string,
  metadata?: Record<string, any>
): Promise<EncryptedMessage | null> => {
  try {
    // Get recipient's public key
    const peerKey = await getPeerPublicKey(recipientId);
    
    if (!peerKey) {
      throw new Error(`No public key found for recipient: ${recipientId}`);
    }

    // Encrypt the message
    const encryptedContent = encryptMessage(
      message,
      peerKey.publicKey,
      senderPrivateKey
    );

    // Create encrypted message object
    const encryptedMessage: EncryptedMessage = {
      id: messageId || generateMessageId(),
      senderId: '', // Will be set by the caller
      recipientId,
      encryptedContent,
      senderPublicKey: '', // Will be set by the caller
      timestamp: new Date().toISOString(),
      metadata
    };

    return encryptedMessage;
  } catch (error) {
    console.error('Error encrypting message for recipient:', error);
    return null;
  }
};

/**
 * Decrypt a message using the recipient's private key
 */
export const decryptMessageForRecipient = (
  encryptedMessage: EncryptedMessage,
  recipientPrivateKey: string
): DecryptedMessage | null => {
  try {
    // Decrypt the message
    const decryptedContent = decryptMessage(
      encryptedMessage.encryptedContent,
      encryptedMessage.senderPublicKey,
      recipientPrivateKey
    );

    // Create decrypted message object
    const decryptedMessage: DecryptedMessage = {
      id: encryptedMessage.id,
      senderId: encryptedMessage.senderId,
      recipientId: encryptedMessage.recipientId,
      content: decryptedContent,
      timestamp: encryptedMessage.timestamp,
      metadata: encryptedMessage.metadata
    };

    return decryptedMessage;
  } catch (error) {
    console.error('Error decrypting message:', error);
    return null;
  }
};

/**
 * Encrypt a message for multiple recipients
 */
export const encryptMessageForMultipleRecipients = async (
  message: string,
  recipientIds: string[],
  senderPrivateKey: string,
  messageId?: string,
  metadata?: Record<string, any>
): Promise<EncryptedMessage[]> => {
  const encryptedMessages: EncryptedMessage[] = [];
  const messageIdToUse = messageId || generateMessageId();

  for (const recipientId of recipientIds) {
    const encryptedMessage = await encryptMessageForRecipient(
      message,
      recipientId,
      senderPrivateKey,
      `${messageIdToUse}_${recipientId}`,
      metadata
    );

    if (encryptedMessage) {
      encryptedMessages.push(encryptedMessage);
    }
  }

  return encryptedMessages;
};

/**
 * Batch retrieve public keys for multiple users
 */
export const batchRetrievePublicKeys = async (
  userIds: string[]
): Promise<Record<string, PeerPublicKey>> => {
  try {
    const response = await fetch('http://localhost:5000/api/keys/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve public keys: ${response.statusText}`);
    }

    const data = await response.json();
    return data.keys || {};
  } catch (error) {
    console.error('Error batch retrieving public keys:', error);
    return {};
  }
};

/**
 * Generate a unique message ID
 */
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate an encrypted message structure
 */
export const validateEncryptedMessage = (message: any): message is EncryptedMessage => {
  return (
    typeof message === 'object' &&
    typeof message.id === 'string' &&
    typeof message.senderId === 'string' &&
    typeof message.recipientId === 'string' &&
    typeof message.encryptedContent === 'string' &&
    typeof message.senderPublicKey === 'string' &&
    typeof message.timestamp === 'string'
  );
};

/**
 * Create a message encryption helper class
 */
export class MessageEncryptionHelper {
  private senderPrivateKey: string;
  private senderPublicKey: string;
  private senderId: string;

  constructor(senderId: string, senderPrivateKey: string, senderPublicKey: string) {
    this.senderId = senderId;
    this.senderPrivateKey = senderPrivateKey;
    this.senderPublicKey = senderPublicKey;
  }

  /**
   * Encrypt a message for a single recipient
   */
  async encryptForRecipient(
    message: string,
    recipientId: string,
    messageId?: string,
    metadata?: Record<string, any>
  ): Promise<EncryptedMessage | null> {
    const encryptedMessage = await encryptMessageForRecipient(
      message,
      recipientId,
      this.senderPrivateKey,
      messageId,
      metadata
    );

    if (encryptedMessage) {
      encryptedMessage.senderId = this.senderId;
      encryptedMessage.senderPublicKey = this.senderPublicKey;
    }

    return encryptedMessage;
  }

  /**
   * Encrypt a message for multiple recipients
   */
  async encryptForMultipleRecipients(
    message: string,
    recipientIds: string[],
    messageId?: string,
    metadata?: Record<string, any>
  ): Promise<EncryptedMessage[]> {
    const encryptedMessages = await encryptMessageForMultipleRecipients(
      message,
      recipientIds,
      this.senderPrivateKey,
      messageId,
      metadata
    );

    // Set sender information
    return encryptedMessages.map(msg => ({
      ...msg,
      senderId: this.senderId,
      senderPublicKey: this.senderPublicKey
    }));
  }

  /**
   * Decrypt a message
   */
  decryptMessage(encryptedMessage: EncryptedMessage): DecryptedMessage | null {
    return decryptMessageForRecipient(encryptedMessage, this.senderPrivateKey);
  }
}
