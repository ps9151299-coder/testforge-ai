import React, { useState } from 'react';

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
    desc: 'Local session tracking in localStorage ("current_user"), persistent profile badge in lower sidebar with user initials & "Pro Workspace" tier, safe sign-out routing to /login.',
    badge: 'Completed'
  },
  {
    id: 'dashboard-sync',
    title: '2. Dashboard & Workspace Orchestration',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Dynamic real-time counters (Workspaces, Requirements, Synthesized Tests), two-way reconciliation hooks preventing reset to 0, split-routing (Specs → and Tests & Scripts →), and non-blocking toast alerts.',
    badge: 'Completed'
  },
  {
    id: 'req-pipeline',
    title: '3. Requirement Ingestion Pipeline',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Multi-format ingestion (.pdf, .docx, .txt), documentService & generateService backend extraction, and structured Parsed Specs matrix (Req ID, Type, Actor, Behavior, Status).',
    badge: 'Completed'
  },
  {
    id: 'strategy-synthesis',
    title: '4. AI Test Strategy & Case Synthesis',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: '5-part test strategy (Objective/Scope, Levels, Entry/Exit criteria, Risks), test scenario matrix (Positive, Negative, Edge, Security), and full TypeScript @playwright/test generation.',
    badge: 'Completed'
  },
  {
    id: 'persistent-state',
    title: '5. Persistent State & Artifact Storage',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: 'Cache-first lazy initialization via localStorage keys (strategy, tests, script), and useEffect lifecycle safeguards to prevent unnecessary AI re-synthesis on navigation.',
    badge: 'Completed'
  },
  {
    id: 'export-runner',
    title: '6. Export Pipeline & Live Automation Runner',
    category: 'Part 1: Completed Work',
    status: 'done',
    desc: '.spec.ts download, CSV test matrix export for Jira/Zephyr, target environment URL setting, headless subprocess execution (POST /api/v1/execute/run-playwright), and embedded ANSI terminal.',
    badge: 'Completed'
  },

  // --- PART 2: WHAT IS LEFT TO BUILD ---
  {
    id: 'db-transition',
    title: '1. Database Transition (SQLite / PostgreSQL)',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Migrate workspaces, requirement records, and test artifacts out of localStorage into persistent relational tables using SQLAlchemy or SQLModel.',
    badge: 'High Priority'
  },
  {
    id: 'backend-jwt',
    title: '2. Backend User Authentication (JWT)',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Replace localStorage keys with authenticated FastAPI endpoints (/api/v1/auth/login and /register) backed by hashed database credentials.',
    badge: 'High Priority'
  },
  {
    id: 'heuristic-filtering',
    title: '3. Academic & Cover Page Filtering',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Implement extraction prompts and regex filters to eliminate non-functional academic boilerplates (faculty names, university headers, certificates).',
    badge: 'Pending'
  },
  {
    id: 'token-chunking',
    title: '4. Chunking for Large PRDs (30+ Pages)',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Implement token-aware sliding window chunking to prevent context overflow errors during LLM document extraction.',
    badge: 'Pending'
  },
  {
    id: 'visual-html-report',
    title: '5. Visual HTML Test Reports & Traces',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Integrate native Playwright HTML reporter output (playwright-report/index.html) into the frontend to inspect visual traces, steps, and execution timings.',
    badge: 'Pending'
  },
  {
    id: 'screenshot-artifacts',
    title: '6. Screenshot & Failure Artifact Capture',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Configure Playwright test runner to capture screenshots on assertion failures and expose them in the browser runner interface.',
    badge: 'Pending'
  },
  {
    id: 'sse-streaming',
    title: '7. WebSocket / SSE Terminal Streaming',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Replace batch HTTP response polling with real-time streaming of stdout/stderr logs into the terminal line-by-line.',
    badge: 'Pending'
  },
  {
    id: 'workspace-mutation',
    title: '8. Workspace Mutation Actions & Req Editing',
    category: 'Part 2: What Is Left to Build',
    status: 'pending',
    desc: 'Add 3-dot dropdown menus to rename or delete workspaces (cascading cleanup) and enable inline editing/deletion of parsed requirement rows.',
    badge: 'Pending'
  }
];

export const WorkTrackerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'done' | 'pending'>('all');

  if (!isOpen) return null;

  const doneCount = MILESTONES.filter(m => m.status === 'done').length;
  const totalCount = MILESTONES.length;
  const progressPercent = Math.round((doneCount / totalCount) * 100);

  const displayedList = MILESTONES.filter(item => {
    if (activeTab === 'done') return item.status === 'done';
    if (activeTab === 'pending') return item.status === 'pending';
    return true;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(52, 38, 23, 0.55)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FDFBF7',
        border: '1px solid #EDE4D3',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(52, 38, 23, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #EDE4D3',
          backgroundColor: '#F7F3EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#DECDB6',
                color: '#513D26',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                ROADMAP AUDIT
              </span>
              <span style={{ fontSize: '12px', color: '#8C6C47', fontWeight: 600 }}>
                TestForge AI Implementation Tracker
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#342617', margin: '4px 0 0 0' }}>
              Completed Work vs. Backlog
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#EDE4D3',
              border: 'none',
              cursor: 'pointer',
              color: '#513D26',
              fontWeight: 'bold',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#FAF6EF',
          borderBottom: '1px solid #EDE4D3',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ padding: '12px 16px', background: '#FFFFFF', border: '1px solid #EDE4D3', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#8C6C47', fontWeight: 700, letterSpacing: '0.5px' }}>OVERALL COMPLETION</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#513D26' }}>{progressPercent}%</span>
              <span style={{ fontSize: '12px', color: '#8C6C47' }}>({doneCount} of {totalCount} items)</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#EDE4D3', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#8C6C47', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: '#FFFFFF', border: '1px solid #EDE4D3', borderRadius: '10px' }}>
            <div style={{ color: '#2E7D32', fontSize: '12px', fontWeight: 700 }}>✓ Part 1: Work Done</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#342617', marginTop: '4px' }}>6 Modules Built</div>
            <div style={{ fontSize: '11px', color: '#8C6C47', marginTop: '2px' }}>Auth, Dashboard, Ingestion, Strategy, Storage, Runner</div>
          </div>

          <div style={{ padding: '12px 16px', background: '#FFFFFF', border: '1px solid #EDE4D3', borderRadius: '10px' }}>
            <div style={{ color: '#B45309', fontSize: '12px', fontWeight: 700 }}>⏳ Part 2: Backlog</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#342617', marginTop: '4px' }}>8 Tasks Remaining</div>
            <div style={{ fontSize: '11px', color: '#8C6C47', marginTop: '2px' }}>SQL DB, JWT, Reports, Chunking, SSE, Actions</div>
          </div>
        </div>

        {/* Tab Filter Buttons */}
        <div style={{ padding: '10px 24px', borderBottom: '1px solid #EDE4D3', display: 'flex', gap: '8px', background: '#FDFBF7' }}>
          {(['all', 'done', 'pending'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid',
                backgroundColor: activeTab === tab ? '#8C6C47' : '#F7F3EB',
                color: activeTab === tab ? '#FFFFFF' : '#6E5334',
                borderColor: activeTab === tab ? '#8C6C47' : '#EDE4D3'
              }}
            >
              {tab === 'all' ? `All (${totalCount})` : tab === 'done' ? `Part 1 Done (${doneCount})` : `Part 2 Backlog (${totalCount - doneCount})`}
            </button>
          ))}
        </div>

        {/* List of Deliverables */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedList.map(item => {
            const isDone = item.status === 'done';
            return (
              <div
                key={item.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: isDone ? '#FAF7F2' : '#FFFFFF',
                  border: `1px solid ${isDone ? '#EDE4D3' : '#F0E2C8'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    marginTop: '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? '#DCFCE7' : '#FEF3C7',
                    color: isDone ? '#166534' : '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {isDone ? '✓' : '•'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#342617' }}>{item.title}</span>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#EDE4D3', color: '#6E5334' }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6E5334', lineHeight: '1.45' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                  backgroundColor: isDone ? '#E8F5E9' : '#FEF3C7',
                  color: isDone ? '#2E7D32' : '#92400E',
                  border: `1px solid ${isDone ? '#C8E6C9' : '#FDE68A'}`
                }}>
                  {item.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #EDE4D3',
          backgroundColor: '#F7F3EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#8C6C47' }}>TestForge AI Platform Specifications</span>
          <button
            onClick={onClose}
            className="btn-sand-primary"
            style={{
              padding: '6px 18px',
              backgroundColor: '#8C6C47',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};