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
  created_at?: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve user session dynamically from localStorage (never hardcoded)
  const storedUserRaw = localStorage.getItem('user');
  const currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const userEmail = currentUser?.email || localStorage.getItem('current_user') || 'guest@testforge.io';
  const userName = currentUser?.name || localStorage.getItem('user_name') || userEmail.split('@')[0];

  const fetchWorkspaces = async () => {
    // 1. Instant local render: avoid hanging on network requests
    const localSavedRaw = localStorage.getItem(`local_workspaces_${userEmail}`);
    const localWorkspaces: WorkspaceItem[] = localSavedRaw ? JSON.parse(localSavedRaw) : [];
    
    if (localWorkspaces.length > 0) {
      setWorkspaces(localWorkspaces);
      setLoading(false);
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Short 2-second timeout to prevent UI freezes
      const res = await apiClient.get(
        `/api/v1/workspaces/?owner_email=${encodeURIComponent(userEmail)}`,
        { headers, timeout: 2000 }
      );

      const serverWorkspaces = Array.isArray(res.data) ? res.data : [];

      const map = new Map<string, WorkspaceItem>();
      [...serverWorkspaces, ...localWorkspaces].forEach((w) => map.set(w.id, w));
      const combined = Array.from(map.values());
      setWorkspaces(combined);
      localStorage.setItem(`local_workspaces_${userEmail}`, JSON.stringify(combined));
    } catch (err) {
      console.warn('Backend offline or slow, using instant cached workspaces:', err);
      setWorkspaces(localWorkspaces);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [userEmail]);

  // Handle Project Creation with Backend + Demo Fallback
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsSubmitting(true);
    const newId = `ws_${Date.now()}`;
    const newWs: WorkspaceItem = {
      id: newId,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Workspace for software requirement specifications.',
      requirements_count: 0,
      tests_count: 0,
      completed_tasks: 0,
      total_tasks: 0,
      created_at: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await apiClient.post(
        '/api/v1/workspaces/',
        {
          name: newWs.name,
          title: newWs.name,
          description: newWs.description,
          owner_email: userEmail,
        },
        { headers, timeout: 2500 }
      );
    } catch (error) {
      console.warn('Backend API unavailable. Saving to local storage for demo persistence:', error);
    } finally {
      const currentLocalRaw = localStorage.getItem(`local_workspaces_${userEmail}`);
      const currentLocal: WorkspaceItem[] = currentLocalRaw ? JSON.parse(currentLocalRaw) : [];
      const updatedList = [newWs, ...currentLocal.filter((w) => w.id !== newWs.id)];
      localStorage.setItem(`local_workspaces_${userEmail}`, JSON.stringify(updatedList));

      setWorkspaces((prev) => [newWs, ...prev.filter((w) => w.id !== newWs.id)]);
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreateModalOpen(false);
      setIsSubmitting(false);
    }
  };

  // Delete Workspace
  const handleDeleteWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;

    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    const currentLocalRaw = localStorage.getItem(`local_workspaces_${userEmail}`);
    if (currentLocalRaw) {
      const currentLocal: WorkspaceItem[] = JSON.parse(currentLocalRaw);
      localStorage.setItem(
        `local_workspaces_${userEmail}`,
        JSON.stringify(currentLocal.filter((w) => w.id !== id))
      );
    }

    // Clean up cached project data
    localStorage.removeItem(`testforge_reqs_${id}`);
    localStorage.removeItem(`reqs_${id}`);
    localStorage.removeItem(`testforge_tests_${id}`);
    localStorage.removeItem(`testforge_tasks_${id}`);
    localStorage.removeItem(`testforge_strategy_${id}`);
    localStorage.removeItem(`testforge_script_${id}`);
  };

  // Navigation handlers
  const handleOpenRequirements = () => {
    if (workspaces.length > 0) {
      navigate(`/projects/${workspaces[0].id}`);
    } else {
      alert('Please create a project first to upload requirements.');
    }
  };

  const handleOpenTestGenerator = () => {
    if (workspaces.length > 0) {
      navigate(`/projects/${workspaces[0].id}/generate`);
    } else {
      alert('Please create a project first to access test generation.');
    }
  };

  // Helper: Checks if requirements actually exist in localStorage for a workspace
  const getWorkspaceReqCount = (ws: WorkspaceItem): number => {
    if (ws.requirements_count && ws.requirements_count > 0) return ws.requirements_count;
    const raw =
      localStorage.getItem(`testforge_reqs_${ws.id}`) ||
      localStorage.getItem(`reqs_${ws.id}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
      } catch (e) {
        console.error(e);
      }
    }
    return 0;
  };

  // Helper: Checks if test cases actually exist in localStorage for a workspace
  const getWorkspaceTestCount = (ws: WorkspaceItem): number => {
    const reqs = getWorkspaceReqCount(ws);
    if (reqs === 0) return 0;
    if (ws.tests_count && ws.tests_count > 0) return ws.tests_count;
    const raw = localStorage.getItem(`testforge_tests_${ws.id}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
      } catch (e) {
        console.error(e);
      }
    }
    return 0;
  };

  // Aggregate metrics
  const totalRequirements = useMemo(
    () => workspaces.reduce((sum, w) => sum + getWorkspaceReqCount(w), 0),
    [workspaces]
  );

  const totalTests = useMemo(
    () => workspaces.reduce((sum, w) => sum + getWorkspaceTestCount(w), 0),
    [workspaces]
  );

  // Accurate roadmap percentage calculation
  const roadmapProgress = useMemo(() => {
    if (!workspaces || workspaces.length === 0) {
      return 0;
    }

    let totalTasks = 0;
    let completedTasks = 0;

    workspaces.forEach((ws) => {
      const reqCount = getWorkspaceReqCount(ws);
      if (reqCount === 0) return;

      const rawTasks = localStorage.getItem(`testforge_tasks_${ws.id}`);
      if (rawTasks) {
        try {
          const parsed = JSON.parse(rawTasks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            totalTasks += parsed.length;
            completedTasks += parsed.filter((t: any) => t.status === 'completed').length;
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      const total = ws.total_tasks || 16;
      const done = ws.completed_tasks || 0;
      totalTasks += total;
      completedTasks += done;
    });

    if (totalTasks === 0) return 0;

    const calculated = Math.round((completedTasks / totalTasks) * 100);
    return Math.min(Math.max(calculated, 0), 100);
  }, [workspaces]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_name');
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
              onClick={() => navigate('/dashboard')}
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
              onClick={handleOpenRequirements}
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
              onClick={handleOpenTestGenerator}
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

        {/* Dynamic User Profile & Sign Out */}
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
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'uppercase',
              }}
            >
              {userName.substring(0, 1) || 'U'}
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
                {userName}
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
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                backgroundColor: '#261612',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
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

          {loading && workspaces.length === 0 ? (
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
              {workspaces.map((ws) => {
                const reqCount = getWorkspaceReqCount(ws);
                const testCount = getWorkspaceTestCount(ws);

                return (
                  <div
                    key={ws.id}
                    onClick={() => navigate(`/projects/${ws.id}`)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '24px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '180px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
                        <div style={{ display: 'flex', gap: '8px', color: '#ab958e' }}>
                          <span
                            title="Delete Workspace"
                            onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                            style={{ fontSize: '14px', cursor: 'pointer', padding: '2px 4px' }}
                          >
                            ✕
                          </span>
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
                        {reqCount} Requirements • {testCount} Tests
                      </span>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${ws.id}`);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${ws.id}/generate`);
                          }}
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
                );
              })}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {isCreateModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                color: '#261612',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Create New Project</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    color: '#8a7771',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#6e5d57',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., E-commerce Platform"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #d8cbc4',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#6e5d57',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief overview of software requirement scope..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #d8cbc4',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      backgroundColor: '#f2ece6',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6e5d57',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#261612',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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