
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Settings } from 'lucide-react';
import axios from 'axios';

const VideoCall: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInCall, setIsInCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize WebRTC
    initializeWebRTC();
    
    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create RTCPeerConnection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });

      // Handle incoming remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to remote peer via signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current?.connectionState);
        if (peerConnectionRef.current?.connectionState === 'connected') {
          setCallStatus('connected');
          startCallTimer();
        }
      };

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      toast({
        title: "Error",
        description: "Failed to access camera/microphone",
        variant: "destructive",
      });
    }
  };

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      
      // Create offer
      if (peerConnectionRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        // Send offer to signaling server
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/video-calls/${callId}/offer`, {
          offer: offer
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setIsInCall(true);
      setIsCallActive(true);
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive",
      });
      setCallStatus('idle');
    }
  };

  const endCall = async () => {
    try {
      // Update call status in backend
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/video-calls/${callId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      // Clear timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      
      setIsInCall(false);
      setIsCallActive(false);
      setCallStatus('ended');
      setCallDuration(0);
      
      toast({
        title: "Call Ended",
        description: "The call has been ended",
      });
      
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const startCallTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Call</h1>
            <p className="text-gray-400">Call ID: {callId}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(callStatus)}>
              {callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
            </Badge>
            {isCallActive && (
              <div className="text-white font-mono">
                {formatDuration(callDuration)}
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
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                {isMuted && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Muted
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remote Video */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Remote User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isCallActive && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">?</span>
                      </div>
                      <p className="text-gray-400">Waiting for connection...</p>
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
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {/* Video Toggle Button */}
              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "outline"}
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>

              {/* Start/End Call Button */}
              {!isInCall ? (
                <Button
                  onClick={startCall}
                  disabled={callStatus === 'connecting'}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={endCall}
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
            {callStatus === 'idle' && 'Click the green button to start the call'}
            {callStatus === 'connecting' && 'Connecting to remote user...'}
            {callStatus === 'connected' && 'Call in progress'}
            {callStatus === 'ended' && 'Call ended'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
