import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import ReviewForm from '@/components/ReviewForm';

interface Lawyer {
  _id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  location?: string;
}

const ReviewSubmission: React.FC = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (lawyerId) {
      loadLawyerDetails();
      checkExistingReview();
    }
  }, [lawyerId]);

  const loadLawyerDetails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/lawyers/${lawyerId}/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLawyer(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lawyer details",
        variant: "destructive",
      });
      navigate('/my-appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reviews/lawyer/${lawyerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if current user has already reviewed this lawyer
      const userReview = response.data.data.reviews.find(
        (review: any) => review.userId._id === user?.id
      );
      
      if (userReview) {
        setHasReviewed(true);
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setHasReviewed(true);
    toast({
      title: "Success",
      description: "Thank you for your review!",
    });
    
    // Redirect back to appointments after a short delay
    setTimeout(() => {
      navigate('/my-appointments');
    }, 2000);
  };

  const handleStartReview = () => {
    setShowReviewForm(true);
  };

  const handleBackToAppointments = () => {
    navigate('/my-appointments');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lawyer not found</p>
          <Button onClick={handleBackToAppointments}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  const lawyerName = `${lawyer.firstName} ${lawyer.lastName}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToAppointments}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Your Experience
          </h1>
          <p className="text-gray-600">
            Share your feedback about your consultation with {lawyerName}
          </p>
        </div>

        {/* Lawyer Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {lawyer.firstName.charAt(0)}{lawyer.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{lawyerName}</h2>
                {lawyer.specialization && (
                  <Badge variant="outline" className="mt-1">
                    {lawyer.specialization}
                  </Badge>
                )}
                {lawyer.location && (
                  <p className="text-sm text-gray-500 mt-1">{lawyer.location}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Status */}
        {hasReviewed ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Review Submitted!
              </h3>
              <p className="text-green-700 mb-4">
                Thank you for taking the time to share your experience with {lawyerName}.
              </p>
              <Button onClick={handleBackToAppointments}>
                Back to Appointments
              </Button>
            </CardContent>
          </Card>
        ) : showReviewForm ? (
          <Card>
            <CardContent className="p-6">
              <ReviewForm
                lawyerId={lawyer._id}
                lawyerName={lawyerName}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Write Your Review
              </CardTitle>
              <CardDescription>
                Your feedback helps other clients and improves our services
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="h-8 w-8 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    How was your experience with {lawyerName}?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Share your thoughts about the consultation, communication, and overall service quality.
                  </p>
                </div>
                <Button onClick={handleStartReview} size="lg">
                  <Star className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Guidelines */}
        {!hasReviewed && !showReviewForm && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Review Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  Be honest and constructive in your feedback
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  Focus on the lawyer's expertise, communication, and professionalism
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  Avoid personal attacks or inappropriate language
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  Your review will help other clients make informed decisions
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewSubmission;
