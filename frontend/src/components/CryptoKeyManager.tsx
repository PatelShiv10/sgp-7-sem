import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useCrypto } from '@/hooks/useCrypto';

export const CryptoKeyManager = () => {
  const {
    isInitialized,
    isLoading,
    hasKeys,
    initializeKeys,
    removeKeys,
    getPrivateKey
  } = useCrypto();

  const handleInitializeKeys = async () => {
    await initializeKeys();
  };

  const handleRemoveKeys = () => {
    removeKeys();
  };

  const handleShowPrivateKey = () => {
    const privateKey = getPrivateKey();
    if (privateKey) {
      // In a real application, you might want to show this in a secure dialog
      // For demo purposes, we'll just show the first 20 characters
      const truncatedKey = privateKey.substring(0, 20) + '...';
      alert(`Private Key (truncated): ${truncatedKey}`);
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Initializing...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Crypto Key Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Key Status:</span>
            {hasKeys ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Keys Generated
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                No Keys
              </Badge>
            )}
          </div>
        </div>

        {/* Key Information */}
        {hasKeys && (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Keys are securely stored
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Your private key is stored locally in your browser.
              Your public key has been sent to the server for secure communication.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!hasKeys ? (
            <Button
              onClick={handleInitializeKeys}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Keys...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Generate Keys
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleShowPrivateKey}
                variant="outline"
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                View Private Key
              </Button>
              <Button
                onClick={handleRemoveKeys}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Keys are generated using TweetNaCl for secure end-to-end encryption</p>
          <p>• Private keys are stored locally in your browser</p>
          <p>• Public keys are stored on the server for message encryption</p>
          <p>• Never share your private key with anyone</p>
        </div>
      </CardContent>
    </Card>
  );
};
