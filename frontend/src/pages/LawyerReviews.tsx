
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star, MessageCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Review {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lawyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  comment: string;
  isHelpful: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    _id: number;
    count: number;
  }>;
}

const LawyerReviews: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastReviewCount, setLastReviewCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadReviews();
      loadReviewStats();
    }
  }, [user?.id]);

  // Auto-refresh reviews every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      loadReviews();
      loadReviewStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reviews/lawyer/${user?.id}?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newReviews = response.data.data.reviews;
      setReviews(newReviews);
      
      // Check if there are new reviews
      if (lastReviewCount > 0 && newReviews.length > lastReviewCount) {
        const newCount = newReviews.length - lastReviewCount;
        toast({
          title: "New Reviews",
          description: `You have ${newCount} new review${newCount > 1 ? 's' : ''}!`,
        });
      }
      setLastReviewCount(newReviews.length);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reviews/lawyer/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data.statistics);
    } catch (error) {
      console.error('Failed to load review stats:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Client Reviews</h1>
          {stats && stats.totalReviews > 0 && (
            <Badge variant="secondary" className="text-sm">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadReviews();
            loadReviewStats();
          }}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Review Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.ratingDistribution.find(r => r._id === 5)?.count || 0}
              </div>
            </CardContent>
          </Card>
          {reviews.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Latest Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {formatDate(reviews[0].createdAt)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            What your clients are saying about your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No reviews yet</p>
              <p className="text-sm">Reviews from your clients will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {review.userId.firstName.charAt(0)}{review.userId.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {review.userId.firstName} {review.userId.lastName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        {new Date(review.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <Badge variant="secondary" className={getRatingColor(review.rating)}>
                        {review.rating}/5
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">{review.comment}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {review.isHelpful} people found this helpful
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerReviews;
