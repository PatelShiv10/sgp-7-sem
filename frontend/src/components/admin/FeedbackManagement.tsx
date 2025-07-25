
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, CheckCircle, Clock, AlertCircle, MessageSquare, TrendingUp } from 'lucide-react';

interface Feedback {
  id: string;
  user: string;
  type: 'bug' | 'suggestion' | 'general';
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
}

export const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Mock feedback data
  const feedbackData: Feedback[] = [
    {
      id: '1',
      user: 'john.doe@email.com',
      type: 'bug',
      subject: 'Login issue on mobile',
      message: 'Unable to login using mobile browser. Getting error message.',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      user: 'jane.smith@email.com',
      type: 'suggestion',
      subject: 'Add dark mode feature',
      message: 'Would love to have a dark mode option for better user experience.',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-14T14:20:00Z',
      resolvedAt: '2024-01-16T09:15:00Z',
    },
    {
      id: '3',
      user: 'mike.johnson@email.com',
      type: 'general',
      subject: 'Great platform!',
      message: 'Love using this platform for finding lawyers. Very helpful!',
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-13T16:45:00Z',
      resolvedAt: '2024-01-13T17:00:00Z',
    },
  ];

  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesSearch = feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || feedback.type === filterType;
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'pending' | 'resolved') => {
    console.log(`Updating feedback ${id} to ${newStatus}`);
    // Implementation would update the feedback status
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Analytics data
  const analytics = {
    totalFeedback: feedbackData.length,
    pendingCount: feedbackData.filter(f => f.status === 'pending').length,
    resolvedCount: feedbackData.filter(f => f.status === 'resolved').length,
    bugCount: feedbackData.filter(f => f.type === 'bug').length,
    suggestionCount: feedbackData.filter(f => f.type === 'suggestion').length,
    generalCount: feedbackData.filter(f => f.type === 'general').length,
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bug Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bugCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.bugCount / analytics.totalFeedback) * 100)}% of total feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.suggestionCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.suggestionCount / analytics.totalFeedback) * 100)}% of total feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">General Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.generalCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.generalCount / analytics.totalFeedback) * 100)}% of total feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug">Bug Reports</SelectItem>
                <SelectItem value="suggestion">Suggestions</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.user}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(feedback.type)}>
                        {feedback.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{feedback.subject}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(feedback.priority)}>
                        {feedback.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFeedback(feedback)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Feedback Details</DialogTitle>
                            </DialogHeader>
                            {selectedFeedback && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">User</label>
                                    <p className="text-sm text-gray-600">{selectedFeedback.user}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p className="text-sm text-gray-600">{selectedFeedback.type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <p className="text-sm text-gray-600">{selectedFeedback.priority}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <p className="text-sm text-gray-600">{selectedFeedback.status}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subject</label>
                                  <p className="text-sm text-gray-600">{selectedFeedback.subject}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Message</label>
                                  <p className="text-sm text-gray-600">{selectedFeedback.message}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleStatusChange(selectedFeedback.id, 'resolved')}
                                    disabled={selectedFeedback.status === 'resolved'}
                                    className="bg-teal hover:bg-teal-light text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Resolved
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleStatusChange(selectedFeedback.id, 'pending')}
                                    disabled={selectedFeedback.status === 'pending'}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Mark as Pending
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
