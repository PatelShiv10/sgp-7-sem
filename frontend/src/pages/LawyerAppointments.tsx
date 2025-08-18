
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, Video } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { useAuth } from '@/contexts/AuthContext';

const LawyerAppointments = () => {
  const [currentPage, setCurrentPage] = useState('appointments');
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/appointments/lawyer/${user.id}?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load appointments');
        const data = await res.json();
        const list = data?.data?.appointments || [];
        setAppointments(list);
      } catch (e) {
        setError('Failed to load appointments');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {loading && <div className="p-6 text-gray-500">Loading appointments...</div>}
            {error && <div className="p-6 text-red-600">{error}</div>}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Appointments</h1>
              <Button className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                No appointments found.
                              </TableCell>
                            </TableRow>
                          ) : appointments.map((appointment: any) => (
                            <TableRow key={appointment._id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                      {appointment.clientId?.firstName?.charAt(0) || 'C'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{appointment.clientId?.firstName} {appointment.clientId?.lastName}</p>
                                    <p className="text-sm text-gray-600">{appointment.clientId?.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{formatDate(appointment.startsAt)}</p>
                                    <p className="text-sm text-gray-600">{formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{appointment.meetingType?.replace('-', ' ')}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>{Math.round((new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime())/60000)} mins</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <User className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Video className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4 p-4">
                      {appointments.length === 0 ? (
                        <Card className="border border-gray-200">
                          <CardContent className="p-6 text-center text-gray-500">
                            No appointments found.
                          </CardContent>
                        </Card>
                      ) : appointments.map((appointment: any) => (
                        <Card key={appointment._id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {appointment.clientId?.firstName?.charAt(0) || 'C'}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-navy">{appointment.clientId?.firstName} {appointment.clientId?.lastName}</h3>
                                  <p className="text-sm text-gray-600">{appointment.clientId?.email}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="font-medium">{formatDate(appointment.startsAt)}</p>
                                  <p className="text-gray-600">{formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="font-medium">{Math.round((new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime())/60000)} mins</p>
                                  <p className="text-gray-600 capitalize">{appointment.meetingType?.replace('-', ' ')}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <User className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Video className="h-4 w-4 mr-1" />
                                Video
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card className="shadow-soft border-0">
                  <CardContent className="p-8">
                    <div className="text-center text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Calendar view will be implemented here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="today">
                <div className="grid gap-6">
                  {appointments
                    .filter(apt => apt.date === "2024-01-15")
                    .map((appointment) => (
                      <Card key={appointment.id} className="shadow-soft border-0">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {appointment.client.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-navy">{appointment.client}</h3>
                                <p className="text-gray-600">{appointment.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{appointment.time}</p>
                              <p className="text-sm text-gray-600">{appointment.duration}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerAppointments;
