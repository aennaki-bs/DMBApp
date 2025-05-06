import { CompletionRate } from '@/services/dashboardService';

interface CompletionRateCardProps {
  completionRate: CompletionRate | undefined;
}

export function CompletionRateCard({ completionRate }: CompletionRateCardProps) {
  return (
    <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Completion Rate</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{completionRate?.rate || 0}%</p>
          <p className="text-sm text-blue-300 mt-1">Documents processed</p>
        </div>
        <div className="h-24 w-24 relative">
          {/* Add a circular progress indicator here if needed */}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">Completed</span>
          <span className="text-sm text-white">{completionRate?.completed || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">In Progress</span>
          <span className="text-sm text-white">{completionRate?.inProgress || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">Pending</span>
          <span className="text-sm text-white">{completionRate?.pending || 0}</span>
        </div>
      </div>
    </div>
  );
}
