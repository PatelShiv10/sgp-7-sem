import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  MessageSquare,
  Lock,
  Unlock,
  Users,
  User,
  Clock,
  Check,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useEncryptedMessages } from '@/hooks/useEncryptedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const EncryptedMessageDemo = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    messages,
    chats,
    currentChatId,
    isLoading,
    unreadCount,
    sendMessage,
    loadChatMessages,
    loadUserChats,
    removeMessage,
    getDecryptedMessages,
    startNewChat
  } = useEncryptedMessages();

  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !receiverId.trim()) {
      toast({
        title: "Error",
        description: "Please enter both message and receiver ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage(newMessage.trim(), receiverId.trim());
      setNewMessage('');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleStartChat = () => {
    if (!receiverId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a receiver ID",
        variant: "destructive",
      });
      return;
    }

    const chatId = startNewChat(receiverId.trim());
    setSelectedChatId(chatId);
    loadChatMessages(chatId);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    loadChatMessages(chatId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await removeMessage(messageId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const decryptedMessages = getDecryptedMessages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encrypted Message Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-medium">Current User:</span>
                <Badge variant="outline" className="ml-2">
                  {user?.firstName} {user?.lastName} ({user?.id})
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Unread Messages:</span>
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              </div>
            </div>
            <Button onClick={loadUserChats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Chats
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Message Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Encrypted Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="receiverId">Receiver User ID</Label>
              <Input
                id="receiverId"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="Enter receiver's user ID..."
              />
            </div>

            <div>
              <Label htmlFor="newMessage">Message</Label>
              <Textarea
                id="newMessage"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStartChat}
                variant="outline"
                disabled={!receiverId.trim()}
              >
                <Users className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !receiverId.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chats List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Chats ({chats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>No chats yet</p>
                <p className="text-sm">Send a message to start a chat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.chatId}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${selectedChatId === chat.chatId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    onClick={() => handleSelectChat(chat.chatId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        Chat: {chat.chatId.substring(0, 20)}...
                      </span>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Messages: {chat.messageCount}</p>
                      <p>Last: {formatDate(chat.lastMessage.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
              {currentChatId && (
                <Badge variant="outline" className="text-xs">
                  {currentChatId.substring(0, 15)}...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentChatId ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Select a chat to view messages</p>
              </div>
            ) : decryptedMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No messages in this chat</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {decryptedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border rounded-md ${message.senderId._id === user?.id
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
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                        {message.senderId._id === user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Decrypted:</span>
                        <p className="mt-1">{message.decryptedContent}</p>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <div>
                          <span className="font-medium">Encrypted:</span>
                          <p className="font-mono break-all">
                            {message.encryptedContent.substring(0, 50)}...
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Nonce:</span>
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
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test Encrypted Messaging</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Setup:</strong> Both users need to have crypto keys generated (automatic on login)</p>
          <p>• <strong>Send Message:</strong> Enter receiver's user ID and message, then click "Send Message"</p>
          <p>• <strong>Encryption:</strong> Message is encrypted with receiver's public key and your private key</p>
          <p>• <strong>Storage:</strong> Only encrypted content and nonce are stored on the server</p>
          <p>• <strong>Decryption:</strong> Messages are automatically decrypted when retrieved</p>
          <p>• <strong>Security:</strong> Server cannot read the actual message content</p>
        </CardContent>
      </Card>
    </div>
  );
};
