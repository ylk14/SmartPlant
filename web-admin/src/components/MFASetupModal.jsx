import React, { useState } from 'react';
import { postVerifyMfa } from '../services/apiClient'; // ⭐ ADDED

export default function MFASetupModal({ user, onClose, onMFASetupComplete }) {
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // ⭐ UPDATED — REAL backend setup
  const initiateMFASetup = async () => {
    try {
      const response = await fetch('/api/mfa/setup', {   // ⭐ UPDATED
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.user_id })
      });

      const data = await response.json();
      setQrCodeUrl(data.qrCodeUrl);
      setStep(2);

    } catch (error) {
      console.error('MFA setup failed:', error);
    }
  };

  // ⭐ UPDATED — REAL backend verify
  const verifyMFACode = async () => {
    try {
      // ⭐ CALL REAL FUNCTION
      const result = await postVerifyMfa(user.challenge_id, verificationCode);

      if (result.success) {
        onMFASetupComplete(user.user_id);
        onClose();
      } else {
        alert(result.message || "Invalid code");
      }

    } catch (error) {
      console.error('MFA verification failed:', error);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Setup Multi-Factor Authentication</h3>
        <p>For user: {user.username}</p>

        {step === 1 && (
          <div>
            <p>Click to start MFA setup process:</p>
            <button onClick={initiateMFASetup}>
              Generate QR Code
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p>Scan this QR code with your authenticator app:</p>
            {qrCodeUrl && <img src={qrCodeUrl} alt="MFA QR Code" />}
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button onClick={verifyMFACode}>
              Verify & Enable MFA
            </button>
          </div>
        )}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  
  mfaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  
  mfaEnabled: {
    color: '#22C55E',
    fontWeight: '600',
    fontSize: '12px'
  },
  
  mfaDisabled: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: '12px'
  },
  
  mfaSetupBtn: {
    padding: '4px 8px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  }
};