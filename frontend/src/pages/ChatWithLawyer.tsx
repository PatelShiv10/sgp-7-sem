
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, Phone, Video, Bug, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryptedMessages } from '@/hooks/useEncryptedMessages';
import { testEncryptionDecryption } from '@/utils/crypto';
import { 
  initializeCryptoKeys, 
  regenerateCryptoKeys, 
  validateCryptoKeys, 
  getCryptoKeyInfo 
} from '@/utils/cryptoKeyManager';

const ChatWithLawyer = () => {
  const { lawyerId } = useParams();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const {
    loadChatMessages,
    sendMessage,
    getDecryptedMessages,
    generateChatId,
  } = useEncryptedMessages();
  const decryptedMessages = getDecryptedMessages();

  const userId = user?.id;

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [decryptedMessages.length]);

  useEffect(() => {
    const init = async () => {
      if (!lawyerId || !userId) return;
      const chatId = generateChatId(userId, lawyerId);
      await loadChatMessages(chatId);
    };
    init();
  }, [lawyerId, userId, loadChatMessages, generateChatId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !lawyerId || !userId) return;
    const text = inputText;
    setInputText('');
    try {
      await sendMessage(text, lawyerId);
      const chatId = generateChatId(userId, lawyerId);
      await loadChatMessages(chatId);
    } catch (error) {
      // Restore the input text if sending failed
      setInputText(text);
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDebugTest = () => {
    console.log('🧪 Running encryption/decryption test...');
    const testResult = testEncryptionDecryption();
    if (testResult) {
      alert('✅ Encryption/Decryption test passed! The crypto system is working correctly.');
    } else {
      alert('❌ Encryption/Decryption test failed! Check console for details.');
    }
  };

  const handleRegenerateKeys = async () => {
    if (!user?.id) {
      alert('❌ User not authenticated. Please log in first.');
      return;
    }
    
    try {
      console.log('🔑 Regenerating crypto keys...');
      const success = await regenerateCryptoKeys(user.id);
      if (success) {
        alert('✅ Crypto keys regenerated successfully! Please refresh the page.');
        window.location.reload();
      } else {
        alert('❌ Failed to regenerate crypto keys. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating keys:', error);
      alert('❌ Error regenerating crypto keys. Please try again.');
    }
  };

  const handleInitializeKeys = async () => {
    if (!user?.id) {
      alert('❌ User not authenticated. Please log in first.');
      return;
    }
    
    try {
      console.log('🔑 Initializing crypto keys...');
      const success = await initializeCryptoKeys(user.id);
      if (success) {
        alert('✅ Crypto keys initialized successfully! Please refresh the page.');
        window.location.reload();
      } else {
        alert('❌ Failed to initialize crypto keys. Please try again.');
      }
    } catch (error) {
      console.error('Error initializing keys:', error);
      alert('❌ Error initializing crypto keys. Please try again.');
    }
  };

  const handleValidateKeys = async () => {
    if (!user?.id) {
      alert('❌ User not authenticated. Please log in first.');
      return;
    }
    
    try {
      console.log('🔍 Validating crypto keys...');
      const validation = await validateCryptoKeys(user.id);
      if (validation.isValid) {
        alert('✅ Crypto keys are valid and working correctly!');
      } else {
        alert(`❌ Crypto keys validation failed: ${validation.error}`);
      }
    } catch (error) {
      console.error('Error validating keys:', error);
      alert('❌ Error validating crypto keys. Please try again.');
    }
  };

  const handleShowKeyInfo = () => {
    if (!user?.id) {
      alert('❌ User not authenticated. Please log in first.');
      return;
    }
    
    const keyInfo = getCryptoKeyInfo(user.id);
    console.log('🔑 Crypto Key Information:', keyInfo);
    alert(`🔑 Crypto Key Status:\n\n` +
          `Has Private Key: ${keyInfo.hasPrivateKey ? '✅ Yes' : '❌ No'}\n` +
          `Private Key Length: ${keyInfo.privateKeyLength}\n` +
          `Is Initialized: ${keyInfo.status.isInitialized ? '✅ Yes' : '❌ No'}\n\n` +
          `Check console for detailed information.`);
  };

  const lawyer = {
    name: 'Lawyer',
    specialization: 'General Law',
    avatar: 'L',
    status: 'online',
    hourlyRate: 250
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-soft p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/find-lawyer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal text-white rounded-full flex items-center justify-center font-semibold">
                {lawyer.avatar}
              </div>
              <div>
                <h2 className="font-semibold text-navy">{lawyer.name}</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{lawyer.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDebugTest}>
              <Bug className="h-4 w-4 mr-2" />
              Debug Crypto
            </Button>
            <Button variant="outline" size="sm" onClick={handleRegenerateKeys}>
              <Key className="h-4 w-4 mr-2" />
              Regenerate Keys
            </Button>
            <Button variant="outline" size="sm" onClick={handleInitializeKeys}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize Keys
            </Button>
            <Button variant="outline" size="sm" onClick={handleValidateKeys}>
              <Key className="h-4 w-4 mr-2" />
              Validate Keys
            </Button>
            <Button variant="outline" size="sm" onClick={handleShowKeyInfo}>
              <Key className="h-4 w-4 mr-2" />
              Show Key Info
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/video-call/${lawyerId}-${Date.now()}`}>
                <Video className="h-4 w-4 mr-2" />
                Video
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-teal hover:bg-teal-light text-white">
              <Link to={`/booking-new/${lawyerId}`}>Book Consultation</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 shadow-soft border-0 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Decryption Error Warning */}
                {decryptedMessages.some(msg => (msg as any).decryptedContent?.includes('[Encrypted Message -')) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Some messages could not be decrypted
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This may happen if crypto keys are missing or corrupted. Try refreshing the page or regenerating your crypto keys.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {decryptedMessages.map((message) => {
                  const isOwn = message.senderId._id === userId;
                  const decryptedContent = (message as any).decryptedContent;
                  const isDecryptionError = decryptedContent && decryptedContent.includes('[Encrypted Message -');
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`p-4 rounded-lg ${
                          isOwn ? 'bg-teal text-white' : 'bg-gray-100'
                        } ${isDecryptionError ? 'border-2 border-red-300 bg-red-50' : ''}`}>
                          <p className={`leading-relaxed ${isDecryptionError ? 'text-red-600 font-medium' : ''}`}>
                            {isDecryptionError ? (
                              <span className="flex items-center">
                                <span className="mr-2">🔒</span>
                                {decryptedContent}
                              </span>
                            ) : (
                              decryptedContent
                            )}
                          </p>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${
                          isOwn ? 'text-right' : 'text-left'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-gray-300 focus:border-teal focus:ring-teal"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="bg-teal hover:bg-teal-light text-white px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Lawyer Info Sidebar */}
          <div className="w-80">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg text-navy">Lawyer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal text-white rounded-full flex items-center justify-center text-xl font-semibold mx-auto mb-3">
                    {lawyer.avatar}
                  </div>
                  <h3 className="font-semibold text-navy">{lawyer.name}</h3>
                  <p className="text-teal">{lawyer.specialization}</p>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">${lawyer.hourlyRate}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">&lt; 5 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-600">Online</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This chat is for initial consultation. 
                    For detailed legal advice, please book a formal consultation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithLawyer;