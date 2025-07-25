import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, MessageCircle, Calendar, Clock, DollarSign, Award, Users, CheckCircle, Shield } from 'lucide-react';

const PublicLawyerProfile = () => {
  const { id } = useParams();

  // Sample lawyer data - in a real app, this would be fetched based on the ID
  const lawyer = {
    id: 1,
    name: 'Sarah Johnson',
    practiceAreas: ['Criminal Law', 'Family Law'],
    location: 'New York, NY',
    rating: 4.9,
    reviews: 124,
    experience: '15 years',
    phone: '+1 (555) 123-4567',
    hourlyRate: '$350',
    image: '/placeholder.svg',
    verified: true,
    status: 'verified',
    about: 'Sarah Johnson is a seasoned attorney with over 15 years of experience in criminal and family law. She has successfully represented hundreds of clients and is known for her dedication to achieving the best possible outcomes.',
    education: [
      'Harvard Law School - JD',
      'Yale University - BA Political Science'
    ],
    certifications: [
      'New York State Bar Association',
      'American Bar Association',
      'Criminal Defense Attorney Certification'
    ],
    recentReviews: [
      {
        id: 1,
        client: 'John D.',
        rating: 5,
        comment: 'Excellent lawyer, very professional and knowledgeable.',
        date: '2024-01-15'
      },
      {
        id: 2,
        client: 'Maria S.',
        rating: 5,
        comment: 'Sarah helped me through a difficult family case. Highly recommend!',
        date: '2024-01-10'
      }
    ]
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-8 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <img
                src={lawyer.image}
                alt={lawyer.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-navy mb-2">{lawyer.name}</h1>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{lawyer.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-lg font-semibold">{lawyer.rating}</span>
                      <span className="text-gray-600">({lawyer.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-4 w-4 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {lawyer.practiceAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {area}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-teal" />
                    <span>{lawyer.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-teal" />
                    <span>{lawyer.hourlyRate}/hour</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-teal" />
                    <span>{lawyer.reviews} clients served</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild className="flex-1 bg-teal hover:bg-teal-light text-white">
                <Link to={`/booking/${lawyer.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-teal text-teal hover:bg-teal hover:text-white">
                <Link to={`/chat/${lawyer.id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{lawyer.about}</p>
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy">Education & Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Education</h4>
                    <ul className="space-y-1">
                      {lawyer.education.map((edu, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-teal" />
                          <span className="text-gray-600">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Certifications</h4>
                    <ul className="space-y-1">
                      {lawyer.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-teal" />
                          <span className="text-gray-600">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Reviews */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-navy">Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lawyer.recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{review.client}</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 text-teal border-teal hover:bg-teal hover:text-white">
                  View All Reviews
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-navy">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-teal" />
                    <span className="text-gray-600">{lawyer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-teal" />
                    <span className="text-gray-600">{lawyer.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLawyerProfile;
