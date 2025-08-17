import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ClientDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface ClientWithDetails {
  clientId: string;
  clientDetails: ClientDetails | null;
  lastMessageAt: string;
}

interface ActiveClientsResponse {
  success: boolean;
  message: string;
  data: Array<{
    clientId: string;
    lastMessageAt: string;
  }>;
  clientsWithDetails: ClientWithDetails[];
}

const ActiveClients: React.FC = () => {
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchActiveClients = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/lawyer/${user.id}/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ActiveClientsResponse = await response.json();

      if (data.success) {
        setClients(data.clientsWithDetails || []);
      } else {
        throw new Error(data.message || 'Failed to fetch active clients');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active clients';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveClients();
  }, [user?.id]);

  const handleClientClick = (client: ClientWithDetails) => {
    // Navigate to chat with this client
    // You can implement navigation logic here
    console.log('Navigate to chat with client:', client.clientDetails?.firstName);

    // Example: Navigate to chat page
    // window.location.href = `/chat/${client.clientId}`;
    // Or use React Router navigation
    // navigate(`/chat/${client.clientId}`);
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isRecentActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // Activity within last 24 hours
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Error loading active clients</p>
              <p className="text-sm mt-2">{error}</p>
              <Button
                onClick={fetchActiveClients}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Clients</h1>
        <p className="text-gray-600">Clients with recent chat conversations</p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No active clients found
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have any clients with active conversations at the moment.
              </p>
              <p className="text-sm text-gray-500">
                Active clients will appear here once they start chatting with you.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card
              key={client.clientId}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleClientClick(client)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={client.clientDetails?.profileImage}
                      alt={`${client.clientDetails?.firstName} ${client.clientDetails?.lastName}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {client.clientDetails ?
                        getInitials(client.clientDetails.firstName, client.clientDetails.lastName) :
                        'CL'
                      }
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {client.clientDetails?.firstName} {client.clientDetails?.lastName}
                      </h3>
                      {isRecentActivity(client.lastMessageAt) && (
                        <Badge variant="default" className="text-xs">
                          Recent
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 truncate">
                      {client.clientDetails?.email}
                    </p>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Last activity: {formatLastActivity(client.lastMessageAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClientClick(client);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {clients.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{clients.length}</div>
                  <div className="text-sm text-gray-600">Total Active Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {clients.filter(client => isRecentActivity(client.lastMessageAt)).length}
                  </div>
                  <div className="text-sm text-gray-600">Recent Activity (24h)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {clients.filter(client => !isRecentActivity(client.lastMessageAt)).length}
                  </div>
                  <div className="text-sm text-gray-600">Older Conversations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ActiveClients;
