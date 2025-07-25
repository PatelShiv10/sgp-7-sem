import { useState, useEffect } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';

export const LawyerTopBar = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const storedImage = localStorage.getItem('lawyerProfileImage');
    setProfileImage(storedImage);
    
    // Listen for storage changes to update the image in real-time
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem('lawyerProfileImage');
      setProfileImage(updatedImage);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      title: "New appointment request",
      message: "John Smith has requested an appointment for tomorrow",
      time: "5 minutes ago",
      isRead: false
    },
    {
      id: 2,
      title: "Document uploaded",
      message: "Sarah Johnson uploaded a new document",
      time: "1 hour ago",
      isRead: false
    },
    {
      id: 3,
      title: "Payment received",
      message: "Payment of $150 received from Mike Wilson",
      time: "2 hours ago",
      isRead: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-navy">Welcome back, Dr. Smith</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-xs flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-navy">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-navy">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full text-sm text-teal hover:text-teal-dark">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Profile Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-teal flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">DS</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-navy">Dr. Sarah Smith</p>
                  <p className="text-xs text-gray-600">Family Law</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2">
                <Link 
                  to="/lawyer-profile"
                  className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/lawyer-settings"
                  className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <hr className="my-2" />
                <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
