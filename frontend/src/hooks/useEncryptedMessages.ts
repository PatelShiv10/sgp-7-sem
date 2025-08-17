import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCrypto } from '@/hooks/useCrypto';
import { useToast } from '@/hooks/use-toast';
import {
  sendEncryptedMessage,
  getChatMessages,
  getUserChats,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  generateChatId,
  decryptReceivedMessage,
  type MessageResponse,
  type ChatInfo
} from '@/utils/messageService';

export const useEncryptedMessages = () => {
  const { user } = useAuth();
  const { getPrivateKey } = useCrypto();
  const { toast } = useToast();

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user's chats on mount
  useEffect(() => {
    if (user?.id) {
      loadUserChats();
      loadUnreadCount();
    }
  }, [user?.id]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  // Load user's chats
  const loadUserChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const userChats = await getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load messages for a specific chat
  const loadChatMessages = useCallback(async (
    chatId: string,
    limit: number = 50,
    offset: number = 0
  ) => {
    try {
      setIsLoading(true);
      const result = await getChatMessages(chatId, limit, offset);
      setMessages(result.messages);
      setCurrentChatId(chatId);

      // Mark messages as read
      if (result.messages.length > 0) {
        await markMessagesAsRead(chatId);
        // Refresh unread count
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadUnreadCount]);

  // Send an encrypted message
  const sendMessage = useCallback(async (
    message: string,
    receiverId: string,
    messageType: 'text' | 'file' | 'image' = 'text',
    metadata: Record<string, any> = {}
  ) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const privateKey = getPrivateKey();
      if (!privateKey) {
        throw new Error('Private key not found. Please generate crypto keys first.');
      }

      // Generate chat ID
      const chatId = generateChatId(user.id, receiverId);

      // Send the encrypted message
      const sentMessage = await sendEncryptedMessage(
        message,
        receiverId,
        privateKey,
        chatId,
        messageType,
        metadata
      );

      if (sentMessage) {
        // Add the new message to the current chat if it matches
        if (currentChatId === chatId) {
          setMessages(prev => [...prev, sentMessage]);
        }

        // Refresh chats to update last message
        loadUserChats();

        toast({
          title: "Success",
          description: "Message sent successfully",
        });

        return sentMessage;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, getPrivateKey, currentChatId, loadUserChats, toast]);

  // Decrypt a received message
  const decryptMessage = useCallback((
    encryptedContent: string,
    nonce: string,
    senderPublicKey: string
  ): string => {
    try {
      const privateKey = getPrivateKey();
      if (!privateKey) {
        throw new Error('Private key not found');
      }

      return decryptReceivedMessage(
        encryptedContent,
        nonce,
        senderPublicKey,
        privateKey
      );
    } catch (error) {
      console.error('Error decrypting message:', error);
      return '[Encrypted Message - Decryption Failed]';
    }
  }, [getPrivateKey]);

  // Delete a message
  const removeMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await markMessagesAsRead(chatId);
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [loadUnreadCount]);

  // Get decrypted messages for display
  const getDecryptedMessages = useCallback(() => {
    return messages.map(message => ({
      ...message,
      decryptedContent: decryptMessage(
        message.encryptedContent,
        message.nonce,
        message.senderPublicKey
      )
    }));
  }, [messages, decryptMessage]);

  // Start a new chat
  const startNewChat = useCallback((receiverId: string) => {
    const chatId = generateChatId(user?.id || '', receiverId);
    setCurrentChatId(chatId);
    setMessages([]);
    return chatId;
  }, [user?.id]);

  return {
    // State
    messages,
    chats,
    currentChatId,
    isLoading,
    unreadCount,

    // Actions
    sendMessage,
    loadChatMessages,
    loadUserChats,
    removeMessage,
    markAsRead,
    startNewChat,
    getDecryptedMessages,
    decryptMessage,

    // Utilities
    generateChatId: useCallback((userId1: string, userId2: string) =>
      generateChatId(userId1, userId2), [])
  };
};
