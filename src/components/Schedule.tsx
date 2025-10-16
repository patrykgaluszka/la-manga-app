interface Day {
  title: string;
  desc: string;
  image?: string;
}

interface ScheduleProps {
  startDate: string;
  days: Day[];
}

export default function Schedule({ startDate, days }: ScheduleProps) {
  const parseDate = (dateStr: string): Date => {
    // Parse date in format "18.10" or "18.10.2024"
    const parts = dateStr.split('.');
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
    return new Date(year, month, day);
  };

  const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const startDateObj = parseDate(startDate);

  return (
    <div className="space-y-6">
      {days.map((day, index) => {
        const currentDate = addDays(startDateObj, index);
        const formattedDate = formatDate(currentDate);
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 mb-6 border border-gray-100">
            <header className="mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="bg-ocean-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                {formattedDate} – {day.title}
              </h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="order-2 md:order-1">
                {day.image ? (
                  <img 
                    src={day.image} 
                    alt={`Day ${index + 1} - ${day.title}`}
                    className="w-3/4 h-48 object-cover rounded-lg shadow-sm mx-auto"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-3/4 h-48 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-lg flex items-center justify-center text-ocean-600 mx-auto">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📸</span>
                      <span className="text-sm font-medium">Zdjęcie dnia {index + 1}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="order-1 md:order-2">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{day.desc}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}