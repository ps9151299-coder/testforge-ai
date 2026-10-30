import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Derive readable user name from email
      const namePart = cleanEmail.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      const userSession = {
        name: displayName || 'Pragati Singh',
        email: cleanEmail,
        token: `mock_jwt_token_${Date.now()}`,
        role: 'DEI Academic Researcher',
      };

      localStorage.setItem('user', JSON.stringify(userSession));
      if (rememberMe) {
        localStorage.setItem('remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('remembered_email');
      }

      setIsLoading(false);
      navigate('/dashboard');
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    setEmail('pragati.dei@gmail.com');
    setPassword('TestForge2026!');
    setIsLoading(true);

    setTimeout(() => {
      const userSession = {
        name: 'Pragati Singh',
        email: 'pragati.dei@gmail.com',
        token: `mock_jwt_token_${Date.now()}`,
        role: 'DEI Academic Researcher',
      };
      localStorage.setItem('user', JSON.stringify(userSession));
      navigate('/dashboard');
    }, 350);
  };

  return (
    <div style={styles.screenWrapper}>
      <div style={styles.cardContainer}>
        {/* Left Hero Pane */}
        <div style={styles.heroPane}>
          <div style={styles.brandRow}>
            <span style={styles.brandBadge}>TF</span>
            <span style={styles.brandName}>TestForge AI</span>
          </div>

          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <h2 style={styles.heroTitle}>WELCOME</h2>
            <div style={styles.heroSub}>TESTFORGE AI PLATFORM</div>
            <p style={styles.heroDescription}>
              Transform software requirements into comprehensive test strategies, automated test suites,
              and actionable quality reports in seconds.
            </p>
          </div>

          <div style={styles.footerNote}>
            Dayalbagh Educational Institute • Department of Physics & Computer Science
          </div>
        </div>

        {/* Right Form Pane */}
        <div style={styles.formPane}>
          <h2 style={styles.formTitle}>Sign in</h2>
          <p style={styles.formSubtitle}>Fill in your details to continue to your workspace.</p>

          {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.inputField}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showHideBtn}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div style={styles.optionsRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2b140d' }}
                />
                Remember me
              </label>
              <span
                style={styles.forgotLink}
                onClick={() => alert('Demo Reset: You can sign in directly with any email and password.')}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? 'Signing In...' : 'Sign in'}
            </button>

            <button type="button" onClick={handleQuickDemoLogin} style={styles.demoBtn}>
              ⚡ 1-Click Examiner Demo Login
            </button>
          </form>

          <p style={styles.signupPrompt}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.signupLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
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
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  cardContainer: {
    width: '100%',
    maxWidth: '920px',
    minHeight: '520px',
    backgroundColor: '#f7ede1',
    borderRadius: '20px',
    display: 'flex',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
  },
  heroPane: {
    flex: 1.1,
    backgroundColor: '#2b140d',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
  heroTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '1px',
    margin: '0 0 4px 0',
  },
  heroSub: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#d4a373',
    letterSpacing: '1.5px',
    marginBottom: '16px',
  },
  heroDescription: {
    fontSize: '13.5px',
    color: '#d4b7a3',
    lineHeight: 1.6,
    margin: 0,
  },
  footerNote: {
    fontSize: '11px',
    color: '#8c6a56',
  },
  formPane: {
    flex: 1,
    padding: '44px 38px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#faf2e9',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#2b140d',
    margin: '0 0 4px 0',
  },
  formSubtitle: {
    fontSize: '12.5px',
    color: '#7b5d49',
    margin: '0 0 20px 0',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '14px',
    border: '1px solid #fecaca',
  },
  inputField: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ebd9c8',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#2b140d',
    outline: 'none',
    boxSizing: 'border-box',
  },
  showHideBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: 700,
    color: '#8c6a56',
    cursor: 'pointer',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#7b5d49',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  forgotLink: {
    color: '#8c6a56',
    cursor: 'pointer',
    fontWeight: 600,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#2b140d',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '6px',
  },
  demoBtn: {
    width: '100%',
    backgroundColor: '#eaddcf',
    color: '#2b140d',
    border: '1px dashed #bfa593',
    padding: '9px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  signupPrompt: {
    fontSize: '12px',
    color: '#7b5d49',
    textAlign: 'center',
    marginTop: '20px',
    marginBottom: 0,
  },
  signupLink: {
    color: '#2b140d',
    fontWeight: 700,
    textDecoration: 'none',
  },
};

export default LoginPage;