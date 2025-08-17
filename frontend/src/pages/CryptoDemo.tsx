import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Lock, Unlock, Send, MessageSquare, Users, Shield } from 'lucide-react';
import { useCrypto } from '@/hooks/useCrypto';
import { useAuth } from '@/contexts/AuthContext';
import { encryptMessage, decryptMessage } from '@/utils/crypto';
import { PeerKeyRetriever } from '@/components/PeerKeyRetriever';
import { EncryptedMessageExample } from '@/components/EncryptedMessageExample';


export const CryptoDemo = () => {
  const { user } = useAuth();
  const { hasKeys, initializeKeys, getPrivateKey } = useCrypto();
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [senderPublicKey, setSenderPublicKey] = useState('');

  const handleEncrypt = () => {
    if (!hasKeys || !message || !recipientPublicKey) {
      alert('Please ensure you have keys, a message, and recipient public key');
      return;
    }

    try {
      const privateKey = getPrivateKey();
      if (!privateKey) {
        alert('Private key not found');
        return;
      }

      const encrypted = encryptMessage(message, recipientPublicKey, privateKey);
      setEncryptedMessage(encrypted);
    } catch (error) {
      alert('Encryption failed: ' + error.message);
    }
  };

  const handleDecrypt = () => {
    if (!hasKeys || !encryptedMessage || !senderPublicKey) {
      alert('Please ensure you have keys, encrypted message, and sender public key');
      return;
    }

    try {
      const privateKey = getPrivateKey();
      if (!privateKey) {
        alert('Private key not found');
        return;
      }

      const decrypted = decryptMessage(encryptedMessage, senderPublicKey, privateKey);
      setDecryptedMessage(decrypted);
    } catch (error) {
      alert('Decryption failed: ' + error.message);
    }
  };

  const generateDemoKeys = () => {
    // This would normally come from another user's public key
    // For demo purposes, we'll generate a sample key
    const sampleKey = 'dGVzdC1wdWJsaWMta2V5LWZvci1kZW1vLXB1cnBvc2Vz';
    setRecipientPublicKey(sampleKey);
    setSenderPublicKey(sampleKey);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crypto Key Demo
          </h1>
          <p className="text-gray-600">
            Demonstrate end-to-end encryption using TweetNaCl
          </p>
        </div>

        {/* Key Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Key Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                {hasKeys ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Keys Available
                  </Badge>
                ) : (
                  <Badge variant="destructive">No Keys</Badge>
                )}
              </div>
              {!hasKeys && (
                <Button onClick={initializeKeys} size="sm">
                  Generate Keys
                </Button>
              )}
            </div>
            {user && (
              <p className="text-sm text-gray-600 mt-2">
                User ID: {user.id}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="encryption" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="encryption" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Encryption Demo
            </TabsTrigger>
            <TabsTrigger value="peer-keys" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Peer Key Retrieval
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Encrypted Messaging
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Instructions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encryption" className="space-y-6">
            {/* Encryption Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Encryption */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Encrypt Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="message">Message to Encrypt</Label>
                    <Input
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipientKey">Recipient Public Key</Label>
                    <Input
                      id="recipientKey"
                      value={recipientPublicKey}
                      onChange={(e) => setRecipientPublicKey(e.target.value)}
                      placeholder="Enter recipient's public key..."
                    />
                  </div>

                  <Button onClick={handleEncrypt} className="w-full" disabled={!hasKeys}>
                    <Lock className="h-4 w-4 mr-2" />
                    Encrypt
                  </Button>

                  {encryptedMessage && (
                    <div className="mt-4">
                      <Label>Encrypted Message</Label>
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                        {encryptedMessage}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Decryption */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5" />
                    Decrypt Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="encryptedMessage">Encrypted Message</Label>
                    <Input
                      id="encryptedMessage"
                      value={encryptedMessage}
                      onChange={(e) => setEncryptedMessage(e.target.value)}
                      placeholder="Enter encrypted message..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="senderKey">Sender Public Key</Label>
                    <Input
                      id="senderKey"
                      value={senderPublicKey}
                      onChange={(e) => setSenderPublicKey(e.target.value)}
                      placeholder="Enter sender's public key..."
                    />
                  </div>

                  <Button onClick={handleDecrypt} className="w-full" disabled={!hasKeys}>
                    <Unlock className="h-4 w-4 mr-2" />
                    Decrypt
                  </Button>

                  {decryptedMessage && (
                    <div className="mt-4">
                      <Label>Decrypted Message</Label>
                      <div className="bg-green-100 p-3 rounded text-sm">
                        {decryptedMessage}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Demo Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Demo Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={generateDemoKeys} variant="outline">
                    Generate Demo Keys
                  </Button>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">How to test encryption:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Generate your crypto keys (if not already done)</li>
                      <li>Click "Generate Demo Keys" to populate the key fields</li>
                      <li>Enter a message and click "Encrypt"</li>
                      <li>Copy the encrypted message to the decrypt section</li>
                      <li>Click "Decrypt" to see the original message</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="peer-keys">
            <PeerKeyRetriever />
          </TabsContent>

                     <TabsContent value="messaging">
             <EncryptedMessageExample />
           </TabsContent>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>Complete Crypto Demo Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Key Generation</h3>
                  <p className="text-sm text-gray-600">
                    • Your crypto keys are automatically generated when you log in<br />
                    • Private keys are stored locally in your browser<br />
                    • Public keys are sent to the server for distribution
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Peer Key Retrieval</h3>
                  <p className="text-sm text-gray-600">
                    • Use the "Peer Key Retrieval" tab to get other users' public keys<br />
                    • Enter user IDs to retrieve their public keys<br />
                    • Keys are cached for faster access<br />
                    • Use retrieved keys for message encryption
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Message Encryption</h3>
                  <p className="text-sm text-gray-600">
                    • Use the "Encryption Demo" tab to test encryption/decryption<br />
                    • Enter a message and recipient's public key<br />
                    • Click "Encrypt" to create an encrypted message<br />
                    • Copy the encrypted message to test decryption
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Encrypted Messaging</h3>
                  <p className="text-sm text-gray-600">
                    • Use the "Encrypted Messaging" tab for real-world messaging<br />
                    • Send encrypted messages to other users using their public keys<br />
                    • Messages are automatically encrypted and decrypted<br />
                    • View chat history with decrypted content
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">5. Real-World Usage</h3>
                  <p className="text-sm text-gray-600">
                    • In a real application, you would retrieve peer keys automatically<br />
                    • Messages would be encrypted before sending to the server<br />
                    • Only the intended recipient can decrypt the messages<br />
                    • This provides end-to-end encryption for secure communication
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
