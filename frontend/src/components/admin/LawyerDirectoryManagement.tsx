
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Check, X, Edit, Trash2, MessageCircle, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  location: string;
  experience: string;
  hourlyRate: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  rating: number;
  reviews: number;
  connectionsCount: number;
  messagesCount: number;
  joinedDate: string;
  lastActive: string;
}

export const LawyerDirectoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const { toast } = useToast();

  // Mock lawyer data - in real app, this would come from a state management solution
  const [lawyerData, setLawyerData] = useState<Lawyer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      specialization: ['Criminal Law', 'Family Law'],
      location: 'New York, NY',
      experience: '15 years',
      hourlyRate: '$350',
      status: 'approved',
      verified: true,
      rating: 4.9,
      reviews: 124,
      connectionsCount: 89,
      messagesCount: 234,
      joinedDate: '2023-06-15',
      lastActive: '2024-01-20',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      specialization: ['Corporate Law', 'Real Estate'],
      location: 'Los Angeles, CA',
      experience: '12 years',
      hourlyRate: '$400',
      status: 'pending',
      verified: false,
      rating: 4.8,
      reviews: 98,
      connectionsCount: 45,
      messagesCount: 102,
      joinedDate: '2024-01-10',
      lastActive: '2024-01-19',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      specialization: ['Personal Injury', 'Immigration'],
      location: 'Chicago, IL',
      experience: '10 years',
      hourlyRate: '$275',
      status: 'rejected',
      verified: true,
      rating: 4.7,
      reviews: 156,
      connectionsCount: 67,
      messagesCount: 189,
      joinedDate: '2023-09-22',
      lastActive: '2024-01-18',
    },
  ]);

  const filteredLawyers = lawyerData.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || lawyer.status === filterStatus;
    const matchesSpecialization = filterSpecialization === 'all' || 
                                  lawyer.specialization.some(spec => spec.toLowerCase().includes(filterSpecialization.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const handleStatusChange = (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setLawyerData(prevData => 
      prevData.map(lawyer => 
        lawyer.id === id ? { ...lawyer, status: newStatus } : lawyer
      )
    );
    
    const lawyer = lawyerData.find(l => l.id === id);
    toast({
      title: "Status Updated",
      description: `${lawyer?.name} has been ${newStatus}`,
      variant: newStatus === 'approved' ? 'default' : newStatus === 'rejected' ? 'destructive' : 'default',
    });
  };

  const handleDeleteLawyer = (id: string) => {
    const lawyer = lawyerData.find(l => l.id === id);
    setLawyerData(prevData => prevData.filter(lawyer => lawyer.id !== id));
    
    toast({
      title: "Lawyer Deleted",
      description: `${lawyer?.name} has been removed from the directory`,
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Analytics data
  const analytics = {
    totalLawyers: lawyerData.length,
    approvedCount: lawyerData.filter(l => l.status === 'approved').length,
    pendingCount: lawyerData.filter(l => l.status === 'pending').length,
    rejectedCount: lawyerData.filter(l => l.status === 'rejected').length,
    verifiedCount: lawyerData.filter(l => l.verified).length,
    avgRating: lawyerData.length > 0 ? (lawyerData.reduce((sum, l) => sum + l.rating, 0) / lawyerData.length).toFixed(1) : '0',
  };

  const specializations = [
    'Criminal Law', 'Family Law', 'Corporate Law', 'Real Estate', 
    'Personal Injury', 'Immigration', 'Bankruptcy', 'Tax Law'
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lawyers</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLawyers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.verifiedCount} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalLawyers > 0 ? Math.round((analytics.approvedCount / analytics.totalLawyers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <MessageCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Check className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgRating}</div>
            <p className="text-xs text-muted-foreground">
              Overall platform rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lawyer Directory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lawyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec.toLowerCase()}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lawyers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Connections</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{lawyer.name}</div>
                        {lawyer.verified && (
                          <Shield className="h-4 w-4 text-teal-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specialization.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {lawyer.specialization.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lawyer.specialization.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.location}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lawyer.status)}>
                        {lawyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">{lawyer.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({lawyer.reviews})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.connectionsCount}</TableCell>
                    <TableCell>{lawyer.messagesCount}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLawyer(lawyer)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Lawyer Details</DialogTitle>
                            </DialogHeader>
                            {selectedLawyer && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Location</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.location}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Experience</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.experience}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Hourly Rate</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.hourlyRate}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Specializations</label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedLawyer.specialization.map((spec, index) => (
                                      <Badge key={index} variant="outline">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Rating</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.rating} ({selectedLawyer.reviews} reviews)</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Connections</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.connectionsCount}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Messages</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.messagesCount}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge className={getStatusColor(selectedLawyer.status)}>
                                      {selectedLawyer.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleStatusChange(selectedLawyer.id, 'approved')}
                                    disabled={selectedLawyer.status === 'approved'}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleStatusChange(selectedLawyer.id, 'rejected')}
                                    disabled={selectedLawyer.status === 'rejected'}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleDeleteLawyer(selectedLawyer.id)}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
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
