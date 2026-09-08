import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserCheck, ShieldCheck, ShoppingBag, RotateCcw, X, Check, ArrowRight, User } from 'lucide-react';

interface DemoSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const DemoSwitcherModal: React.FC<DemoSwitcherModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { user, switchDemoUser, demoAccounts, t } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  if (!isOpen) return null;

  const handleSwitch = async (userId: string) => {
    await switchDemoUser(userId);
    onClose();
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo data (tokens, lots, transactions) back to initial seed data?')) return;
    setResetting(true);
    try {
      await api.resetDemoData();
      setResetMessage('Data reset successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e: any) {
      alert('Error resetting data: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      id="demo-switcher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="demo-switcher-modal-card"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Switch Role or Account</h2>
              <p className="text-xs text-emerald-200">
                Experience KisanConnect as a Farmer, Procurement Official, or Buyer
              </p>
            </div>
          </div>
          <button
            id="btn-close-demo-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account list */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {resetMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium">
              {resetMessage}
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Select a verified Telangana demo profile:
          </p>

          <div className="grid gap-3 sm:grid-cols-1">
            {demoAccounts.map((account) => {
              const isCurrent = user?.id === account.id;
              let roleColor = 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400';
              let badgeBg = 'bg-emerald-100 text-emerald-800';
              let RoleIcon = User;

              if (account.role === 'FARMER') {
                RoleIcon = UserCheck;
                roleColor = 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40';
                badgeBg = 'bg-emerald-100 text-emerald-800';
              } else if (account.role === 'PROCUREMENT_OFFICIAL') {
                RoleIcon = ShieldCheck;
                roleColor = 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/40';
                badgeBg = 'bg-blue-100 text-blue-800';
              } else if (account.role === 'BUYER') {
                RoleIcon = ShoppingBag;
                roleColor = 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/40';
                badgeBg = 'bg-amber-100 text-amber-800';
              }

              return (
                <button
                  key={account.id}
                  id={`btn-switch-user-${account.id}`}
                  onClick={() => handleSwitch(account.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${roleColor} ${
                    isCurrent ? 'ring-2 ring-emerald-600 bg-white shadow-sm' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        account.role === 'FARMER'
                          ? 'bg-emerald-100 text-emerald-700'
                          : account.role === 'PROCUREMENT_OFFICIAL'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-base">{account.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeBg}`}>
                          {account.role.replace('_', ' ')}
                        </span>
                        {account.lowLiteracyMode && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium">
                            Low-Literacy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{account.subtitle}</p>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">
                        Phone: {account.phone} • Email: {account.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 group-hover:text-stone-900">
                        Switch <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              id="btn-open-register-from-modal"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
            >
              + Register a custom Farmer, Official, or Buyer account
            </button>

            <button
              id="btn-reset-seed-data"
              onClick={handleResetData}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-rose-300 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              Reset Demo Seed Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
