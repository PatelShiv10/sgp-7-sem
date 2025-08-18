import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

interface VideoCallState {
  isConnected: boolean;
  isInCall: boolean;
  isCallActive: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  callStatus: 'idle' | 'connecting' | 'connected' | 'ended' | 'ringing';
  callDuration: number;
  remoteUser: {
    id: string;
    name: string;
  } | null;
}

interface UseVideoCallProps {
  callId: string;
  userId: string;
  onCallEnded?: () => void;
}

export const useVideoCall = ({ callId, userId, onCallEnded }: UseVideoCallProps) => {
  const { toast } = useToast();
  const [state, setState] = useState<VideoCallState>({
    isConnected: false,
    isInCall: false,
    isCallActive: false,
    isMuted: false,
    isVideoOff: false,
    callStatus: 'idle',
    callDuration: 0,
    remoteUser: null
  });

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to signaling server');
      setState(prev => ({ ...prev, isConnected: true }));
      
      // Join the call room
      socket.emit('join-call', callId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // WebRTC Signaling Events
    socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received offer from:', data.from);
      await handleOffer(data.offer);
    });

    socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received answer from:', data.from);
      await handleAnswer(data.answer);
    });

    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log('Received ICE candidate from:', data.from);
      await handleIceCandidate(data.candidate);
    });

    // Call Events
    socket.on('call-started', () => {
      console.log('Call started');
      setState(prev => ({ 
        ...prev, 
        callStatus: 'connected',
        isCallActive: true 
      }));
      startCallTimer();
    });

    socket.on('call-ended', () => {
      console.log('Call ended by remote user');
      endCall();
    });

    socket.on('user-joined', (userData: { id: string; name: string }) => {
      console.log('User joined:', userData);
      setState(prev => ({ ...prev, remoteUser: userData }));
    });

    socket.on('user-left', () => {
      console.log('User left the call');
      setState(prev => ({ ...prev, remoteUser: null }));
    });

    return () => {
      socket.disconnect();
    };
  }, [callId]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;

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
        console.log('Received remote stream');
        remoteStreamRef.current = event.streams[0];
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            callId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current?.connectionState);
        if (peerConnectionRef.current?.connectionState === 'connected') {
          setState(prev => ({ 
            ...prev, 
            callStatus: 'connected',
            isCallActive: true 
          }));
          startCallTimer();
        }
      };

      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      toast({
        title: "Error",
        description: "Failed to access camera/microphone",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Handle incoming offer
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      const success = await initializeWebRTC();
      if (!success) return;
    }

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('answer', {
          callId,
          answer: answer
        });
      }

      setState(prev => ({ 
        ...prev, 
        callStatus: 'connecting',
        isInCall: true 
      }));
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    }
  };

  // Start call
  const startCall = async () => {
    try {
      const success = await initializeWebRTC();
      if (!success) return;

      setState(prev => ({ 
        ...prev, 
        callStatus: 'connecting',
        isInCall: true 
      }));

      // Create and send offer
      if (peerConnectionRef.current && socketRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socketRef.current.emit('offer', {
          callId,
          offer: offer
        });
      }
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, callStatus: 'idle' }));
    }
  };

  // End call
  const endCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Emit call ended event
    if (socketRef.current) {
      socketRef.current.emit('call-ended', callId);
    }
    
    setState(prev => ({
      ...prev,
      isInCall: false,
      isCallActive: false,
      callStatus: 'ended',
      callDuration: 0,
      remoteUser: null
    }));

    onCallEnded?.();
  }, [callId, onCallEnded]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoOff: !videoTrack.enabled }));
      }
    }
  };

  // Start call timer
  const startCallTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    state,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    startCall,
    endCall,
    toggleMute,
    toggleVideo
  };
};
