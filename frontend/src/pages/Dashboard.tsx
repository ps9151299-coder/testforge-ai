import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  requirements_count?: number;
  tests_count?: number;
  completed_tasks?: number;
  total_tasks?: number;
  created_at?: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Dynamic user resolution
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return { name: 'Pragati Singh', email: 'user@testforge.io' };
  }, []);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const localWs = localStorage.getItem(`local_workspaces_${user.email}`);
      if (localWs) {
        const parsed = JSON.parse(localWs);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Re-read storage whenever the user focuses the tab to keep counts synced
  useEffect(() => {
    const handleSync = () => {
      try {
        const localWs = localStorage.getItem(`local_workspaces_${user.email}`);
        if (localWs) {
          const parsed = JSON.parse(localWs);
          if (Array.isArray(parsed)) setProjects(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('focus', handleSync);
    return () => window.removeEventListener('focus', handleSync);
  }, [user.email]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsCreating(true);
    const newId = `ws_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: projectName.trim(),
      description: projectDesc.trim() || 'Software requirement automation workspace.',
      requirements_count: 0,
      tests_count: 0,
      completed_tasks: 0,
      total_tasks: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem(`local_workspaces_${user.email}`, JSON.stringify(updated));

    // Clear any previous generic leftovers for this new workspace
    localStorage.removeItem(`testforge_reqs_${newId}`);
    localStorage.removeItem(`testforge_tests_${newId}`);
    localStorage.removeItem(`testforge_tasks_${newId}`);
    localStorage.removeItem(`testforge_strategy_${newId}`);
    localStorage.removeItem(`testforge_script_${newId}`);

    setIsCreating(false);
    setIsModalOpen(false);
    setProjectName('');
    setProjectDesc('');

    // Open Requirement Ingestion / Upload Specs page
    navigate(`/projects/${newId}`);
  };

  const totalReqs = projects.reduce((acc, p) => acc + (p.requirements_count || 0), 0);
  const totalTests = projects.reduce((acc, p) => acc + (p.tests_count || 0), 0);
  const totalCompleted = projects.reduce((acc, p) => acc + (p.completed_tasks || 0), 0);
  const totalAllTasks = projects.reduce((acc, p) => acc + (p.total_tasks || 0), 0);
  const overallRoadmapPercent =
    totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0;

  return (
    <div style={styles.screenWrapper}>
      <div style={styles.consoleCard}>
        {/* Left Dark Sidebar */}
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.brandRow}>
              <span style={styles.brandBadge}>TF</span>
              <span style={styles.brandName}>TestForge AI</span>
            </div>

            <nav style={styles.navMenu}>
              <button
                style={{
                  ...styles.navItem,
                  backgroundColor: '#48271b',
                  color: '#fff6ed',
                }}
              >
                <span>📁</span>
                <span>Projects</span>
              </button>
              <button
                style={styles.navItem}
                onClick={() => {
                  if (projects.length > 0) {
                    navigate(`/projects/${projects[0].id}`);
                  } else {
                    alert('Please create a project first to upload requirements.');
                  }
                }}
              >
                <span>📑</span>
                <span>Requirements</span>
              </button>
              <button
                style={styles.navItem}
                onClick={() => {
                  if (projects.length > 0) {
                    navigate(`/projects/${projects[0].id}/generate`);
                  } else {
                    alert('Please create a project first to view generated tests.');
                  }
                }}
              >
                <span>🧪</span>
                <span>Test Cases</span>
              </button>
              <button
                style={styles.navItem}
                onClick={() => {
                  if (projects.length > 0) {
                    navigate(`/projects/${projects[0].id}/generate`);
                  } else {
                    alert('Please create a project first to view the roadmap.');
                  }
                }}
              >
                <span>✅</span>
                <span>Work Roadmap ({overallRoadmapPercent}%)</span>
              </button>
            </nav>
          </div>

          <div>
            <div style={styles.userProfile}>
              <div style={styles.avatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={styles.userName}>{user.name || 'User Workspace'}</div>
                <div style={styles.userRole}>pro</div>
              </div>
            </div>
            <button
              style={styles.signOutBtn}
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main style={styles.mainContent}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Project Workspace</h1>
              <p style={styles.subtitle}>
                Select a project to upload documents, or create an isolated workspace.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={styles.globalRoadmapPill}>
                <span>📊 Roadmap ({overallRoadmapPercent}% Done)</span>
              </div>
              <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
                + New Project
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div style={styles.metricGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>ACTIVE WORKSPACES</div>
              <div style={styles.metricValue}>{projects.length}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>REQUIREMENTS INDEXED</div>
              <div style={styles.metricValue}>{totalReqs}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>SYNTHESIZED TESTS</div>
              <div style={styles.metricValue}>{totalTests}</div>
            </div>
          </div>

          {/* Projects List */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '16px', color: '#2b140d', margin: '0 0 16px 0' }}>
              Your Projects
            </h3>

            {projects.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                <h4 style={{ margin: '0 0 6px 0', color: '#2b140d' }}>No projects created yet</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#7b5d49' }}>
                  Click "+ New Project" above to create your first workspace.
                </p>
              </div>
            ) : (
              <div style={styles.projectGrid}>
                {projects.map((proj) => (
                  <div key={proj.id} style={styles.projectCard}>
                    <div>
                      <h4 style={styles.projectTitle}>{proj.name}</h4>
                      <p style={styles.projectDesc}>{proj.description}</p>
                      <span style={styles.projectIdBadge}>ID: {proj.id}</span>
                    </div>

                    <div style={styles.projectFooter}>
                      <span style={{ fontSize: '12px', color: '#7b5d49' }}>
                        {proj.requirements_count || 0} Requirements • {proj.tests_count || 0} Tests
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={styles.cardBtn}
                          onClick={() => navigate(`/projects/${proj.id}`)}
                          title="Upload and inspect requirement specifications"
                        >
                          Specs ➔
                        </button>
                        <button
                          style={styles.cardBtnPrimary}
                          onClick={() => navigate(`/projects/${proj.id}/generate`)}
                          title="Open synthesized tests, strategy, and roadmap"
                        >
                          Tests & Scripts ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2b140d', fontSize: '18px' }}>
              Create New Project
            </h3>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>PROJECT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Task Management System"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={styles.formInput}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.formLabel}>DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of software requirement scope..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  style={styles.formTextarea}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  screenWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#30170f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  consoleCard: {
    width: '100%',
    maxWidth: '1180px',
    minHeight: '680px',
    backgroundColor: '#f7ede1',
    borderRadius: '24px',
    display: 'flex',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#381c13',
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #4a271c',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '36px',
    paddingLeft: '6px',
  },
  brandBadge: {
    backgroundColor: '#faeedf',
    color: '#30170f',
    fontWeight: 800,
    fontSize: '13px',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  brandName: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#faeedf',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '13.5px',
    cursor: 'pointer',
    textAlign: 'left',
    backgroundColor: 'transparent',
    color: '#bfa593',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#2b140d',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#faeedf',
    color: '#30170f',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#faeedf',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '11px',
    color: '#a88c7a',
  },
  signOutBtn: {
    width: '100%',
    background: 'none',
    border: '1px solid #5a3021',
    padding: '8px',
    borderRadius: '8px',
    color: '#d4b7a3',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    padding: '38px 44px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '26px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#2b140d',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#7b5d49',
    marginTop: '4px',
  },
  globalRoadmapPill: {
    backgroundColor: '#ffffff',
    border: '1px solid #ebd9c8',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#2b140d',
  },
  primaryBtn: {
    backgroundColor: '#2b140d',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    color: '#2b140d',
    border: '1px solid #ebd9c8',
    padding: '10px 16px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #ebd9c8',
    padding: '20px 24px',
  },
  metricLabel: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#8c6a56',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#2b140d',
    marginTop: '6px',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '2px dashed #ebd9c8',
    padding: '48px 20px',
    textAlign: 'center',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #ebd9c8',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
  },
  projectTitle: {
    margin: '0 0 6px 0',
    fontSize: '15px',
    fontWeight: 700,
    color: '#2b140d',
  },
  projectDesc: {
    margin: '0 0 8px 0',
    fontSize: '12.5px',
    color: '#7b5d49',
    lineHeight: 1.4,
  },
  projectIdBadge: {
    fontSize: '10.5px',
    color: '#a88c7a',
    fontFamily: 'monospace',
  },
  projectFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #f3e8df',
  },
  cardBtn: {
    backgroundColor: '#faf2e9',
    color: '#2b140d',
    border: '1px solid #ebd9c8',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  cardBtnPrimary: {
    backgroundColor: '#2b140d',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  formLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#8c6a56',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ebd9c8',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  formTextarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ebd9c8',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
  },
};

export default DashboardPage;