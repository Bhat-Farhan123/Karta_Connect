
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Mail,
  LoaderCircle,
} from 'lucide-react';

import {
  signInWithPassword,
  getUserProfile,
} from '../../services/authService';

import './LoginPage.css';

const roleRoutes = {
  scholar: '/scholar',
  alumni: '/alumni',
  organization: '/organization',
  admin: '/admin',
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const { user } = await signInWithPassword({
        email: email.trim(),
        password,
      });

      const profile = await getUserProfile(user.id);

      if (!profile) {
        throw new Error(
          'Your Karta profile could not be found. Please contact Karta support.'
        );
      }

      // Handle organization verification separately.
if (profile.role === 'organization') {
  if (!profile.organization) {
    throw new Error(
      'Your organization profile could not be found. Please contact Karta support.'
    );
  }

  if (profile.organization.verification_status !== 'verified') {
    throw new Error(
      'Your organization registration is pending verification. Karta Admin will review your details and notify you once access is approved.'
    );
  }

  if (profile.account_status !== 'active') {
    throw new Error(
      'Your organization account is not active yet. Please contact Karta support.'
    );
  }
} else if (profile.account_status !== 'active') {
  throw new Error(
    'Your account is not active yet. Please contact Karta support.'
  );
}

      const destination = roleRoutes[profile.role];

      if (!destination) {
        throw new Error(
          'Your account role is not authorized to access this platform.'
        );
      }

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="karta-login-page">
      <div className="login-card">

        {/* LEFT: LOGIN FORM */}
        <section className="login-content">

          <header className="login-brand">
  <span className="login-brand-icon">k.</span>
  <span className="login-brand-name">kartaconnect</span>
</header>

          <div className="login-main">

            <div className="login-heading">
              <span className="login-kicker">
                <span className="login-kicker-dot" />
                YOUR NEXT CHAPTER STARTS HERE
              </span>

              <h1>
                Discover
                <br />
                what you can <span>do.</span>
              </h1>

              <p>
                Connect with your community, discover new
                opportunities, and turn your ambitions into
                something extraordinary.
              </p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>

              <div className="login-field">
                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="login-input">
                  <Mail size={17} />

                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <span>Secure account access</span>
                </div>

                <div className="login-input">
                  <LockKeyhole size={17} />

                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="login-spinner" size={18} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Karta
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

            </form>

            <div className="login-security">
              <ShieldCheck size={16} />
              Your account is protected by secure authentication.
            </div>

          </div>

          <footer className="login-footer">
            <span>© 2026 Karta Connect</span>
            <span>Built for connection and growth.</span>
          </footer>

        </section>

        {/* RIGHT: ABSTRACT ARTWORK */}
        <aside className="login-art-panel">

          <div className="artwork">

            <div className="artwork-glow artwork-glow-one" />
            <div className="artwork-glow artwork-glow-two" />
            <div className="artwork-glow artwork-glow-three" />

            <div className="artwork-ribbon artwork-ribbon-one" />
            <div className="artwork-ribbon artwork-ribbon-two" />
            <div className="artwork-ribbon artwork-ribbon-three" />

            <div className="artwork-grain" />

          </div>

          <div className="art-panel-brand">
            <span className="art-panel-mark">K</span>
            <span>KARTA CONNECT</span>
          </div>

          <div className="art-panel-copy">
            <span className="art-panel-eyebrow">
              A COMMUNITY OF POSSIBILITIES
            </span>

            <h2>
              Your ideas.
              <br />
              Your people.
              <br />
              <em>Your future.</em>
            </h2>

            <p>
              A place where scholars, alumni and organizations
              come together to create meaningful opportunities.
            </p>

            <div className="art-panel-bottom">
              <span />
              CONNECT · COLLABORATE · GROW
            </div>
          </div>

          <div className="art-panel-index">
            <span>01</span>
            <span>THE KARTA COMMUNITY</span>
          </div>

        </aside>

      </div>
    </main>
  );
}
