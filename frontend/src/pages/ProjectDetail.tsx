import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { generateService } from '../services/generateService';

interface RequirementItem {
  id: string;
  title: string;
  type: string;
  actor: string;
  expectedBehavior: string;
  status: string;
}

export const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const currentProjectId = projectId || 'proj-0288';

  const [activeTab, setActiveTab] = useState<'upload' | 'requirements'>('upload');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Check if test cases already exist for this project
  const hasExistingTests = !!localStorage.getItem(`testforge_tests_${currentProjectId}`);

  // Helper to persist requirement count to the user's project list
  const syncRequirementCount = (count: number) => {
    const currentUser = localStorage.getItem('current_user') || 'default_user';
    const storageKey = `testforge_projects_${currentUser}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const list = JSON.parse(raw);
      const updated = list.map((p: any) => {
        if (p.id === currentProjectId || list.length === 1) {
          return {
            ...p,
            requirementsCount: count,
          };
        }
        return p;
      });
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to sync project count:', err);
    }
  };

  // Load any previously saved requirements from localStorage for this project
  useEffect(() => {
    const targetKey = `testforge_reqs_${currentProjectId}`;
    const fallbackKey = `reqs_${currentProjectId}`;
    const saved = localStorage.getItem(targetKey) || localStorage.getItem(fallbackKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRequirements(parsed);
        if (parsed.length > 0) {
          setActiveTab('requirements');
          syncRequirementCount(parsed.length);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentProjectId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file.name);
    setIsUploading(true);

    try {
      // 1. Upload to backend and extract text
      const uploadRes = await documentService.uploadDocument(file);

      // 2. Extract requirement entities via AI synthesis service
      const parsedReqs = await generateService.extractRequirements(uploadRes.extracted_text);

      // 3. Update state & localStorage
      setRequirements(parsedReqs);
      localStorage.setItem(`testforge_reqs_${currentProjectId}`, JSON.stringify(parsedReqs));
      localStorage.setItem(`reqs_${currentProjectId}`, JSON.stringify(parsedReqs));
      localStorage.setItem('active_requirements', JSON.stringify(parsedReqs));

      // 4. Immediately sync count to project list
      syncRequirementCount(parsedReqs.length);

      setIsUploading(false);
      setActiveTab('requirements');
      showToast(`Successfully indexed ${parsedReqs.length} requirements from ${file.name}`);
    } catch (err: any) {
      setIsUploading(false);
      const detail = err.response?.data?.detail || err.message || 'Failed to process document';
      showToast(`Upload error: ${detail}`);
    }
  };

  const handleSynthesizeClick = () => {
    localStorage.setItem('active_requirements', JSON.stringify(requirements));
    localStorage.setItem(`testforge_reqs_${currentProjectId}`, JSON.stringify(requirements));
    syncRequirementCount(requirements.length);
    navigate(`/projects/${currentProjectId}/generate`);
  };

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
              <button onClick={() => navigate('/dashboard')} style={styles.navItem}>
                <span>⬅</span>
                <span>Back to Projects</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  ...styles.navItem,
                  backgroundColor: activeTab === 'upload' ? '#48271b' : 'transparent',
                  color: activeTab === 'upload' ? '#fff6ed' : '#bfa593',
                }}
              >
                <span>📄</span>
                <span>Requirement Docs</span>
              </button>
              <button
                onClick={() => setActiveTab('requirements')}
                style={{
                  ...styles.navItem,
                  backgroundColor: activeTab === 'requirements' ? '#48271b' : 'transparent',
                  color: activeTab === 'requirements' ? '#fff6ed' : '#bfa593',
                }}
              >
                <span>📋</span>
                <span>Parsed Specs ({requirements.length})</span>
              </button>
            </nav>
          </div>

          <button style={styles.logoutBtn} onClick={() => navigate('/dashboard')}>
            Close Project
          </button>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <div style={styles.header}>
            <div>
              <div style={styles.badge}>WORKSPACE: {currentProjectId}</div>
              <h1 style={styles.title}>Requirement Ingestion</h1>
              <p style={styles.subtitle}>
                Upload SDLC specs, SRS, or PRD files to automatically parse functional entities.
              </p>
            </div>
            <button style={styles.primaryBtn} onClick={handleSynthesizeClick}>
              {hasExistingTests ? '🧪 View Tests & Scripts →' : '✨ Synthesize Test Strategy'}
            </button>
          </div>

          {/* TAB 1: Upload Document */}
          {activeTab === 'upload' && (
            <div style={styles.uploadArea}>
              <div style={styles.uploadBox}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>📂</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#2b140d' }}>
                  {isUploading ? 'Parsing document with AI...' : 'Upload Software Specification'}
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#7a5a46' }}>
                  Supports PDF (.pdf), Microsoft Word (.docx), and Plain Text (.txt)
                </p>

                <input
                  type="file"
                  id="spec-upload"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label htmlFor="spec-upload" style={isUploading ? styles.uploadBtnDisabled : styles.uploadBtn}>
                  {isUploading ? 'Ingesting & Analyzing...' : 'Browse Documents'}
                </label>

                {uploadedFile && !isUploading && (
                  <div style={styles.uploadedInfo}>
                    ✅ Loaded: <strong>{uploadedFile}</strong> ({requirements.length} requirements parsed)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Parsed Requirements Table */}
          {activeTab === 'requirements' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, color: '#2b140d', fontSize: '16px' }}>Identified Requirements</h3>
                <span style={{ fontSize: '12px', color: '#7a5a46', fontWeight: 600 }}>
                  Total Entities: {requirements.length}
                </span>
              </div>

              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.trHead}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Requirement Title</th>
                      <th style={styles.th}>Actor</th>
                      <th style={styles.th}>Expected Behavior</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.map((req) => (
                      <tr key={req.id} style={styles.tr}>
                        <td style={styles.tdBold}>{req.id}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              req.type === 'Functional'
                                ? styles.tagFunctional
                                : styles.tagNonFunctional
                            }
                          >
                            {req.type}
                          </span>
                        </td>
                        <td style={styles.tdBold}>{req.title}</td>
                        <td style={styles.td}>{req.actor}</td>
                        <td style={styles.td}>{req.expectedBehavior}</td>
                        <td style={styles.td}>
                          <span style={styles.tagStatus}>{req.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
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
    transition: 'all 0.15s ease',
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
    marginBottom: '26px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#8c6a56',
    marginBottom: '4px',
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
  primaryBtn: {
    backgroundColor: '#2b140d',
    color: '#ffffff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '13.5px',
    cursor: 'pointer',
  },
  uploadArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  uploadBox: {
    width: '100%',
    maxWidth: '520px',
    border: '2px dashed #d5bca9',
    borderRadius: '16px',
    padding: '46px 20px',
    textAlign: 'center',
    backgroundColor: '#fbf5ed',
  },
  uploadBtn: {
    display: 'inline-block',
    backgroundColor: '#2b140d',
    color: '#fff',
    padding: '10px 22px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  uploadBtnDisabled: {
    display: 'inline-block',
    backgroundColor: '#8c766b',
    color: '#fff',
    padding: '10px 22px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'not-allowed',
  },
  uploadedInfo: {
    marginTop: '18px',
    fontSize: '13px',
    color: '#2b140d',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #ebd9c8',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12.5px',
  },
  trHead: {
    backgroundColor: '#faf2e9',
    borderBottom: '1px solid #ebd9c8',
  },
  th: {
    padding: '12px 14px',
    fontWeight: 700,
    color: '#5a3a29',
  },
  tr: {
    borderBottom: '1px solid #f4ede6',
  },
  td: {
    padding: '12px 14px',
    color: '#49372d',
    verticalAlign: 'top',
  },
  tdBold: {
    padding: '12px 14px',
    color: '#2b140d',
    fontWeight: 600,
    verticalAlign: 'top',
  },
  tagFunctional: {
    backgroundColor: '#e7f0fa',
    color: '#1a56db',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
  },
  tagNonFunctional: {
    backgroundColor: '#f4ebf8',
    color: '#6e1fa2',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
  },
  tagStatus: {
    backgroundColor: '#eef2e6',
    color: '#2e5a1e',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
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

export default ProjectDetailPage;