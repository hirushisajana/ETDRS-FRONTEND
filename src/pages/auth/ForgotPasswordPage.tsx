import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call would go here
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>ETDRS</h1>
          </div>
          <div className="auth-form">
            <div className="alert alert-success">
              If an account with that email exists, a reset link has been sent.
            </div>
            <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ETDRS</h1>
          <p>Reset Password</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="auth-links">
            <Link to="/login">Back to Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
