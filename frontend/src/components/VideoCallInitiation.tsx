import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Video, User, Clock, MapPin } from 'lucide-react';
import axios from 'axios';

interface VideoCallInitiationProps {
  lawyerId: string;
  lawyerName: string;
  appointmentId?: string;
  onCallInitiated?: (callId: string) => void;
}

const VideoCallInitiation: React.FC<VideoCallInitiationProps> = ({
  lawyerId,
  lawyerName,
  appointmentId,
  onCallInitiated
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInitiating, setIsInitiating] = useState(false);

  const initiateCall = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to start a video call",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInitiating(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/video-calls/initiate', {
        lawyerId,
        clientId: user.id,
        appointmentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { callId } = response.data.data;
      
      toast({
        title: "Call Initiated",
        description: "Video call has been initiated successfully",
      });

      // Call the callback if provided
      if (onCallInitiated) {
        onCallInitiated(callId);
      } else {
        // Navigate to video call page
        navigate(`/video-call/${callId}`);
      }

    } catch (error: any) {
      console.error('Error initiating call:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to initiate video call",
        variant: "destructive",
      });
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Start Video Call
        </CardTitle>
        <CardDescription>
          Initiate a video consultation with {lawyerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lawyer Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{lawyerName}</h3>
            <p className="text-sm text-gray-600">Lawyer</p>
          </div>
        </div>

        {/* Call Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Duration: Flexible</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Location: Online</span>
          </div>
        </div>

        {/* Call Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Call Features:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              HD Video
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Crystal Clear Audio
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Screen Sharing
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Secure Connection
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={initiateCall}
            disabled={isInitiating}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isInitiating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Initiating...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Start Call
              </>
            )}
          </Button>
        </div>

        {/* Call Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Ensure you have a stable internet connection</p>
          <p>• Allow camera and microphone access when prompted</p>
          <p>• Find a quiet environment for better audio quality</p>
          <p>• Have your documents ready if needed</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCallInitiation;
