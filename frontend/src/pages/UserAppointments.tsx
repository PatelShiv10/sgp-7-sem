import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  _id: string;
  lawyerId: { _id: string; firstName: string; lastName: string; email: string };
  clientId: { _id: string; firstName: string; lastName: string; email: string };
  startsAt: string; endsAt: string; status: string; notes: string; meetingType: string;
}

const UserAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/appointments/client/${user.id}?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setAppointments(data?.data?.appointments || []);
      } catch (e) {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Appointments</h1>
      {appointments.length === 0 ? (
        <Card><CardContent className="pt-6">No appointments yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.lawyerId.firstName} {appointment.lawyerId.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.lawyerId.email}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Date:</span>
                      <span className="text-sm text-gray-600">{new Date(appointment.startsAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Time:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(appointment.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(appointment.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAppointments;


