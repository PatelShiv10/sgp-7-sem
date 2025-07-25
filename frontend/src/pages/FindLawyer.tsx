
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, MessageCircle, Calendar, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const FindLawyer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const practiceAreas = [
    { value: 'all', label: 'All Practice Areas' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'family', label: 'Family Law' },
    { value: 'corporate', label: 'Corporate Law' },
    { value: 'personal-injury', label: 'Personal Injury' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'bankruptcy', label: 'Bankruptcy' },
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'new-york', label: 'New York' },
    { value: 'los-angeles', label: 'Los Angeles' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'houston', label: 'Houston' },
    { value: 'phoenix', label: 'Phoenix' },
    { value: 'philadelphia', label: 'Philadelphia' },
  ];

  // Only show verified lawyers in the public directory
  const lawyers = [
    {
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
    },
    // Note: Only lawyers with verified status are shown
  ];

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.practiceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPracticeArea = selectedPracticeArea === 'all' || 
                               lawyer.practiceAreas.some(area => area.toLowerCase().includes(selectedPracticeArea.replace('-', ' ')));
    const matchesLocation = selectedLocation === 'all' || 
                           lawyer.location.toLowerCase().includes(selectedLocation.replace('-', ' '));
    
    return matchesSearch && matchesPracticeArea && matchesLocation;
  });

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">Find a Lawyer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with verified lawyers in your area. Browse profiles, read reviews, and book consultations.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-soft border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name or practice area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2"
              />
              <Select value={selectedPracticeArea} onValueChange={setSelectedPracticeArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Practice Area" />
                </SelectTrigger>
                <SelectContent>
                  {practiceAreas.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <Card key={lawyer.id} className="shadow-soft border-0 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={lawyer.image}
                      alt={lawyer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {lawyer.rating} ({lawyer.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{lawyer.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lawyer.practiceAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{lawyer.experience} experience</span>
                    <span className="font-semibold text-teal">{lawyer.hourlyRate}/hr</span>
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button asChild size="sm" className="flex-1 bg-teal hover:bg-teal-light text-white">
                      <Link to={`/lawyer/${lawyer.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/chat/${lawyer.id}`}>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLawyers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No verified lawyers found matching your criteria. Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindLawyer;
