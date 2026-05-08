import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useUserAuthentication, Icons } from '@ohif/ui-next';
import { saveAuth, loadAuth } from '../utils/basicAuth';

function LoginPage({ userAuthenticationService }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [, { set, setUser }] = useUserAuthentication();

  const from = (location.state as any)?.from?.pathname || '/';

  // Already authenticated — skip login
  if (loadAuth()) {
    return <Navigate to={from} replace />;
  }

  const getAuthCheckUrl = () => {
    const sources = (window as any).config?.dataSources;
    const qidoRoot = sources?.[0]?.configuration?.qidoRoot || '';
    return qidoRoot.replace('/dicom-web', '/auth-check');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const encoded = btoa(`${username}:${password}`);
    const authCheckUrl = getAuthCheckUrl();

    try {
      const res = await fetch(`${authCheckUrl}/studies?limit=1`, {
        headers: { Authorization: `Basic ${encoded}` },
      });

      if (res.ok || res.status === 204) {
        saveAuth(username, password);
        set({ enabled: true });
        setUser({ username });
        userAuthenticationService.setServiceImplementation({
          getAuthorizationHeader: () => ({ Authorization: `Basic ${encoded}` }),
          handleUnauthenticated: () => <Navigate to="/login" replace />,
        });
        navigate(from, { replace: true });
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="w-full max-w-sm rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center border-b border-neutral-700 px-8 py-8">
          <div className="flex w-full items-center justify-center">
            <Icons.OHIFLogo style={{ width: '100%', maxWidth: '240px', height: 'auto' }} />
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ WebkitBoxShadow: '0 0 0 1000px #262626 inset', WebkitTextFillColor: '#ffffff' }}
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ WebkitBoxShadow: '0 0 0 1000px #262626 inset', WebkitTextFillColor: '#ffffff' }}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
