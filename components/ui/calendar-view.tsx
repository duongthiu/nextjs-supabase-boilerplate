'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from 'date-fns';

interface AllocationData {
  id: string;
  employee_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
}

interface CalendarViewProps {
  allocations: AllocationData[];
}

export function CalendarView({ allocations }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getAllocationsForDate = (date: Date) => {
    return allocations.filter(allocation => {
      const startDate = new Date(allocation.start_date);
      const endDate = new Date(allocation.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold bg-muted">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((day, index) => {
          const dayAllocations = getAllocationsForDate(day);
          const totalAllocation = dayAllocations.reduce(
            (sum, allocation) => sum + allocation.allocation_percentage,
            0
          );

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 border ${
                totalAllocation > 100 ? 'bg-red-50' : 
                totalAllocation === 100 ? 'bg-green-50' : 
                totalAllocation > 0 ? 'bg-yellow-50' : ''
              }`}
            >
              <div className="font-medium">{format(day, 'd')}</div>
              <div className="space-y-1 mt-1">
                {dayAllocations.map(allocation => (
                  <div
                    key={allocation.id}
                    className="text-xs p-1 bg-white rounded border truncate"
                    title={`${allocation.employee_name} - ${allocation.project_name} (${allocation.allocation_percentage}%)`}
                  >
                    {allocation.employee_name} ({allocation.allocation_percentage}%)
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 border"></div>
          <span>100% Allocated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-50 border"></div>
          <span>Partially Allocated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border"></div>
          <span>Over Allocated</span>
        </div>
      </div>
    </div>
  );
} 