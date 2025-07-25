
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Send, Search } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';

const LawyerMessages = () => {
  const [currentPage, setCurrentPage] = useState('messages');
  const [selectedClient, setSelectedClient] = useState(1);
  const [message, setMessage] = useState('');

  const clients = [
    { id: 1, name: "John Smith", lastMessage: "Thank you for your help", time: "10:30 AM", unread: 2 },
    { id: 2, name: "Sarah Johnson", lastMessage: "I have the documents ready", time: "9:15 AM", unread: 0 },
    { id: 3, name: "Mike Wilson", lastMessage: "When is our next meeting?", time: "Yesterday", unread: 1 }
  ];

  const messages = [
    { id: 1, sender: "client", text: "Hello, I need help with my case", time: "9:00 AM" },
    { id: 2, sender: "lawyer", text: "Of course! I'll review your documents and get back to you", time: "9:05 AM" },
    { id: 3, sender: "client", text: "Thank you for your help", time: "10:30 AM" }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto h-full">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-6">Messages</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Client List */}
              <Card className="shadow-soft border-0 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                          selectedClient === client.id ? 'bg-teal-50 border-l-4 border-l-teal' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-navy">{client.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{client.time}</span>
                            {client.unread > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {client.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="shadow-soft border-0 lg:col-span-2 flex flex-col">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg">
                    {clients.find(c => c.id === selectedClient)?.name || 'Select a conversation'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'lawyer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === 'lawyer'
                              ? 'bg-teal text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === 'lawyer' ? 'text-teal-100' : 'text-gray-500'
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} className="bg-teal hover:bg-teal-light text-white">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerMessages;
