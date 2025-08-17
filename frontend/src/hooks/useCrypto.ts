import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  initializeUserKeys,
  hasPrivateKey,
  removePrivateKey,
  getStoredPrivateKey,
  getPeerPublicKey,
  getPeersPublicKeys,
  type KeyPair,
  type PeerPublicKey
} from '@/utils/crypto';

export const useCrypto = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);
  const [peerKeysCache, setPeerKeysCache] = useState<Record<string, PeerPublicKey>>({});

  // Check if user has keys on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      const keysExist = hasPrivateKey(user.id);
      setHasKeys(keysExist);
      setIsInitialized(true);
    }
  }, [user?.id]);

  // Initialize crypto keys for the current user
  const initializeKeys = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const success = await initializeUserKeys(user.id);

      if (success) {
        setHasKeys(true);
        toast({
          title: "Success",
          description: "Crypto keys initialized successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize crypto keys",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error initializing keys:', error);
      toast({
        title: "Error",
        description: "Failed to initialize crypto keys",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  // Remove crypto keys
  const removeKeys = useCallback(() => {
    if (!user?.id) return;

    removePrivateKey();
    setHasKeys(false);
    toast({
      title: "Success",
      description: "Crypto keys removed",
    });
  }, [user?.id, toast]);

  // Get the current user's private key
  const getPrivateKey = useCallback((): string | null => {
    if (!user?.id) return null;
    return getStoredPrivateKey(user.id);
  }, [user?.id]);

  // Get a peer's public key
  const getPeerKey = useCallback(async (peerUserId: string): Promise<PeerPublicKey | null> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return null;
    }

    // Check cache first
    if (peerKeysCache[peerUserId]) {
      return peerKeysCache[peerUserId];
    }

    try {
      const peerKey = await getPeerPublicKey(peerUserId);

      if (peerKey) {
        // Cache the result
        setPeerKeysCache(prev => ({
          ...prev,
          [peerUserId]: peerKey
        }));

        return peerKey;
      } else {
        toast({
          title: "Warning",
          description: `No public key found for user: ${peerUserId}`,
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Error getting peer key:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve peer's public key",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, peerKeysCache, toast]);

  // Get multiple peers' public keys
  const getMultiplePeerKeys = useCallback(async (peerUserIds: string[]): Promise<Record<string, PeerPublicKey>> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return {};
    }

    try {
      const peerKeys = await getPeersPublicKeys(peerUserIds);

      // Update cache with new keys
      setPeerKeysCache(prev => ({
        ...prev,
        ...peerKeys
      }));

      return peerKeys;
    } catch (error) {
      console.error('Error getting multiple peer keys:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve peers' public keys",
        variant: "destructive",
      });
      return {};
    }
  }, [user?.id, toast]);

  // Clear peer keys cache
  const clearPeerKeysCache = useCallback(() => {
    setPeerKeysCache({});
  }, []);

  // Get cached peer key
  const getCachedPeerKey = useCallback((peerUserId: string): PeerPublicKey | null => {
    return peerKeysCache[peerUserId] || null;
  }, [peerKeysCache]);

  return {
    isInitialized,
    isLoading,
    hasKeys,
    initializeKeys,
    removeKeys,
    getPrivateKey,
    getPeerKey,
    getMultiplePeerKeys,
    clearPeerKeysCache,
    getCachedPeerKey,
    peerKeysCache,
  };
};
