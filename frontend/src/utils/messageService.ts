import { encryptMessage, getPeerPublicKey } from './crypto';
import type { PeerPublicKey } from './crypto';

export interface SendMessageRequest {
  chatId: string;
  receiverId: string;
  encryptedContent: string;
  nonce: string;
  messageType?: 'text' | 'file' | 'image';
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  id: string;
  chatId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  receiverId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  encryptedContent: string;
  nonce: string;
  senderPublicKey: string;
  messageType: string;
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatInfo {
  chatId: string;
  lastMessage: MessageResponse;
  messageCount: number;
  unreadCount: number;
}

/**
 * Encrypt and send a message to a peer
 */
export const sendEncryptedMessage = async (
  message: string,
  receiverId: string,
  senderPrivateKey: string,
  chatId: string,
  messageType: 'text' | 'file' | 'image' = 'text',
  metadata: Record<string, any> = {}
): Promise<MessageResponse | null> => {
  try {
    // Get receiver's public key
    const peerKey = await getPeerPublicKey(receiverId);
    
    if (!peerKey) {
      throw new Error(`No public key found for receiver: ${receiverId}`);
    }

    // Encrypt the message
    const encryptedData = encryptMessage(message, peerKey.publicKey, senderPrivateKey);
    
    // Parse the encrypted data to extract content and nonce
    const parsedData = JSON.parse(encryptedData);
    
    // Prepare the request payload
    const requestPayload: SendMessageRequest = {
      chatId,
      receiverId,
      encryptedContent: parsedData.encrypted,
      nonce: parsedData.nonce,
      messageType,
      metadata
    };

    // Send the encrypted message to the backend
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Error sending encrypted message:', error);
    throw error;
  }
};

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (
  chatId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ messages: MessageResponse[]; total: number; hasMore: boolean }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `http://localhost:5000/api/messages/${chatId}?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve messages');
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    throw error;
  }
};

/**
 * Get all chats for the current user
 */
export const getUserChats = async (): Promise<ChatInfo[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/messages/chats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve chats');
    }

    const data = await response.json();
    return data.data.chats;

  } catch (error) {
    console.error('Error retrieving user chats:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatId: string): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/api/messages/${chatId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark messages as read');
    }

    const data = await response.json();
    return data.data.updatedCount;

  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete message');
    }

  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/messages/unread/count', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get unread count');
    }

    const data = await response.json();
    return data.data.unreadCount;

  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * Generate a unique chat ID for two users
 */
export const generateChatId = (userId1: string, userId2: string): string => {
  // Sort user IDs to ensure consistent chat ID regardless of sender/receiver order
  const sortedIds = [userId1, userId2].sort();
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

/**
 * Decrypt a received message
 */
export const decryptReceivedMessage = (
  encryptedContent: string,
  nonce: string,
  senderPublicKey: string,
  recipientPrivateKey: string
): string => {
  try {
    // Reconstruct the encrypted data structure
    const encryptedData = JSON.stringify({
      encrypted: encryptedContent,
      nonce: nonce
    });

    // Import the decrypt function
    const { decryptMessage } = require('./crypto');
    
    // Decrypt the message
    return decryptMessage(encryptedData, senderPublicKey, recipientPrivateKey);
  } catch (error) {
    console.error('Error decrypting received message:', error);
    throw new Error('Failed to decrypt message');
  }
};
