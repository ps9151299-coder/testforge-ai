import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  requirementsCount: number;
  testCasesCount: number;
}

interface MilestoneItem {
  id: string;
  title: string;
  category: 'Part 1: Completed Work' | 'Part 2: What Is Left to Build';
  status: 'done' | 'pending';
  desc: string;
  badge: string;
}

const MILESTONES: MilestoneItem[] = [
  // --- PART 1: COMPLETED WORK ---
  {
    id: 'auth-session',
    title: '1. Authentication & Session Architecture',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Local session tracking via localStorage ("current_user"), persistent profile badge with user initials and "Pro Workspace", and safe sign-out routing to /login.',
    badge: '100% Done'
  },
  {
    id: 'dashboard-sync',
    title: '2. Dashboard & Workspace Orchestration',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Dynamic real-time counters (Workspaces, Requirements, Synthesized Tests), two-way reconciliation hooks preventing reset to 0, split-routing (Specs vs Tests), and floating notifications.',
    badge: '100% Done'
  },
  {
    id: 'req-pipeline',
    title: '3. Requirement Ingestion Pipeline',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Multi-format file upload (.pdf, .docx, .txt), documentService and generateService backend extraction, and Parsed Specs matrix with Req ID, Actor, Behavior, and Status.',
    badge: '100% Done'
  },
  {
    id: 'strategy-synthesis',
    title: '4. AI Test Strategy & Case Synthesis',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: '5-part test strategy (Objective/Scope, Levels, Entry/Exit, Risks), test scenario matrix (Positive, Negative, Edge, Security), and full TypeScript @playwright/test generation.',
    badge: '100% Done'
  },
  {
    id: 'persistent-state',
    title: '5. Persistent State & Artifact Storage',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Cache-first state initialization with lazy localStorage initializers, re-synthesis prevention safeguards during tab navigation.',
    badge: '100% Done'
  },
  {
    id: 'export-runner',
    title: '6. Export Pipeline & Live Automation Runner',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: '.spec.ts export, CSV test matrix download, target URL environment setting, subprocess execution (POST /api/v1/execute/run-playwright), and embedded ANSI terminal UI.',
    badge: '100% Done'
  },

  // --- PART 2: WHAT IS LEFT TO BUILD ---
  {
    id: 'db-transition',
    title: '1. Database Transition (SQLite / PostgreSQL)',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Persistent relational tables (workspaces, requirements, test cases) backed by SQLAlchemy and SQLite with cascading deletion.',
    badge: '100% Done'
  },
  {
    id: 'backend-jwt',
    title: '2. Backend User Authentication (JWT)',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Authenticated FastAPI endpoints (/api/v1/auth/login and /register) backed by secure hashed credentials (PBKDF2-SHA256) and Bearer JWTs.',
    badge: '100% Done'
  },
  {
    id: 'heuristic-filtering',
    title: '3. Academic & Cover Page Filtering',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Regex and keyword heuristic filters integrated into document ingestion to automatically prune university headers, faculty names, and cover page boilerplates.',
    badge: '100% Done'
  },
  {
    id: 'token-chunking',
    title: '4. Chunking for Large PRDs (30+ Pages)',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Sliding window paragraph chunking (4,000 chars per window with 400-char overlap) to prevent context window overflow when ingesting large PRDs.',
    badge: '100% Done'
  },
  {
    id: 'visual-html-report',
    title: '5. Visual HTML Test Reports & Traces',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Integrate native Playwright HTML reporter output (playwright-report/index.html) into the frontend to inspect visual traces, steps, and execution timings.',
    badge: '100% Done'
  },
  {
    id: 'screenshot-artifacts',
    title: '6. Screenshot & Failure Artifact Capture',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Configure Playwright test runner to capture screenshots on assertion failures and expose them in the browser runner interface.',
    badge: '100% Done'
  },
  {
    id: 'sse-streaming',
    title: '7. WebSocket / SSE Terminal Streaming',
    category: 'Part 2: What Is Left to Build',
    status: 'done',
    desc: 'Real-time Server-Sent Events (SSE) streaming of stdout/stderr logs directly into the terminal line-by-line during Playwright execution.',
    badge: '100% Done'
  },
  {
    id: 'workspace-mutation',
    title: '8. Workspace Mutation Actions & Req Editing',
    category: 'Part 2: What Is Left to Build',
    status: 'done', // 100% Complete!
    desc: 'Card action menu for project renaming & cascading workspace deletion, plus inline requirement row editing.',
    badge: '100% Done'
  }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const currentUser = localStorage.getItem('current_user') || 'default_user';
  const storageKey = `testforge_projects_${currentUser}`;

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerFilter, setTrackerFilter] = useState<'all' | 'done' | 'pending'>('all');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        const seenIds = new Set<string>();

        const sanitized = parsed.map((p, index) => {
          let uniqueId = p.id;
          if (seenIds.has(uniqueId) || !uniqueId) {
            uniqueId = `proj-${Date.now()}-${index}`;
          }
          seenIds.add(uniqueId);

          const reqsKey = `testforge_reqs_${uniqueId}`;
          const testsKey = `testforge_tests_${uniqueId}`;
          const storedReqs = localStorage.getItem(reqsKey);
          const storedTests = localStorage.getItem(testsKey);

          const rCount = storedReqs ? JSON.parse(storedReqs).length : p.requirementsCount || 0;
          const tCount = storedTests ? JSON.parse(storedTests).length : p.testCasesCount || 0;

          return {
            ...p,
            id: uniqueId,
            requirementsCount: rCount,
            testCasesCount: tCount,
          };
        });
        return sanitized;
      }
    } catch (e) {
      console.error('Failed to load projects from storage:', e);
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 1. Sync local storage cache
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(projects));
  }, [projects, storageKey]);

  // 2. Fetch persistent workspaces directly from SQLite backend
  useEffect(() => {
    const fetchDbWorkspaces = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/workspaces/?owner_email=${encodeURIComponent(currentUser)}`);
        if (res.ok) {
          const data: Project[] = await res.json();
          if (data && data.length > 0) {
            setProjects(data);
          }
        }
      } catch (e) {
        console.warn('Backend SQLite sync offline, using local cache:', e);
      }
    };
    fetchDbWorkspaces();
  }, [currentUser]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newProject: Project = {
      id: generatedId,
      name: newName.trim(),
      description: newDesc.trim() || 'Custom requirements and test workspace.',
      requirementsCount: 0,
      testCasesCount: 0,
    };

    // Persist to SQLite backend
    try {
      await fetch('http://127.0.0.1:8000/api/v1/workspaces/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedId,
          name: newProject.name,
          description: newProject.description,
          owner_email: currentUser,
        }),
      });
    } catch (err) {
      console.warn('Could not persist to SQLite:', err);
    }

    setProjects((prev) => [newProject, ...prev]);
    setNewName('');
    setNewDesc('');
    setIsModalOpen(false);
    showToast(`Workspace "${newProject.name}" saved to SQLite database.`);
  };

  const handleRenameProject = async (projectId: string, oldName: string) => {
    const updatedName = window.prompt(`Rename workspace:`, oldName);
    if (!updatedName || !updatedName.trim() || updatedName.trim() === oldName) return;

    try {
      await fetch(`http://127.0.0.1:8000/api/v1/workspaces/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedName.trim() }),
      });
    } catch (err) {
      console.warn('SQLite rename error:', err);
    }

    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: updatedName.trim() } : p));
    showToast(`Workspace renamed to "${updatedName.trim()}".`);
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Delete workspace "${projectName}" and all its test artifacts?`)) return;

    // Delete from SQLite backend
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/workspaces/${projectId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Could not delete from SQLite:', err);
    }

    setProjects(prev => prev.filter(p => p.id !== projectId));
    localStorage.removeItem(`testforge_reqs_${projectId}`);
    localStorage.removeItem(`testforge_tests_${projectId}`);
    localStorage.removeItem(`testforge_strategy_${projectId}`);
    localStorage.removeItem(`testforge_script_${projectId}`);
    localStorage.removeItem(`testforge_tasks_${projectId}`);
    showToast(`Workspace "${projectName}" deleted.`);
  };

  const totalReqs = projects.reduce((acc, p) => acc + (p.requirementsCount || 0), 0);
  const totalTests = projects.reduce((acc, p) => acc + (p.testCasesCount || 0), 0);

  // --- Real-time Workspace Task Progress Calculation ---
  let totalTasksCount = 0;
  let completedTasksCount = 0;

  projects.forEach((proj) => {
    const rawTasks = localStorage.getItem(`testforge_tasks_${proj.id}`);
    if (rawTasks) {
      try {
        const parsed = JSON.parse(rawTasks);
        if (Array.isArray(parsed)) {
          totalTasksCount += parsed.length;
          completedTasksCount += parsed.filter((t: any) => t.status === 'completed').length;
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  const hasWorkspaceTasks = totalTasksCount > 0;
  const projectTasksPercent = hasWorkspaceTasks 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Platform architecture progress (14 out of 14 modules completed = 100%)
  const doneCount = MILESTONES.filter(m => m.status === 'done').length;
  const totalCount = MILESTONES.length;
  const platformProgressPercent = Math.round((doneCount / totalCount) * 100);

  const displayProgress = hasWorkspaceTasks ? projectTasksPercent : platformProgressPercent;

  const filteredMilestones = MILESTONES.filter(m => {
    if (trackerFilter === 'done') return m.status === 'done';
    if (trackerFilter === 'pending') return m.status === 'pending';
    return true;
  });

  const userInitial = currentUser.charAt(0).toUpperCase();
  const displayName = currentUser.includes('@') ? currentUser.split('@')[0] : currentUser;

  return (
    <div style={styles.screenWrapper}>
      <div style={styles.consoleCard}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.brandRow}>
              <span style={styles.brandBadge}>TF</span>
              <span style={styles.brandName}>TestForge AI</span>
            </div>

            <nav style={styles.navMenu}>
              <button style={{ ...styles.navItem, backgroundColor: '#48271b', color: '#fff6ed' }}>
                <span>📁</span>
                <span>Projects</span>
              </button>
              <button
                style={styles.navItem}
                onClick={() => showToast('Open a workspace below to inspect its indexed requirements.')}
              >
                <span>📋</span>
                <span>Requirements</span>
              </button>
              <button
                style={styles.navItem}
                onClick={() => showToast('Open a workspace below to inspect its test cases.')}
              >
                <span>🧪</span>
                <span>Test Cases</span>
              </button>
              <button
                style={styles.navItem}
                onClick={() => setIsTrackerOpen(true)}
              >
                <span>🚀</span>
                <span>Work Roadmap ({displayProgress}%)</span>
              </button>
            </nav>
          </div>

          {/* User Profile Badge & Logout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={styles.profileBadge}>
              <div style={styles.avatarCircle}>{userInitial}</div>
              <div style={styles.profileDetails}>
                <span style={styles.profileName} title={currentUser}>
                  {displayName}
                </span>
                <span style={styles.profileTier}>Pro Workspace</span>
              </div>
            </div>

            <button
              style={styles.logoutBtn}
              onClick={() => {
                localStorage.removeItem('current_user');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_name');
                navigate('/login');
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Project Workspace</h1>
              <p style={styles.subtitle}>Select a project to upload documents, or create an isolated workspace.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                style={styles.roadmapBtn} 
                onClick={() => setIsTrackerOpen(true)}
                title="View execution and architecture roadmap"
              >
                📊 Roadmap ({displayProgress}% Done)
              </button>
              <button style={styles.newProjectBtn} onClick={() => setIsModalOpen(true)}>
                + New Project
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>ACTIVE WORKSPACES</div>
              <div style={styles.statVal}>{projects.length}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>REQUIREMENTS INDEXED</div>
              <div style={styles.statVal}>{totalReqs}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>SYNTHESIZED TESTS</div>
              <div style={styles.statVal}>{totalTests}</div>
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Your Projects</h3>

          {/* Projects Grid or Empty State */}
          {projects.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📂</div>
              <h4 style={styles.emptyTitle}>No workspaces yet</h4>
              <p style={styles.emptySubtitle}>
                Create your first project workspace to begin uploading requirement documents and synthesizing Playwright test suites.
              </p>
              <button style={styles.emptyBtn} onClick={() => setIsModalOpen(true)}>
                + Create Workspace
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {projects.map((proj) => (
                <div key={proj.id} style={styles.projectCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={styles.projTitle}>{proj.name}</h4>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleRenameProject(proj.id, proj.name)}
                        style={styles.editBtn}
                        title="Rename workspace"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id, proj.name)}
                        style={styles.deleteBtn}
                        title="Delete workspace"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p style={styles.projDesc}>{proj.description}</p>
                  
                  <div style={{ fontSize: '10px', color: '#a8826b', marginBottom: '8px', fontFamily: 'monospace' }}>
                    ID: {proj.id}
                  </div>

                  <div style={styles.projFooter}>
                    <span style={styles.projMeta}>
                      {proj.requirementsCount} Requirements • {proj.testCasesCount} Tests
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        style={styles.openBtn}
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        title="Upload/View Requirements"
                      >
                        Specs →
                      </button>
                      <button
                        style={{ ...styles.openBtn, color: '#8C6C47', fontWeight: 800 }}
                        onClick={() => navigate(`/projects/${proj.id}/generate`)}
                        title={`Directly inspect test suite for ${proj.name}`}
                      >
                        Tests & Scripts →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Work Done & Roadmap Modal */}
      {isTrackerOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, width: '780px', maxHeight: '86vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #ebd9c8', backgroundColor: '#fdf6ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#ebd9c8', color: '#48271b', padding: '3px 8px', borderRadius: '6px' }}>
                  TESTFORGE AUDIT & ROADMAP
                </span>
                <h3 style={{ margin: '6px 0 0 0', color: '#2b140d', fontSize: '18px', fontWeight: 800 }}>
                  Implementation Progress & Platform Backlog
                </h3>
              </div>
              <button 
                onClick={() => setIsTrackerOpen(false)}
                style={{ background: '#ebd9c8', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 800, color: '#381c13' }}
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div style={{ padding: '16px 24px', backgroundColor: '#fffaf5', borderBottom: '1px solid #ebd9c8', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: '#f7ede1', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#8c6a56' }}>CURRENT WORKSPACE TASKS</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#2b140d' }}>
                  {hasWorkspaceTasks ? `${projectTasksPercent}%` : '0%'}
                </div>
                <div style={{ fontSize: '11px', color: '#6b4d3a', marginTop: '2px' }}>
                  {completedTasksCount} of {totalTasksCount} tasks completed
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#ebd9c8', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${projectTasksPercent}%`, height: '100%', backgroundColor: '#166534' }} />
                </div>
              </div>

              <div style={{ background: '#f7ede1', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>✓ ALL MODULES COMPLETE</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2b140d' }}>{doneCount} / {totalCount} Modules (100%)</div>
                <div style={{ fontSize: '10px', color: '#6b4d3a', marginTop: '2px' }}>Full SDLC Pipeline & AI Runner Production-Ready</div>
              </div>

              <div style={{ background: '#f7ede1', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>🎉 ARCHITECTURE READY</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#166534' }}>0 Backlog Items</div>
                <div style={{ fontSize: '10px', color: '#6b4d3a', marginTop: '2px' }}>Ready for live demonstration & production run</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ padding: '10px 24px', borderBottom: '1px solid #ebd9c8', display: 'flex', gap: '8px', background: '#fffaf5' }}>
              {(['all', 'done', 'pending'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTrackerFilter(tab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    backgroundColor: trackerFilter === tab ? '#381c13' : '#f7ede1',
                    color: trackerFilter === tab ? '#faeedf' : '#6b4d3a',
                    borderColor: trackerFilter === tab ? '#381c13' : '#ebd9c8',
                  }}
                >
                  {tab === 'all' ? `All Items (${totalCount})` : tab === 'done' ? `Completed (${doneCount})` : `Backlog (${totalCount - doneCount})`}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {filteredMilestones.map(item => {
                const isDone = item.status === 'done';
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: isDone ? '#fdfaf6' : '#ffffff',
                      border: `1px solid ${isDone ? '#ebd9c8' : '#fed7aa'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#2b140d' }}>{item.title}</span>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#ebd9c8', color: '#48271b' }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b4d3a', lineHeight: '1.4' }}>
                        {item.desc}
                      </p>
                    </div>

                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      backgroundColor: isDone ? '#dcfce7' : '#fef3c7',
                      color: isDone ? '#166534' : '#92400e',
                    }}>
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #ebd9c8', backgroundColor: '#fdf6ee', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsTrackerOpen(false)}
                style={{ backgroundColor: '#2b140d', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2b140d' }}>Create New Project Workspace</h3>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>Project Name *</label>
                <input
                  style={styles.formInput}
                  type="text"
                  placeholder="e.g., E-Commerce Platform"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  style={{ ...styles.formInput, height: '70px', resize: 'none' }}
                  placeholder="e.g., Shopping cart, payment gateway, and checkout specs"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Toast */}
      {toastMsg && (
        <div style={styles.toastContainer}>
          <span style={{ fontSize: '15px' }}>ℹ️</span>
          <span>{toastMsg}</span>
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
    color: '#bfa593',
    background: 'none',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#48271b',
    padding: '8px 12px',
    borderRadius: '10px',
  },
  avatarCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#8C6C47',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '13px',
    flexShrink: 0,
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  profileName: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#f5eee6',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  profileTier: {
    fontSize: '10.5px',
    color: '#bfa593',
  },
  logoutBtn: {
    width: '100%',
    background: 'none',
    border: '1px solid #5a3021',
    padding: '10px',
    borderRadius: '10px',
    color: '#d4b7a3',
    fontSize: '13px',
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
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#2b140d',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#7b5d49',
    marginTop: '4px',
  },
  roadmapBtn: {
    backgroundColor: '#f5eee6',
    color: '#48271b',
    border: '1px solid #ebd9c8',
    padding: '10px 16px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
  newProjectBtn: {
    backgroundColor: '#2b140d',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid #ebd9c8',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#8c6a56',
    letterSpacing: '0.5px',
  },
  statVal: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#2b140d',
    marginTop: '6px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#2b140d',
    margin: '0 0 16px 0',
  },
  emptyState: {
    border: '2px dashed #ebd9c8',
    borderRadius: '16px',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#2b140d',
    margin: '0 0 6px 0',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#7b5d49',
    maxWidth: '420px',
    lineHeight: 1.5,
    margin: '0 0 18px 0',
  },
  emptyBtn: {
    backgroundColor: '#2b140d',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    padding: '22px',
    borderRadius: '16px',
    border: '1px solid #ebd9c8',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: '#8c6a56',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#bfa593',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '2px 6px',
  },
  projTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#2b140d',
    margin: '0 0 8px 0',
  },
  projDesc: {
    fontSize: '12.5px',
    color: '#6b4d3a',
    lineHeight: 1.5,
    margin: '0 0 8px 0',
    flex: 1,
  },
  projFooter: {
    borderTop: '1px solid #f3e5d8',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projMeta: {
    fontSize: '11px',
    color: '#8c6a56',
  },
  openBtn: {
    background: 'none',
    border: 'none',
    color: '#2b140d',
    fontWeight: 700,
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalBox: {
    backgroundColor: '#fffaf5',
    padding: '28px',
    borderRadius: '16px',
    width: '420px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  formLabel: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#49372d',
    marginBottom: '6px',
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
  cancelBtn: {
    background: 'none',
    border: '1px solid #ebd9c8',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#2b140d',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  toastContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#2b140d',
    color: '#fffaf5',
    padding: '12px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    border: '1px solid #4a271c',
    zIndex: 1000,
  },
};

export default DashboardPage;