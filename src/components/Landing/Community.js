import React, { useEffect } from 'react';
import GlobalChat from './GlobalChat';

const Community = ({ user, supabase, setShowAuthModal }) => {
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="pt-24 min-h-screen">
      <section className="max-w-7xl mx-auto px-lg py-2xl text-center">
        <h1 className="font-display-lg text-4xl sm:text-6xl text-on-surface mb-lg">
          Build <span className="text-tertiary">Together</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Join thousands of developers sharing code, solving problems, and building the future of
          software.
        </p>
        <div className="flex flex-wrap justify-center gap-md mt-xl">
          <a
            href="https://discord.gg/codex"
            target="_blank"
            rel="noreferrer"
            className="bg-[#5865F2] text-white px-xl py-md rounded-xl font-bold flex items-center gap-md hover:brightness-110 transition-all no-underline"
          >
            <span className="material-symbols-outlined">forum</span> Join Discord
          </a>
          <a
            href="https://github.com/codex-org/codex"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-black px-xl py-md rounded-xl font-bold flex items-center gap-md hover:bg-gray-100 transition-all no-underline border border-outline-variant"
          >
            <span className="material-symbols-outlined">terminal</span> GitHub Repository
          </a>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-lg pb-2xl">
        {/* Global Chat Integration */}
        <div className="w-full h-full flex flex-col justify-center">
          <GlobalChat user={user} supabase={supabase} setShowAuthModal={setShowAuthModal} />
        </div>
      </section>
    </main>
  );
};

export default Community;
