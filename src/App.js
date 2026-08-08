import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingAuthModal } from './components/LandingAuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { useSupabase } from './hooks/useSupabase';
import LandingLayout from './components/Navigation/LandingLayout';

// Lazy load routes to separate bundles and improve initial loading times
const Home = lazy(() => import('./components/Landing/Home'));
const Blog = lazy(() => import('./components/Landing/Blog'));
const Community = lazy(() => import('./components/Landing/Community'));
const Docs = lazy(() => import('./components/Landing/Docs'));
const IdeEditor = lazy(() => import('./IdeEditor'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#10141a] flex flex-col items-center justify-center text-on-surface">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
    <p className="text-sm font-medium text-outline">Loading CodeX...</p>
  </div>
);

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const supabase = useSupabase({
    showToast,
    setShowAuthModal,
    files: [],
    primaryLanguage: 'javascript',
    selectedLanguage: 'javascript',
  });

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing Pages */}
          <Route
            path="/"
            element={
              <LandingLayout user={supabase.user} setShowAuthModal={setShowAuthModal}>
                <Home />
              </LandingLayout>
            }
          />
          <Route
            path="/homepage"
            element={
              <LandingLayout user={supabase.user} setShowAuthModal={setShowAuthModal}>
                <Home />
              </LandingLayout>
            }
          />
          <Route
            path="/blog"
            element={
              <LandingLayout user={supabase.user} setShowAuthModal={setShowAuthModal}>
                <Blog />
              </LandingLayout>
            }
          />
          <Route
            path="/blogs"
            element={
              <LandingLayout user={supabase.user} setShowAuthModal={setShowAuthModal}>
                <Blog />
              </LandingLayout>
            }
          />
          <Route
            path="/community"
            element={
              <LandingLayout user={supabase.user} setShowAuthModal={setShowAuthModal}>
                <Community
                  user={supabase.user}
                  supabase={supabase.supabase}
                  setShowAuthModal={setShowAuthModal}
                />
              </LandingLayout>
            }
          />
          <Route
            path="/docs"
            element={
              <LandingLayout user={supabase.user} setShowAuthModal={setShowAuthModal}>
                <Docs />
              </LandingLayout>
            }
          />

          {/* IDE Editor & Collaborative Whiteboard */}
          <Route path="/ide" element={<IdeEditor />} />
          <Route path="/ide/:lang" element={<IdeEditor />} />
          <Route path="/codex/:roomId" element={<IdeEditor />} />
          <Route path="/whiteboard" element={<IdeEditor initialWhiteboardOpen={true} />} />
          <Route path="/whiteboard/:roomId" element={<IdeEditor initialWhiteboardOpen={true} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      {/* Global Auth Modal for Landing Pages (Glassmorphic) */}
      {showAuthModal && (
        <LandingAuthModal
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          {...supabase}
        />
      )}

      <ToastContainer toasts={toasts} />
    </Router>
  );
}

export default App;
