import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../utils/supabaseClient';
import './Login.css';

// Password strength checker
function getPasswordStrength(password) {
  if (!password || password.length === 0) return null;
  if (password.length < 8) return { level: 'weak', label: 'Weak', score: 1 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'weak', label: 'Weak', score: 1 };
  if (score <= 3) return { level: 'good', label: 'Good', score: 2 };
  return { level: 'strong', label: 'Strong', score: 3 };
}

function Login() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpType, setOtpType] = useState('signup'); // 'signup', 'recovery', or 'sms'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [verificationEmail, setVerificationEmail] = useState('');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);

  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showDuplicateEmailPopup, setShowDuplicateEmailPopup] = useState(false);

  const { login, signup, loginWithGoogle, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const passwordStrength = isSignUpMode
    ? getPasswordStrength(password)
    : (isOtpMode && (otpType === 'recovery' || otpType === 'sms'))
      ? getPasswordStrength(newPassword)
      : null;

  // Listen to hash change for password recovery redirection link processing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        setOtpType('recovery');
        setIsOtpMode(true);
        setIsForgotMode(false);
        setIsSignUpMode(false);
        setSuccessMsg('You have successfully authenticated via recovery link. Please enter your new password below.');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // If user is already authenticated (e.g. after clicking email confirmation link), redirect them
  useEffect(() => {
    if (user) {
      // Check if they came from password recovery hash
      const isRecovering = window.location.hash.includes('type=recovery');
      if (!isRecovering) {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleModeSwitch = () => {
    setIsSignUpMode(prev => !prev);
    setIsForgotMode(false);
    setIsOtpMode(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgotSwitch = () => {
    setIsForgotMode(true);
    setIsSignUpMode(false);
    setIsOtpMode(false);
    setErrorMsg('');
    setSuccessMsg('');
    setForgotIdentifier('');
  };

  const handleBackToLogin = () => {
    setIsForgotMode(false);
    setIsSignUpMode(false);
    setIsOtpMode(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
  };

  const handleGoToLoginFromPopup = () => {
    setShowDuplicateEmailPopup(false);
    setIsSignUpMode(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleResend = async () => {
    setResendLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (otpType === 'signup') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: verificationEmail || email,
        });
        if (error) throw error;
        setSuccessMsg('Verification code resent successfully!');
      } else if (otpType === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotIdentifier || verificationEmail || email, {
          redirectTo: window.location.origin + '/login',
        });
        if (error) throw error;
        setSuccessMsg('Reset code resent successfully!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingAction(true);

    if (isOtpMode) {
      // Handle OTP Verification
      try {
        const verifyArgs = {
          token: otpCode,
          type: otpType === 'sms' ? 'sms' : otpType, // 'signup', 'recovery', or 'sms'
        };

        if (otpType === 'sms') {
          verifyArgs.phone = forgotIdentifier;
        } else if (otpType === 'recovery') {
          verifyArgs.email = forgotIdentifier || verificationEmail || email;
        } else {
          // signup
          verifyArgs.email = verificationEmail || email;
        }

        const { data, error } = await supabase.auth.verifyOtp(verifyArgs);
        if (error) throw error;

        if (otpType === 'recovery' || otpType === 'sms') {
          if (newPassword) {
            if (newPassword.length < 8) {
              setErrorMsg('Password must be at least 8 characters');
              setLoadingAction(false);
              return;
            }
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;
            setSuccessMsg('Password updated! Redirecting...');
          } else {
            setSuccessMsg('Code verified successfully! Redirecting...');
          }
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          // signup confirmation
          setSuccessMsg('Email verified successfully! Redirecting to profile setup...');
          setTimeout(() => {
            navigate('/profile-setup');
          }, 1500);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Verification failed. Please check the code.');
      }
      setLoadingAction(false);
      return;
    }

    if (isForgotMode) {
      // Handle password recovery trigger
      try {
        const identifier = forgotIdentifier.trim();
        if (identifier.includes('@')) {
          // Email Reset
          const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
            redirectTo: window.location.origin + '/login',
          });
          if (error) throw error;
          setOtpType('recovery');
          setIsOtpMode(true);
          setSuccessMsg('A reset code / link has been sent to your email. Enter the code below:');
        } else {
          // Phone number Reset
          if (!identifier.startsWith('+')) {
            setErrorMsg('Please enter your phone number with country code (e.g. +923001234567).');
            setLoadingAction(false);
            return;
          }
          const { error } = await supabase.auth.signInWithOtp({ phone: identifier });
          if (error) throw error;
          setOtpType('sms');
          setIsOtpMode(true);
          setSuccessMsg('A 9-digit verification code has been sent to your phone number.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to send reset code');
      }
      setLoadingAction(false);
      return;
    }

    if (isSignUpMode) {
      // Sign Up validation
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        setLoadingAction(false);
        return;
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters');
        setLoadingAction(false);
        return;
      }

      try {
        const result = await signup(email, password, 'customer');

        // Detect duplicate signup
        if (result?.user?.identities?.length === 0) {
          setShowDuplicateEmailPopup(true);
          setLoadingAction(false);
          return;
        }

        setVerificationEmail(email);
        setOtpType('signup');
        setIsOtpMode(true);
        setSuccessMsg('Account registered! We have sent a confirmation link and a code to your email. Enter the code below:');
      } catch (err) {
        const msg = err.message || '';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('user already')) {
          setShowDuplicateEmailPopup(true);
        } else if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('email rate')) {
          setErrorMsg('Sign-up rate limit exceeded. Supabase limits sign-ups to 3 per hour. You can disable/increase Rate Limits in your Supabase Dashboard under Settings > Auth > Rate Limits.');
        } else {
          setErrorMsg(msg || 'An error occurred during signup');
        }
      }
    } else {
      // Log In execution
      try {
        const data = await login(email, password, staySignedIn);
        const userRole = data.user?.user_metadata?.role || 'customer';
        localStorage.setItem('userRole', userRole);
        navigate('/');
      } catch (err) {
        if (err.message === 'Email not confirmed') {
          setErrorMsg('Your email is not verified yet. We have enabled code verification below.');
          setVerificationEmail(email);
          setOtpType('signup');
          setIsOtpMode(true);
        } else {
          setErrorMsg(err.message || 'Invalid email or password');
        }
      }
    }
    setLoadingAction(false);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Could not initiate Google login');
    }
  };

  return (
    <div className={`merchant-login-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Theme Toggler at top right */}
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>

      {/* Brand logo at the top */}
      <div className="login-logo-header">
        <h1 className="brand-logo-text">SecondLife</h1>
        <p className="logo-subtext">Marketplace Portal</p>
      </div>

      {/* Main card */}
      <div className="merchant-login-card unified-auth-card">
        <h2>
          {isOtpMode
            ? 'Verify Code'
            : isForgotMode
              ? 'Reset Password'
              : isSignUpMode
                ? 'Create an account'
                : 'Welcome back'}
        </h2>
        <p className="card-instructions">
          {isOtpMode
            ? `Enter the 9-digit code sent to your ${otpType === 'sms' ? 'phone number' : 'email'}.`
            : isForgotMode
              ? 'Enter your registered email address or phone number.'
              : isSignUpMode
                ? 'Sign up to shop or start selling pre-loved clothes.'
                : 'Please enter your credentials to access your account.'}
        </p>

        {errorMsg && <div className="auth-alert error-alert">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success-alert">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* OTP Verification Screen */}
          {isOtpMode && (
            <>
              <div className="login-input-group">
                <label htmlFor="otpCode">9-Digit Verification Code</label>
                <input
                  type="text"
                  id="otpCode"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456789"
                  maxLength={9}
                  inputMode="numeric"
                  required
                />
              </div>

              {(otpType === 'recovery' || otpType === 'sms') && (
                <div className="login-input-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                  />
                  {passwordStrength && (
                    <div className="password-strength-wrapper">
                      <div className="password-strength-bar">
                        <div
                          className={`password-strength-fill strength-${passwordStrength.level}`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`password-strength-label strength-${passwordStrength.level}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Password Forgot Screen */}
          {isForgotMode && !isOtpMode && (
            <div className="login-input-group">
              <label htmlFor="forgotIdentifier">Email or Phone Number</label>
              <input
                type="text"
                id="forgotIdentifier"
                value={forgotIdentifier}
                onChange={(e) => setForgotIdentifier(e.target.value)}
                placeholder="name@example.com or +923..."
                required
              />
              <p className="field-hint" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                For phone, include country code (e.g. +923001234567)
              </p>
            </div>
          )}

          {/* Standard Login & Signup Screens */}
          {!isForgotMode && !isOtpMode && (
            <>
              {/* Email Address */}
              <div className="login-input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="login-input-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>
                  {!isSignUpMode && (
                    <button type="button" className="forgot-link-btn" onClick={handleForgotSwitch}>
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {isSignUpMode && passwordStrength && (
                  <div className="password-strength-wrapper" style={{ marginTop: '8px' }}>
                    <div className="password-strength-bar" style={{ flex: 1, height: '6px', background: '#e5e0d8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        className={`password-strength-fill strength-${passwordStrength.level}`}
                        style={{
                          width: `${(passwordStrength.score / 3) * 100}%`,
                          height: '100%',
                          background: passwordStrength.level === 'weak' ? '#ef4444' : passwordStrength.level === 'good' ? '#f59e0b' : '#22c55e',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <span className={`password-strength-label strength-${passwordStrength.level}`} style={{ fontSize: '11px', fontWeight: 'bold', marginLeft: '8px', color: passwordStrength.level === 'weak' ? '#ef4444' : passwordStrength.level === 'good' ? '#f59e0b' : '#22c55e' }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password (only in signup mode) */}
              {isSignUpMode && (
                <div className="login-input-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              {isSignUpMode ? (
                <div className="login-checkbox-row">
                  <input type="checkbox" id="agreeTerms" defaultChecked required />
                  <label htmlFor="agreeTerms">I agree to the SecondLife terms and privacy policy</label>
                </div>
              ) : (
                /* Stay signed in checkbox */
                <div className="login-checkbox-row">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={staySignedIn}
                    onChange={(e) => setStaySignedIn(e.target.checked)}
                  />
                  <label htmlFor="remember">Stay signed in for 30 days</label>
                </div>
              )}
            </>
          )}

          {/* Action button */}
          <button type="submit" className="login-submit-btn" disabled={loadingAction}>
            <span>
              {loadingAction
                ? 'Processing...'
                : isOtpMode
                  ? 'Verify & Submit'
                  : isForgotMode
                    ? 'Send Reset Code'
                    : isSignUpMode ? 'Create Account' : 'Sign In'}
            </span>
            <span className="arrow-symbol">→</span>
          </button>
        </form>

        {/* Resend Code Button for OTP Screen */}
        {isOtpMode && (
          <div className="otp-resend-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Didn't receive the code?</span>
            <button
              type="button"
              className="resend-code-btn"
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: '#c19358', fontWeight: 'bold', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        )}

        {/* Google Authentication Section (Always placed below submit buttons) */}
        {!isOtpMode && (
          <>
            <div className="login-divider">
              <span>or connect with</span>
            </div>

            <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {/* Footer links to switch view modes */}
        <p className="card-footer-text">
          {isOtpMode ? (
            <button type="button" className="mode-toggle-link-btn" onClick={handleBackToLogin}>
              ← Back to Login
            </button>
          ) : isForgotMode ? (
            <button type="button" className="mode-toggle-link-btn" onClick={handleBackToLogin}>
              ← Back to Login
            </button>
          ) : isSignUpMode ? (
            <>
              Already have an account?{' '}
              <button type="button" className="mode-toggle-link-btn" onClick={handleModeSwitch}>
                Log in here
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button type="button" className="mode-toggle-link-btn" onClick={handleModeSwitch}>
                Sign up here
              </button>
            </>
          )}
        </p>
      </div>

      {/* Trust & Sustainability badges below card */}
      <div className="login-trust-badges">
        <div className="badge-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Secure Connection</span>
        </div>
        <span className="badge-divider">•</span>
        <div className="badge-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.12 10 9.88 10c.06 0 .12 0 .18-.01.44-.01.76-.39.71-.83-.06-.57-.09-1.15-.09-1.74 0-3.31 2.69-6 6-6 .59 0 1.17.03 1.74.09.44.05.82-.27.83-.71.01-.06.01-.12.01-.18C22 6.12 17.52 2 12 2z"></path>
          </svg>
          <span>Sustainability Cloud</span>
        </div>
      </div>

      {/* Duplicate Email Popup */}
      {showDuplicateEmailPopup && (
        <div
          className="duplicate-email-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="duplicate-email-modal"
            style={{
              background: 'var(--card-bg, #fff)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '360px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: '8px' }}>Account Already Exists</h3>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
              An account with this email already exists. Please log in instead.
            </p>
            <button
              type="button"
              className="login-submit-btn"
              style={{ width: '100%' }}
              onClick={handleGoToLoginFromPopup}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
