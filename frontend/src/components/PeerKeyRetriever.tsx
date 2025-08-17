import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Key, 
  Search, 
  Users, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { useCrypto } from '@/hooks/useCrypto';
import { useToast } from '@/hooks/use-toast';
import type { PeerPublicKey } from '@/utils/crypto';

export const PeerKeyRetriever = () => {
  const { 
    getPeerKey, 
    getMultiplePeerKeys, 
    clearPeerKeysCache, 
    getCachedPeerKey,
    peerKeysCache 
  } = useCrypto();
  const { toast } = useToast();
  
  const [singleUserId, setSingleUserId] = useState('');
  const [multipleUserIds, setMultipleUserIds] = useState('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingMultiple, setIsLoadingMultiple] = useState(false);
  const [retrievedKey, setRetrievedKey] = useState<PeerPublicKey | null>(null);

  const handleGetSingleKey = async () => {
    if (!singleUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingSingle(true);
    try {
      const peerKey = await getPeerKey(singleUserId.trim());
      setRetrievedKey(peerKey);
      
      if (peerKey) {
        toast({
          title: "Success",
          description: `Retrieved public key for user: ${singleUserId}`,
        });
      }
    } catch (error) {
      console.error('Error retrieving single key:', error);
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const handleGetMultipleKeys = async () => {
    if (!multipleUserIds.trim()) {
      toast({
        title: "Error",
        description: "Please enter user IDs",
        variant: "destructive",
      });
      return;
    }

    const userIds = multipleUserIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (userIds.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid user IDs",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingMultiple(true);
    try {
      const peerKeys = await getMultiplePeerKeys(userIds);
      
      const foundCount = Object.keys(peerKeys).length;
      toast({
        title: "Success",
        description: `Retrieved ${foundCount} out of ${userIds.length} public keys`,
      });
    } catch (error) {
      console.error('Error retrieving multiple keys:', error);
    } finally {
      setIsLoadingMultiple(false);
    }
  };

  const handleClearCache = () => {
    clearPeerKeysCache();
    setRetrievedKey(null);
    toast({
      title: "Success",
      description: "Peer keys cache cleared",
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "Public key copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Single Key Retrieval */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Retrieve Single Peer Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="singleUserId">User ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="singleUserId"
                value={singleUserId}
                onChange={(e) => setSingleUserId(e.target.value)}
                placeholder="Enter user ID to retrieve public key..."
              />
              <Button 
                onClick={handleGetSingleKey} 
                disabled={isLoadingSingle || !singleUserId.trim()}
              >
                {isLoadingSingle ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {retrievedKey && (
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Public Key Retrieved</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyKey(retrievedKey.publicKey)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">User ID:</span> {retrievedKey.userId}
                </div>
                <div>
                  <span className="font-medium">Public Key:</span>
                  <div className="bg-white p-2 rounded border font-mono text-xs break-all mt-1">
                    {retrievedKey.publicKey}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Created:</span> {formatDate(retrievedKey.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {formatDate(retrievedKey.updatedAt)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multiple Keys Retrieval */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Retrieve Multiple Peer Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="multipleUserIds">User IDs (comma-separated)</Label>
            <div className="flex gap-2 mt-1">
              <Textarea
                id="multipleUserIds"
                value={multipleUserIds}
                onChange={(e) => setMultipleUserIds(e.target.value)}
                placeholder="Enter user IDs separated by commas..."
                rows={3}
              />
              <Button 
                onClick={handleGetMultipleKeys} 
                disabled={isLoadingMultiple || !multipleUserIds.trim()}
              >
                {isLoadingMultiple ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cached Keys Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Cached Peer Keys
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {Object.keys(peerKeysCache).length} keys
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={Object.keys(peerKeysCache).length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(peerKeysCache).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No peer keys cached yet</p>
              <p className="text-sm">Retrieve some keys to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(peerKeysCache).map(([userId, peerKey]) => (
                <div key={userId} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">User: {userId}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyKey(peerKey.publicKey)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Public Key:</span>
                      <div className="bg-gray-50 p-2 rounded font-mono break-all mt-1">
                        {peerKey.publicKey.substring(0, 50)}...
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {formatDate(peerKey.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Single Key Retrieval:</strong> Enter a user ID to get their public key for encryption</p>
          <p>• <strong>Multiple Keys:</strong> Enter comma-separated user IDs to retrieve multiple keys at once</p>
          <p>• <strong>Cached Keys:</strong> Retrieved keys are cached for faster access</p>
          <p>• <strong>Copy Keys:</strong> Use the copy button to copy public keys to clipboard</p>
          <p>• <strong>Clear Cache:</strong> Remove all cached keys if needed</p>
        </CardContent>
      </Card>
    </div>
  );
};
