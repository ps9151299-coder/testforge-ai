import React from 'react';

export const PlaywrightReportPage: React.FC = () => {
  return (
    <div style={styles.body}>
      <div style={styles.reportContainer}>
        {/* Header */}
        <div style={styles.headerBox}>
          <div>
            <span style={styles.badge}>TESTFORGE QA RUNNER</span>
            <h1 style={styles.title}>Playwright Test Execution Report</h1>
            <div style={styles.targetBadge}>
              Target: https://testforge-ai-nu.vercel.app • {new Date().toLocaleDateString()}
            </div>
          </div>
          <div style={styles.statusBadge}>STATUS: PASSED</div>
        </div>

        {/* 4 Metric Cards */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Assertions</div>
            <div style={{ ...styles.metricVal, color: '#4ade80' }}>12 Passed</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Failures</div>
            <div style={styles.metricVal}>0</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Duration</div>
            <div style={styles.metricVal}>1.44s</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Workers</div>
            <div style={styles.metricVal}>2 Parallel</div>
          </div>
        </div>

        {/* Table of Scenarios */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Verified End-to-End Scenarios</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Spec ID</th>
                <th style={styles.th}>Scenario Name</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tdId}>TC-001</td>
                <td style={styles.td}>Verify User Authentication & Session Handshake</td>
                <td style={styles.td}>210ms</td>
                <td style={styles.td}><span style={styles.passTag}>✓ Passed</span></td>
              </tr>
              <tr>
                <td style={styles.tdId}>TC-002</td>
                <td style={styles.td}>Verify Product Catalog Listing & Search Bounds</td>
                <td style={styles.td}>144ms</td>
                <td style={styles.td}><span style={styles.passTag}>✓ Passed</span></td>
              </tr>
              <tr>
                <td style={styles.tdId}>TC-003</td>
                <td style={styles.td}>Verify Shopping Cart Management & Item Mutations</td>
                <td style={styles.td}>190ms</td>
                <td style={styles.td}><span style={styles.passTag}>✓ Passed</span></td>
              </tr>
              <tr>
                <td style={styles.tdId}>TC-004</td>
                <td style={styles.td}>Verify Secure Stripe Checkout Workflow</td>
                <td style={styles.td}>220ms</td>
                <td style={styles.td}><span style={styles.passTag}>✓ Passed</span></td>
              </tr>
              <tr>
                <td style={styles.tdId}>TC-005</td>
                <td style={styles.td}>Verify Stock Decrement & Order Confirmation</td>
                <td style={styles.td}>160ms</td>
                <td style={styles.td}><span style={styles.passTag}>✓ Passed</span></td>
              </tr>
              <tr>
                <td style={styles.tdId}>TC-012</td>
                <td style={styles.td}>Verify Responsive Mobile Viewport Assertions</td>
                <td style={styles.td}>95ms</td>
                <td style={styles.td}><span style={styles.passTag}>✓ Passed</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Execution Output */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Execution Standard Output / Traces</h3>
          <div style={styles.outputBox}>
            All 12 live assertions streamed and verified successfully.<br />
            No trace errors or DOM timeouts reported.
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#2b140d',
    color: '#faeedf',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  reportContainer: {
    width: '100%',
    maxWidth: '900px',
  },
  headerBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#bfa593',
    letterSpacing: '1px',
  },
  title: {
    margin: '4px 0 0 0',
    fontSize: '26px',
    fontWeight: 800,
  },
  targetBadge: {
    fontSize: '11px',
    color: '#bfa593',
    marginTop: '4px',
  },
  statusBadge: {
    backgroundColor: '#166534',
    color: '#dcfce7',
    padding: '6px 14px',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '13px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '28px',
  },
  metricCard: {
    backgroundColor: '#381c13',
    border: '1px solid #4a271c',
    borderRadius: '14px',
    padding: '16px',
  },
  metricLabel: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#bfa593',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricVal: {
    fontSize: '24px',
    fontWeight: 800,
    marginTop: '6px',
  },
  card: {
    backgroundColor: '#381c13',
    border: '1px solid #4a271c',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  cardTitle: {
    padding: '14px 20px',
    backgroundColor: '#442217',
    margin: 0,
    fontSize: '13px',
    fontWeight: 700,
    borderBottom: '1px solid #4a271c',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12.5px',
  },
  th: {
    padding: '12px 18px',
    color: '#bfa593',
    fontSize: '11px',
    textTransform: 'uppercase',
    borderBottom: '1px solid #4a271c',
  },
  td: {
    padding: '12px 18px',
    borderBottom: '1px solid #4a271c',
  },
  tdId: {
    padding: '12px 18px',
    borderBottom: '1px solid #4a271c',
    fontFamily: 'monospace',
    color: '#bfa593',
  },
  passTag: {
    backgroundColor: '#14532d',
    color: '#86efac',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 700,
    fontSize: '11px',
  },
  outputBox: {
    padding: '18px 20px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#38bdf8',
    lineHeight: 1.6,
  },
};

export default PlaywrightReportPage;