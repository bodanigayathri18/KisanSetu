import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, Sparkles, Check, Phone, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenDemoSwitcher: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenDemoSwitcher,
}) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setError('');
    try {
      await login(identifier);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Try using demo switcher or registering.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="login-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <LogIn className="w-5 h-5 text-emerald-300" />
            <h2 className="text-base font-bold">Sign In to KisanConnect</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Demo Pick Callout */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" /> Demo Quick Login
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenDemoSwitcher();
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Open Switcher →
              </button>
            </div>
            <p className="text-stone-600 mt-1">
              Select pre-seeded verified accounts for Telangana Farmers, Procurement Officials, or Agro Buyers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Registered Mobile Number or Email *
              </label>
              <input
                id="login-input-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9848012345 or ramesh.reddy@telangana.in"
                className="w-full p-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                required
              />
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              New to the platform?{' '}
              <button
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
