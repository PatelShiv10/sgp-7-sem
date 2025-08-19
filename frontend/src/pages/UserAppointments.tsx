import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Star, MessageCircle, DollarSign, Video } from 'lucide-react';
import axios from 'axios';
import ReviewForm from '@/components/ReviewForm';
import PaymentModal from '@/components/PaymentModal';
import VideoCallInitiation from '@/components/VideoCallInitiation';

interface Appointment {
  _id: string;
  lawyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization: string;
  };
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  meetingType: 'video-call' | 'in-person';
  location: string;
  meetingLink: string;
  createdAt: string;
}

const UserAppointments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLawyerForPayment, setSelectedLawyerForPayment] = useState<{id: string, name: string} | null>(null);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedLawyerForVideoCall, setSelectedLawyerForVideoCall] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/appointments/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data.appointments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return diffMins;
  };

  const handleReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewDialog(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewDialog(false);
    setSelectedAppointment(null);
    toast({
      title: "Success",
      description: "Review submitted successfully! Your review will be visible to the lawyer.",
    });
    // Optionally reload appointments to reflect any changes
    loadAppointments();
  };

  const handlePaymentClick = (lawyerId: string, lawyerName: string) => {
    setSelectedLawyerForPayment({ id: lawyerId, name: lawyerName });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedLawyerForPayment(null);
    toast({
      title: "Success",
      description: "Payment completed successfully!",
    });
  };

  const handleWriteReview = (lawyerId: string) => {
    window.location.href = `/review/${lawyerId}`;
  };

  const handleVideoCallClick = (lawyerId: string, lawyerName: string) => {
    setSelectedLawyerForVideoCall({ id: lawyerId, name: lawyerName });
    setShowVideoCallModal(true);
  };

  const handleVideoCallInitiated = (callId: string) => {
    setShowVideoCallModal(false);
    setSelectedLawyerForVideoCall(null);
    // The VideoCallInitiation component will handle navigation
  };

  const canReview = (appointment: Appointment) => {
    return appointment.status === 'completed';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Appointments</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
            <p className="text-gray-500">Book your first appointment with a lawyer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {appointment.lawyerId.firstName} {appointment.lawyerId.lastName}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {appointment.lawyerId.specialization}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-gray-500" />
                     <span>{formatDate(appointment.startsAt)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Clock className="h-4 w-4 text-gray-500" />
                     <span>{formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)} ({getDuration(appointment.startsAt, appointment.endsAt)} min)</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-medium">Type:</span>
                     <span className="text-sm text-gray-600">
                       {appointment.meetingType === 'video-call' ? 'Video Call' : 'In-Person'}
                     </span>
                   </div>
                   {appointment.location && (
                     <div className="flex items-center gap-2">
                       <MapPin className="h-4 w-4 text-gray-500" />
                       <span className="text-sm">{appointment.location}</span>
                     </div>
                   )}
                 </div>

                {appointment.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Booked on {formatDate(appointment.createdAt)}
                  </div>
                  
                  <div className="flex gap-2">
                    {canReview(appointment) && (
                      <Dialog open={showReviewDialog && selectedAppointment?._id === appointment._id} onOpenChange={setShowReviewDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewClick(appointment)}
                            className="flex items-center gap-1"
                          >
                            <Star className="h-4 w-4" />
                            Write Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                            <DialogDescription>
                              Share your experience with {appointment.lawyerId.firstName} {appointment.lawyerId.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAppointment && (
                            <ReviewForm
                              lawyerId={selectedAppointment.lawyerId._id}
                              lawyerName={`${selectedAppointment.lawyerId.firstName} ${selectedAppointment.lawyerId.lastName}`}
                              appointmentId={selectedAppointment._id}
                              onReviewSubmitted={handleReviewSubmitted}
                              onCancel={() => setShowReviewDialog(false)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                    
                                                                              {appointment.status === 'confirmed' && appointment.meetingType === 'video-call' && (
                   <Button 
                     size="sm" 
                     className="bg-blue-600 hover:bg-blue-700"
                     onClick={() => handleVideoCallClick(
                       appointment.lawyerId._id,
                       `${appointment.lawyerId.firstName} ${appointment.lawyerId.lastName}`
                     )}
                   >
                     <Video className="h-4 w-4 mr-1" />
                     Start Video Call
                   </Button>
                 )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaymentClick(
                    appointment.lawyerId._id,
                    `${appointment.lawyerId.firstName} ${appointment.lawyerId.lastName}`
                  )}
                  className="flex items-center gap-1"
                >
                  <DollarSign className="h-4 w-4" />
                  Pay Lawyer
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWriteReview(appointment.lawyerId._id)}
                  className="flex items-center gap-1"
                >
                  <Star className="h-4 w-4" />
                  Write Review
                </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {selectedLawyerForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedLawyerForPayment(null);
          }}
          lawyerId={selectedLawyerForPayment.id}
          lawyerName={selectedLawyerForPayment.name}
          amount={1500}
          onSuccess={handlePaymentSuccess}
          showReviewButton={true}
        />
      )}

      {/* Video Call Initiation Modal */}
      {selectedLawyerForVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowVideoCallModal(false);
                setSelectedLawyerForVideoCall(null);
              }}
              className="absolute top-2 right-2 z-10"
            >
              ×
            </Button>
            <VideoCallInitiation
              lawyerId={selectedLawyerForVideoCall.id}
              lawyerName={selectedLawyerForVideoCall.name}
              onCallInitiated={handleVideoCallInitiated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;


