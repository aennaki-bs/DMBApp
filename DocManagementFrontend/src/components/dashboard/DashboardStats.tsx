import { DashboardStats as DashboardStatsType } from '@/services/dashboardService';

interface DashboardStatsProps {
  stats: DashboardStatsType | undefined;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4">
        <h4 className="text-sm text-blue-300">Total Documents</h4>
        <div className="mt-2 flex justify-between items-end">
          <span className="text-2xl font-semibold text-white">{stats?.totalDocuments || 0}</span>
          <span className="text-xs text-green-400">+5%</span>
        </div>
      </div>

      <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4">
        <h4 className="text-sm text-blue-300">Active Circuits</h4>
        <div className="mt-2 flex justify-between items-end">
          <span className="text-2xl font-semibold text-white">{stats?.activeCircuits || 0}</span>
          <span className="text-xs text-blue-400">+12%</span>
        </div>
      </div>

      <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4">
        <h4 className="text-sm text-blue-300">Pending Approvals</h4>
        <div className="mt-2 flex justify-between items-end">
          <span className="text-2xl font-semibold text-white">{stats?.pendingApprovals || 0}</span>
          <span className="text-xs text-yellow-400">-9%</span>
        </div>
      </div>

      <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4">
        <h4 className="text-sm text-blue-300">Team Members</h4>
        <div className="mt-2 flex justify-between items-end">
          <span className="text-2xl font-semibold text-white">{stats?.teamMembers || 0}</span>
          <span className="text-xs text-green-400">+15%</span>
        </div>
      </div>
    </div>
  );
}
