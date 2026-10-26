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

  // Accurate roadmap percentage (0% if empty, dynamic if projects exist)
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

  const ModalComponent = WorkTrackerModal || WorkTrackerModalNamed;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#261612',
        color: '#fdf8f4',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fdf8f4',
                color: '#261612',
                fontWeight: 900,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              TF
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
              TestForge AI
            </h1>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#3b2520',
                color: '#fdf8f4',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              📁 Projects
            </button>
            <button
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#ab958e',
                fontWeight: 500,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              📄 Requirements
            </button>
            <button
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#ab958e',
                fontWeight: 500,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              🧪 Test Cases
            </button>
            <button
              onClick={() => setIsRoadmapOpen(true)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#ab958e',
                fontWeight: 500,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              🚀 Work Roadmap ({roadmapProgress}%)
            </button>
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#4a302a',
                color: '#fdf8f4',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {userEmail.substring(0, 1).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {userEmail.split('@')[0]}
              </p>
              <p style={{ margin: 0, fontSize: '10px', color: '#9f8881' }}>Pro Workspace</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '10px',
              backgroundColor: '#35201c',
              color: '#d6c4be',
              fontSize: '12px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Cream Content Container */}
      <main
        style={{
          flex: 1,
          margin: '16px 16px 16px 0',
          borderRadius: '32px',
          backgroundColor: '#fbf4eb',
          color: '#261612',
          padding: '40px 48px',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '36px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '-0.8px',
                margin: 0,
              }}
            >
              Project Workspace
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#8a7771',
                margin: '6px 0 0 0',
              }}
            >
              Select a project to upload documents, or create an isolated workspace.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsRoadmapOpen(true)}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e7ded6',
                fontSize: '13px',
                fontWeight: 600,
                color: '#261612',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              📊 Roadmap ({roadmapProgress}% Done)
            </button>
            <button
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                backgroundColor: '#261612',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#6e5d57',
                margin: 0,
              }}
            >
              Active Workspaces
            </p>
            <p
              style={{
                fontSize: '44px',
                fontWeight: 800,
                margin: '12px 0 0 0',
                lineHeight: 1,
              }}
            >
              {workspaces.length}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#6e5d57',
                margin: 0,
              }}
            >
              Requirements Indexed
            </p>
            <p
              style={{
                fontSize: '44px',
                fontWeight: 800,
                margin: '12px 0 0 0',
                lineHeight: 1,
              }}
            >
              {totalRequirements}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#6e5d57',
                margin: 0,
              }}
            >
              Synthesized Tests
            </p>
            <p
              style={{
                fontSize: '44px',
                fontWeight: 800,
                margin: '12px 0 0 0',
                lineHeight: 1,
              }}
            >
              {totalTests}
            </p>
          </div>
        </div>

        {/* Project Section */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>
            Your Projects
          </h3>

          {loading ? (
            <p style={{ fontSize: '13px', color: '#8a7771' }}>Loading workspaces...</p>
          ) : workspaces.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '40px',
                border: '1px dashed #d8cbc4',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#6e5d57' }}>
                No projects created yet.
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#9f8881' }}>
                Click "+ New Project" above to create your first workspace.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px',
              }}
            >
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <h4 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                        {ws.name}
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', color: '#ab958e', cursor: 'pointer' }}>
                        <span>✎</span>
                        <span>✕</span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#6e5d57',
                        margin: '10px 0 0 0',
                        lineHeight: 1.4,
                      }}
                    >
                      {ws.description || 'Workspace for software requirement specifications.'}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#a3938c',
                        fontFamily: 'monospace',
                        margin: '14px 0 0 0',
                      }}
                    >
                      ID: {ws.id}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f2ece6',
                      paddingTop: '16px',
                      marginTop: '16px',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#8a7771', fontWeight: 500 }}>
                      {ws.requirements_count || 0} Requirements • {ws.tests_count || 0} Tests
                    </span>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#261612',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '12px',
                        }}
                      >
                        Specs →
                      </button>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#261612',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '12px',
                        }}
                      >
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