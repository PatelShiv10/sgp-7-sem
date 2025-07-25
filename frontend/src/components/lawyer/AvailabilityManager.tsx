
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface DaySchedule {
  day: string;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

const AvailabilityManager = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      day: 'Monday',
      isActive: true,
      timeSlots: [
        { id: '1', startTime: '09:00', endTime: '17:00', isActive: true }
      ]
    },
    {
      day: 'Tuesday',
      isActive: true,
      timeSlots: [
        { id: '2', startTime: '09:00', endTime: '17:00', isActive: true }
      ]
    },
    {
      day: 'Wednesday',
      isActive: true,
      timeSlots: [
        { id: '3', startTime: '09:00', endTime: '17:00', isActive: true }
      ]
    },
    {
      day: 'Thursday',
      isActive: true,
      timeSlots: [
        { id: '4', startTime: '09:00', endTime: '17:00', isActive: true }
      ]
    },
    {
      day: 'Friday',
      isActive: true,
      timeSlots: [
        { id: '5', startTime: '09:00', endTime: '17:00', isActive: true }
      ]
    },
    {
      day: 'Saturday',
      isActive: false,
      timeSlots: []
    },
    {
      day: 'Sunday',
      isActive: false,
      timeSlots: []
    }
  ]);

  const toggleDayActive = (dayIndex: number) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, isActive: !day.isActive } : day
    ));
  };

  const addTimeSlot = (dayIndex: number) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '10:00',
      isActive: true
    };
    
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, timeSlots: [...day.timeSlots, newSlot] }
        : day
    ));
  };

  const removeTimeSlot = (dayIndex: number, slotId: string) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, timeSlots: day.timeSlots.filter(slot => slot.id !== slotId) }
        : day
    ));
  };

  const updateTimeSlot = (dayIndex: number, slotId: string, field: string, value: string) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? {
            ...day,
            timeSlots: day.timeSlots.map(slot =>
              slot.id === slotId ? { ...slot, [field]: value } : slot
            )
          }
        : day
    ));
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-navy">Availability Settings</h2>
        <Button className="bg-teal hover:bg-teal-light text-white">
          Save Schedule
        </Button>
      </div>

      <div className="grid gap-4">
        {schedule.map((daySchedule, dayIndex) => (
          <Card key={daySchedule.day} className="shadow-soft border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-navy">
                  {daySchedule.day}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Available</span>
                  <Switch
                    checked={daySchedule.isActive}
                    onCheckedChange={() => toggleDayActive(dayIndex)}
                  />
                </div>
              </div>
            </CardHeader>
            
            {daySchedule.isActive && (
              <CardContent className="space-y-4">
                {daySchedule.timeSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-teal" />
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'startTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      
                      <span className="text-gray-500">to</span>
                      
                      <select
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'endTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <Badge variant={slot.isActive ? "default" : "secondary"}>
                      {slot.isActive ? "Active" : "Inactive"}
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTimeSlot(dayIndex, slot.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => addTimeSlot(dayIndex)}
                  className="w-full border-dashed border-2 border-teal text-teal hover:bg-teal hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityManager;
