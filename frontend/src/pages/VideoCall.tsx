
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Settings, ArrowLeft } from 'lucide-react';
import { useVideoCall } from '@/hooks/useVideoCall';
import axios from 'axios';

const VideoCall: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    state,
    localStream,
    remoteStream,
    startCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useVideoCall({
    callId: callId || '',
    userId: user?.id || '',
    onCallEnded: () => {
      toast({
        title: "Call Ended",
        description: "The call has been ended",
      });
    }
  });

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'ringing': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackToAppointments = () => {
    navigate('/my-appointments');
  };

  const handleEndCall = async () => {
    try {
      // Update call status in backend
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/video-calls/${callId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating call status:', error);
    }
    
    endCall();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToAppointments}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Video Call</h1>
              <p className="text-gray-400">Call ID: {callId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(state.callStatus)}>
              {state.callStatus.charAt(0).toUpperCase() + state.callStatus.slice(1)}
            </Badge>
            {state.isCallActive && (
              <div className="text-white font-mono">
                {formatDuration(state.callDuration)}
              </div>
            )}
            {state.remoteUser && (
              <div className="text-white text-sm">
                Connected to: {state.remoteUser.name}
              </div>
            )}
          </div>
        </div>

        {/* Video Containers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Local Video */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {state.isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                {state.isMuted && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Muted
                  </div>
                )}
                {!state.isConnected && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                    Connecting...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remote Video */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {state.remoteUser ? state.remoteUser.name : 'Remote User'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!state.isCallActive && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">?</span>
                      </div>
                      <p className="text-gray-400">
                        {state.callStatus === 'idle' && 'Click "Start Call" to begin'}
                        {state.callStatus === 'connecting' && 'Connecting...'}
                        {state.callStatus === 'ringing' && 'Ringing...'}
                        {state.callStatus === 'ended' && 'Call ended'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex justify-center items-center gap-4">
              {/* Mute Button */}
              <Button
                onClick={toggleMute}
                variant={state.isMuted ? "destructive" : "outline"}
                size="lg"
                className="w-16 h-16 rounded-full"
                disabled={!state.isInCall}
              >
                {state.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {/* Video Toggle Button */}
              <Button
                onClick={toggleVideo}
                variant={state.isVideoOff ? "destructive" : "outline"}
                size="lg"
                className="w-16 h-16 rounded-full"
                disabled={!state.isInCall}
              >
                {state.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>

              {/* Start/End Call Button */}
              {!state.isInCall ? (
                <Button
                  onClick={startCall}
                  disabled={state.callStatus === 'connecting' || !state.isConnected}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              )}

              {/* Settings Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Call Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {state.callStatus === 'idle' && 'Click the green button to start the call'}
            {state.callStatus === 'connecting' && 'Connecting to remote user...'}
            {state.callStatus === 'ringing' && 'Calling remote user...'}
            {state.callStatus === 'connected' && 'Call in progress'}
            {state.callStatus === 'ended' && 'Call ended'}
          </p>
          {!state.isConnected && (
            <p className="text-yellow-400 text-sm mt-2">
              Connecting to signaling server...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
