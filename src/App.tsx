import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { DemoSwitcherModal } from './components/common/DemoSwitcherModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DisputeModal } from './components/common/DisputeModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { OfficialDashboard } from './components/official/OfficialDashboard';
import { BuyerDashboard } from './components/buyer/BuyerDashboard';
import {
  Wheat,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  Sparkles,
  HelpCircle,
  PhoneCall,
  CheckCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, role, loading, switchDemoUser, demoAccounts, t } = useAuth();

  // Modals state
  const [demoSwitcherOpen, setDemoSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans antialiased">
      {/* Universal Top Header */}
      <Navbar
        onOpenDemoSwitcher={() => setDemoSwitcherOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {loading && !user ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-base font-bold text-stone-800">Initializing KisanConnect Ecosystem...</p>
            <p className="text-xs text-stone-500 mt-1">Connecting to Telangana Agriculture Procurement Grid</p>
          </div>
        ) : !user ? (
          /* Unauthenticated Landing / Demo Entry Screen */
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-md">
                <Wheat className="w-10 h-10" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
                KisanConnect Telangana
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
                Unified digital agricultural procurement ecosystem connecting Farmers, Procurement Officials,
                and Verified Wholesale Buyers on one seamless platform.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-950 text-center mb-4">
                Choose a Demo Persona to Explore Immediately:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  id="btn-demo-farmer-entry"
                  onClick={() => switchDemoUser('user_farmer_1')}
                  className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center mb-3">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-900">
                    Farmer (Rythu)
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Check live GO/WAIT recommendation, book arrival tokens, track queue position, view DBT receipts.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 mt-3">
                    Enter as Ramesh Reddy <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <button
                  id="btn-demo-official-entry"
                  onClick={() => switchDemoUser('user_official_1')}
                  className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-900 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-blue-900">
                    Procurement Official
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Manage live weighbridge queue, call vehicles, adjust capacity limits, broadcast farmer alerts.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 mt-3">
                    Enter as Srikanth Rao <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <button
                  id="btn-demo-buyer-entry"
                  onClick={() => switchDemoUser('user_buyer_1')}
                  className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-amber-900">
                    Wholesale Buyer
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Browse mandi verified crop lots, inspect moisture tests, execute wholesale purchases & invoices.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 mt-3">
                    Enter as Lakshmi Agro <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-center gap-4 text-xs">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Sign In with Phone/Password
                </button>
                <span className="text-stone-300">•</span>
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Register New Account
                </button>
              </div>
            </div>
          </div>
        ) : role === 'FARMER' ? (
          <FarmerDashboard />
        ) : role === 'PROCUREMENT_OFFICIAL' ? (
          <OfficialDashboard />
        ) : role === 'BUYER' ? (
          <BuyerDashboard />
        ) : (
          <div className="text-center py-20">Unknown role assigned.</div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
              🌾
            </div>
            <span>
              <strong>KisanConnect</strong> — Unified Agricultural Procurement System • Government of Telangana
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setDisputeOpen(true)}
              className="inline-flex items-center gap-1 text-stone-600 hover:text-emerald-800 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Lodge Mandi Grievance
            </button>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium text-stone-600">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" /> Helpline: 1800-425-3536
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DemoSwitcherModal
        isOpen={demoSwitcherOpen}
        onClose={() => setDemoSwitcherOpen(false)}
        onOpenRegister={() => setRegisterOpen(true)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onOpenRegister={() => setRegisterOpen(true)}
        onOpenDemoSwitcher={() => setDemoSwitcherOpen(true)}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <DisputeModal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
