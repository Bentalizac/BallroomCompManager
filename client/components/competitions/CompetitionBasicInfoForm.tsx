'use client';

interface CompetitionBasicInfoFormProps {
  name: string;
  startDate: string;
  endDate: string;
  errors: Record<string, string>;
  onNameChange: (name: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function CompetitionBasicInfoForm({
  name,
  startDate,
  endDate,
  errors,
  onNameChange,
  onStartDateChange,
  onEndDateChange,
}: CompetitionBasicInfoFormProps) {
  return (
    <>
      {/* Competition Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Competition Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., Bay Area Open Championship 2024"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.startDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.endDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>
      </div>
    </>
  );
}