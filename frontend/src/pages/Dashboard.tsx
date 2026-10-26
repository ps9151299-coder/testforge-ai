import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import WorkTrackerModal, { WorkTrackerModal as WorkTrackerModalNamed } from '../components/WorkTrackerModal';

export interface WorkspaceItem {
  id: string;
  name: string;
  description?: string;
  requirements_count?: number;
  tests_count?: number;
  completed_tasks?: number;
  total_tasks?: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Retrieve user session or fallback
  const storedUserRaw = localStorage.getItem('user');
  const currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const userEmail = currentUser?.email || 'ps9151299@gmail.com';

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/v1/workspaces/?owner_email=${encodeURIComponent(userEmail)}`);
      setWorkspaces(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Aggregate metrics
  const totalRequirements = useMemo(
    () => workspaces.reduce((sum, w) => sum + (w.requirements_count || 0), 0),
    [workspaces]
  );

  const totalTests = useMemo(
    () => workspaces.reduce((sum, w) => sum + (w.tests_count || 0), 0),
    [workspaces]
  );

  // Safe roadmap percentage calculation
  const roadmapProgress = useMemo(() => {
    if (!workspaces || workspaces.length === 0) {
      return 0;
    }

    let totalTasks = 0;
    let completedTasks = 0;

    workspaces.forEach((ws) => {
      const total =
        ws.total_tasks ??
        (ws.requirements_count ? ws.requirements_count + (ws.tests_count || 0) : 0);
      const done = ws.completed_tasks ?? (ws.tests_count || 0);

      totalTasks += total;
      completedTasks += done;
    });

    if (totalTasks === 0) {
      return 0;
    }

    const calculated = Math.round((completedTasks / totalTasks) * 100);
    return Math.min(Math.max(calculated, 0), 100);
  }, [workspaces]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Safe component handle supporting both default and named imports
  const ModalComponent = WorkTrackerModal || WorkTrackerModalNamed;

  return (
    <div className="flex h-screen bg-[#1c1412] text-[#f5ede4]">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col justify-between border-r border-[#3b2a26]">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5ede4] text-[#1c1412] font-black flex items-center justify-center tracking-wider text-sm">
              TF
            </div>
            <h1 className="text-lg font-bold">TestForge AI</h1>
          </div>

          <nav className="space-y-2">
            <button className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#2d1e1a] text-[#f5ede4] font-medium text-sm flex items-center gap-2.5">
              <span>📁</span> Projects
            </button>
            <button className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#a89a95] hover:bg-[#2d1e1a] hover:text-[#f5ede4] font-medium text-sm flex items-center gap-2.5 transition-colors">
              <span>📄</span> Requirements
            </button>
            <button className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#a89a95] hover:bg-[#2d1e1a] hover:text-[#f5ede4] font-medium text-sm flex items-center gap-2.5 transition-colors">
              <span>🧪</span> Test Cases
            </button>
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#a89a95] hover:bg-[#2d1e1a] hover:text-[#f5ede4] font-medium text-sm flex items-center gap-2.5 transition-colors"
            >
              <span>🚀</span> Work Roadmap ({roadmapProgress}%)
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="space-y-3 pt-4 border-t border-[#3b2a26]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3b2a26] text-[#f5ede4] font-bold flex items-center justify-center text-xs">
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold truncate">{userEmail.split('@')[0]}</p>
              <p className="text-[10px] text-[#a89a95]">Pro Workspace</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 text-xs text-[#a89a95] hover:text-white bg-[#241815] hover:bg-[#3b2a26] rounded-lg transition-colors text-left flex items-center gap-2"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-[#f9f5f0] text-[#1c1412]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Project Workspace</h2>
            <p className="text-sm text-stone-500 mt-1">
              Select a project to upload documents, or create an isolated workspace.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="px-4 py-2 border border-stone-300 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-stone-100 transition-colors bg-white shadow-sm"
            >
              📊 Roadmap ({roadmapProgress}% Done)
            </button>
            <button className="px-4 py-2 bg-[#1c1412] hover:bg-black text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              + New Project
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Active Workspaces
            </p>
            <p className="text-4xl font-extrabold mt-2">{workspaces.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Requirements Indexed
            </p>
            <p className="text-4xl font-extrabold mt-2">{totalRequirements}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Synthesized Tests
            </p>
            <p className="text-4xl font-extrabold mt-2">{totalTests}</p>
          </div>
        </div>

        {/* Project List */}
        <div>
          <h3 className="text-lg font-bold mb-4">Your Projects</h3>

          {loading ? (
            <p className="text-sm text-stone-400 py-6">Loading workspaces...</p>
          ) : workspaces.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center">
              <p className="text-stone-500 font-medium">No projects created yet.</p>
              <p className="text-stone-400 text-xs mt-1">
                Click "+ New Project" above to create your first workspace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <h4 className="text-lg font-bold">{ws.name}</h4>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {ws.description || 'Workspace for software requirement specifications.'}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono mt-2">ID: {ws.id}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs font-semibold">
                    <span className="text-stone-500">
                      {ws.requirements_count || 0} Requirements • {ws.tests_count || 0} Tests
                    </span>
                    <div className="space-x-3">
                      <button className="text-stone-700 hover:text-black">Specs →</button>
                      <button className="text-stone-900 font-bold hover:underline">
                        Tests & Scripts →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Tracker Modal */}
        {ModalComponent && (
          <ModalComponent
            isOpen={isRoadmapOpen}
            onClose={() => setIsRoadmapOpen(false)}
            progress={roadmapProgress}
            workspaces={workspaces}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;