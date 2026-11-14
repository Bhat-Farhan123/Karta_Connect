
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
} from 'lucide-react';

import './LoginPage.css';

export default function AcceptInvitePage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePasswordSetup(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(
          'Your invitation session is missing or expired. Please open the latest invitation email again.'
        );
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      // Give the email-verification trigger a moment to finish.
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user?.email_confirmed_at) {
        throw new Error(
          'Your email is not verified yet. Please complete the verification link from your invitation email.'
        );
      }

      navigate('/scholar', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to set your password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="karta-login-page">
      <div className="login-card">
        <section className="login-content">
          <header className="login-brand">
            <span className="login-brand-icon">k.</span>
            <span className="login-brand-name">kartaconnect</span>
          </header>

          <div className="login-main">
            <div className="login-heading">
              <span className="login-kicker">
                <span className="login-kicker-dot" />
                WELCOME TO KARTA
              </span>

              <h1>
                Create your
                <br />
                <span>password.</span>
              </h1>

              <p>
                Your invitation is your first step into the Karta
                community. Set a secure password to activate your account.
              </p>
            </div>

            <form className="login-form" onSubmit={handlePasswordSetup}>
              <div className="login-field">
                <label htmlFor="new-password">New password</label>

                <div className="login-input">
                  <LockKeyhole size={17} />

                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="confirm-password">Confirm password</label>

                <div className="login-input">
                  <LockKeyhole size={17} />

                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
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
                    Setting up account...
                  </>
                ) : (
                  <>
                    Activate my account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <footer className="login-footer">
            <span>© 2026 Karta Connect</span>
            <span>Built for connection and growth.</span>
          </footer>
        </section>

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
