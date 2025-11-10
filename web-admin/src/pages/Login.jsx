import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [step, setStep] = useState(1); // 1: credentials, 2: Email MFA
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [mockCode, setMockCode] = useState(''); // Store the mock code for testing

  // Mock admin user for testing
  const MOCK_ADMIN = {
    email: "admin@smartplant.dev",
    password: "admin123",
    name: "Administrator",
    role: "Admin",
    userId: 1
  };

  // Generate a random 6-digit code
  const generateMockCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock credential verification
      if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
        // Store email for MFA step
        setUserEmail(email);
        
        // Generate and display mock code
        const code = generateMockCode();
        setMockCode(code);
        
        // Simulate sending code to email
        console.log(`🔐 MOCK EMAIL: Your verification code is ${code}`);
        
        setStep(2);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock MFA code verification
      if (mfaCode === mockCode) {
        // Success - login user
        onLogin({
          name: MOCK_ADMIN.name,
          email: MOCK_ADMIN.email,
          role: MOCK_ADMIN.role,
          userId: MOCK_ADMIN.userId
        });
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate new mock code
      const newCode = generateMockCode();
      setMockCode(newCode);
      
      // Simulate resending code
      console.log(`🔐 MOCK EMAIL: Your new verification code is ${newCode}`);
      
      setError('New code sent to your email! Check the browser console for the code.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.slice(0, 2) + '*'.repeat(local.length - 2);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>Smart Plant Sarawak</h1>
          <p style={styles.subtitle}>Admin Portal</p>
          
          {/* MOCK TESTING BANNER - Remove in production */}
          <div style={styles.mockBanner}>
            <strong>TEST MODE</strong> - Use: <code>admin@smartplant.dev</code> / <code>admin123</code>
          </div>
        </div>

        {error && (
          <div style={error.includes('sent') ? styles.successBox : styles.errorBox}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleCredentialsSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartplant.dev"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
              />
            </div>

            <button 
              type="submit" 
              style={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Mock credentials hint */}
            <div style={styles.mockHint}>
              <p><strong>Test Credentials:</strong></p>
              <p>Email: <code>admin@smartplant.dev</code></p>
              <p>Password: <code>admin123</code></p>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleMFASubmit} style={styles.form}>
            <div style={styles.mfaHeader}>
              <div style={styles.mfaIcon}>📧</div>
              <h3 style={styles.mfaTitle}>Email Verification</h3>
              <p style={styles.mfaSubtitle}>
                We sent a 6-digit code to <strong>{maskEmail(userEmail)}</strong>
              </p>
              <p style={styles.mfaHint}>
                Check your email and enter the code below
              </p>
              
              {/* MOCK CODE DISPLAY - Remove in production */}
              <div style={styles.mockCodeDisplay}>
                <p><strong>🛠️ DEVELOPMENT MODE</strong></p>
                <p>Your verification code is: <code style={styles.code}>{mockCode}</code></p>
                <p style={styles.mockNote}>(In production, this would be sent to your email)</p>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>6-Digit Code</label>
              <input
                type="text"
                style={styles.input}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <div style={styles.buttonGroup}>
              <button 
                type="button" 
                style={styles.backButton}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
              <button 
                type="submit" 
                style={styles.verifyButton}
                disabled={loading || mfaCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

            <div style={styles.resendContainer}>
              <p style={styles.resendText}>
                Didn't receive the code?
              </p>
              <button 
                type="button"
                style={styles.resendButton}
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div style={styles.footer}>
          <p style={styles.helpText}>
            Need help? Contact system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F6F9F4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '450px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1F2A37',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 16px 0',
  },
  mockBanner: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #F59E0B',
    color: '#92400E',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    marginTop: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  loginButton: {
    padding: '12px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  mfaHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  mfaIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  mfaTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2A37',
    margin: '0 0 8px 0',
  },
  mfaSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  mfaHint: {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  mockCodeDisplay: {
    backgroundColor: '#F3F4F6',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '16px',
  },
  code: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  mockNote: {
    fontSize: '11px',
    color: '#6B7280',
    margin: '8px 0 0 0',
    fontStyle: 'italic',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  backButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  verifyButton: {
    flex: 2,
    padding: '12px 16px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  resendContainer: {
    textAlign: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #F3F4F6',
  },
  resendText: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  resendButton: {
    backgroundColor: 'transparent',
    color: '#3B82F6',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  mockHint: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
    color: '#475569',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  helpText: {
    fontSize: '12px',
    color: '#9CA3AF',
    margin: '0',
  },
};

export default Login;