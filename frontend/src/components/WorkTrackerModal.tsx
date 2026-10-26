import React from 'react';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  description?: string;
  requirements_count?: number;
  tests_count?: number;
  completed_tasks?: number;
  total_tasks?: number;
}

export interface WorkTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress?: number;
  workspaces?: WorkspaceItem[];
  tasks?: Task[];
}

export const WorkTrackerModal: React.FC<WorkTrackerModalProps> = ({
  isOpen,
  onClose,
  progress = 0,
  workspaces = [],
  tasks = [],
}) => {
  if (!isOpen) return null;

  // Strict check: if no projects and no tasks exist, progress must be 0%
  const effectiveProgress =
    workspaces.length === 0 && tasks.length === 0
      ? 0
      : Math.min(Math.max(progress, 0), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#241815] text-[#f5ede4] w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-[#3b2a26]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#3b2a26]">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Work Roadmap Tracker</h3>
            <p className="text-xs text-[#a89a95] mt-0.5">
              Track project milestones, test synthesis, and requirements.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a89a95] hover:text-white hover:bg-[#3b2a26] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar Container */}
        <div className="my-6 p-4 rounded-xl bg-[#1c1412] border border-[#3b2a26]">
          <div className="flex justify-between items-center text-sm font-semibold mb-2">
            <span>Overall Roadmap Completion</span>
            <span className="text-amber-400 font-mono text-base">{effectiveProgress}%</span>
          </div>
          <div className="w-full h-3 bg-[#2d1e1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${effectiveProgress}%` }}
            />
          </div>
        </div>

        {/* Workspaces & Tasks List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {workspaces.length === 0 && tasks.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-[#1c1412] border border-dashed border-[#3b2a26]">
              <p className="text-sm text-[#a89a95]">
                No projects or roadmaps started yet.
              </p>
              <p className="text-xs text-[#a89a95]/70 mt-1">
                Create a project workspace to begin generating requirements and tests.
              </p>
            </div>
          ) : (
            workspaces.map((ws) => (
              <div
                key={ws.id}
                className="p-3.5 rounded-xl bg-[#1c1412] border border-[#3b2a26] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-sm text-[#f5ede4]">{ws.name}</h4>
                  <p className="text-xs text-[#a89a95] mt-0.5">
                    {ws.requirements_count ?? 0} Requirements • {ws.tests_count ?? 0} Tests
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-900/40 text-amber-300 border border-amber-700/50">
                  Active
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#3b2a26] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3b2a26] hover:bg-[#4d3732] text-[#f5ede4] text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkTrackerModal;