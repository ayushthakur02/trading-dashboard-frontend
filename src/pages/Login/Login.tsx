import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/auth';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json() as { token?: string; user?: User; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      login(data.token!, data.user!);
      navigate('/', { replace: true });
    } catch {
      setError('Unable to reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary rounded-sm" />
              ))}
            </div>
            <span className="font-headline text-base font-bold text-on-surface tracking-tight">
              TRADING ENGINE
            </span>
          </div>
          <p className="font-mono text-[10px] text-outline">V2.4.0-STABLE</p>
        </div>

        {/* Card */}
        <div className="panel rounded-md overflow-hidden">
          <div className="panel-header">
            <span className="panel-title">Operator Authentication</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gain" style={{ boxShadow: '0 0 6px #13ff43' }} />
              <span className="font-mono text-[10px] text-outline">SECURE</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-body text-outline tracking-widest uppercase mb-1.5">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-on-surface
                           focus:border-primary focus:outline-none transition-colors placeholder:text-outline"
                placeholder="trader"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-body text-outline tracking-widest uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-on-surface
                           focus:border-primary focus:outline-none transition-colors placeholder:text-outline"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-xs font-mono text-loss border border-loss/30 bg-loss-dim rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-container text-white font-headline font-semibold text-sm rounded
                         hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
                         tracking-wider"
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </form>

          <div className="px-4 pb-4 pt-0">
            <div className="border border-border/50 rounded px-3 py-2">
              <p className="text-[10px] font-mono text-outline mb-1 tracking-wider">DEMO CREDENTIALS</p>
              <p className="text-[11px] font-mono text-on-surface-muted">trader / trade123</p>
              <p className="text-[11px] font-mono text-on-surface-muted">admin / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
