import { VenueColumn } from './VenueColumn';
import { Venue } from '../../types';

interface DayColumnProps {
  day: Date;
  locations: Venue[];
}

export const DayColumn = ({ day, locations }: DayColumnProps) => {
  console.log('DayColumn rendering for day:', day.toISOString());
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex-1 border-r border-gray-200 last:border-r-0">
      <div className="border-b border-gray-200 p-3 text-center font-medium sticky top-0 bg-white z-10">
        {formatDate(day)}
      </div>
      <div className="flex">

        {locations && locations.length > 0 && locations
          .map((location) => (
            <div key={location.name} className="flex-1">
              <div className="border-b border-gray-200 p-2 text-center text-sm font-medium sticky top-[49px] bg-white z-10">
                {location.name}
              </div>
              <div className={"relative"}>
                <VenueColumn
                  day={day}
                  venue={location}
                />
              </div>
            </div>
          ))}        
      </div>
    </div>
  );
}