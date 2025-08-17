import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Download, Lock, User, Clock } from 'lucide-react';
import { useEncryptedMessages } from '@/hooks/useEncryptedMessages';
import { useAuth } from '@/contexts/AuthContext';

export const EncryptedMessageExample = () => {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    loadChatMessages,
    getDecryptedMessages
  } = useEncryptedMessages();

  const [chatId, setChatId] = useState('');

  const handleFetchMessages = async () => {
    if (!chatId.trim()) {
      alert('Please enter a chat ID');
      return;
    }
    
    await loadChatMessages(chatId.trim());
  };

  const decryptedMessages = getDecryptedMessages();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Fetch Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Fetch Encrypted Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chatId">Chat ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter chat ID to fetch messages..."
              />
              <Button 
                onClick={handleFetchMessages} 
                disabled={isLoading || !chatId.trim()}
              >
                {isLoading ? 'Loading...' : 'Fetch Messages'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Decrypted Messages ({decryptedMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {decryptedMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p>No messages to display</p>
              <p className="text-sm">Fetch messages from a chat to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decryptedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-md ${
                    message.senderId._id === user?.id
                      ? 'bg-blue-50 border-blue-200 ml-8'
                      : 'bg-gray-50 border-gray-200 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {message.senderId.firstName} {message.senderId.lastName}
                      </span>
                      {message.isRead && (
                        <Badge variant="outline" className="text-xs">
                          Read
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Decrypted Content:</span>
                      <p className="mt-1 bg-white p-2 rounded border">
                        {message.decryptedContent}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        <span className="font-medium">Encrypted (truncated):</span>
                        <p className="font-mono break-all">
                          {message.encryptedContent.substring(0, 50)}...
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Nonce (truncated):</span>
                        <p className="font-mono break-all">
                          {message.nonce.substring(0, 30)}...
                        </p>
                      </div>
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
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• <strong>1. Fetch Messages:</strong> Enter a chat ID and click "Fetch Messages"</p>
          <p>• <strong>2. API Call:</strong> Makes GET request to `/api/messages/:chatId`</p>
          <p>• <strong>3. Automatic Decryption:</strong> Messages are decrypted using your private key and sender's public key</p>
          <p>• <strong>4. Display:</strong> Shows both decrypted content and encrypted data for verification</p>
          <p>• <strong>Security:</strong> Server only stores encrypted content, cannot read actual messages</p>
        </CardContent>
      </Card>
    </div>
  );
};
