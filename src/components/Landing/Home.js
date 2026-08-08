import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="pt-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-lg py-2xl grid grid-cols-1 lg:grid-cols-2 gap-xl items-center relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>
        <div className="space-y-xl">
          <div className="inline-flex items-center gap-sm px-md py-xs bg-surface-container-high border border-outline-variant rounded-full font-label-caps text-label-caps text-primary">
            <span className="material-symbols-outlined text-[14px]">terminal</span>
            V2.0 NOW LIVE
          </div>
          <h1 className="font-display-lg text-4xl sm:text-5xl md:text-6xl lg:text-display-lg text-on-surface leading-tight">
            Code in 60+ Languages.
            <br />
            <span className="text-primary">Instantly. Anywhere.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Write, run, and debug code with AI assistance — zero setup, zero downloads. The coding
            playground that fits in your browser tab.
          </p>
          <div className="flex flex-col sm:flex-row gap-md pt-md">
            <button
              onClick={() => (window.location.href = '/ide')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#0E639C] to-[#00D4FF] text-white px-xl py-lg rounded-xl font-bold text-body-lg hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-sm"
            >
              Start Coding Now <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="w-full sm:w-auto border border-[#0E639C] text-primary px-xl py-lg rounded-xl font-bold text-body-lg hover:bg-primary/10 active:scale-95 transition-all flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined">play_circle</span> Watch Demo
            </button>
          </div>
        </div>
        {/* Hero Visual (IDE Mockup) */}
        <div className="relative group reveal active">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative glass-layer rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/50">
            {/* Fake Window Bar */}
            <div className="bg-surface-container-high px-md py-sm flex justify-between items-center border-b border-outline-variant">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error/30"></div>
                <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/30"></div>
              </div>
              <div className="text-xs text-on-surface-variant font-label-caps">
                main.py — CodeX Editor
              </div>
              <div className="w-12"></div>
            </div>
            {/* Editor Interface */}
            <div className="grid grid-cols-[60px_1fr] h-[400px]">
              <div className="bg-surface-container-low border-r border-outline-variant flex flex-col items-center py-md gap-lg text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  description
                </span>
                <span className="material-symbols-outlined">search</span>
                <span className="material-symbols-outlined">auto_awesome</span>
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div className="p-lg font-code-md text-code-md overflow-hidden bg-surface-container-lowest">
                <div className="text-secondary mb-2">
                  import <span className="text-tertiary">tensorflow</span> as{' '}
                  <span className="text-tertiary">tf</span>
                </div>
                <div className="text-on-surface-variant opacity-80 mb-2">
                  # Initializing the model
                </div>
                <div>model = tf.keras.Sequential([</div>
                <div className="pl-lg">
                  tf.keras.layers.Dense(<span className="text-primary">128</span>, activation=
                  <span className="text-tertiary">'relu'</span>),
                </div>
                <div className="pl-lg">
                  tf.keras.layers.Dropout(<span className="text-primary">0.2</span>),
                </div>
                <div className="pl-lg">
                  tf.keras.layers.Dense(<span className="text-primary">10</span>)
                </div>
                <div className="mb-4">])</div>
                <div className="flex items-center gap-xs">
                  <span className="text-on-surface-variant">&gt;&gt;&gt; </span>
                  <span className="text-tertiary">Model compiled in 14ms</span>
                  <span className="terminal-cursor"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-lg py-2xl grid grid-cols-1 md:grid-cols-3 gap-xl">
        <div className="reveal bg-surface-container-low border border-outline-variant p-xl rounded-2xl hover:border-primary/50 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-headline-md">
              terminal
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
            60+ Languages, One Tab
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Python, JavaScript, Go, Rust, C++, Java — even COBOL and Assembly. No compilers to
            install, no versions to manage.
          </p>
        </div>
        <div
          className="reveal bg-surface-container-low border border-outline-variant p-xl rounded-2xl hover:border-tertiary/50 transition-colors group"
          style={{ transitionDelay: '100ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-tertiary text-headline-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
            AI That Actually Helps
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ask the AI to explain code, fix bugs, or generate solutions. Get instant, accurate
            responses without leaving your workspace.
          </p>
        </div>
        <div
          className="reveal bg-surface-container-low border border-outline-variant p-xl rounded-2xl hover:border-secondary/50 transition-colors group"
          style={{ transitionDelay: '200ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-secondary text-headline-md">
              rocket_launch
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
            Run in Milliseconds
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Secure cloud execution with real output. Stdin support, error handling, and
            lightning-fast feedback loops.
          </p>
        </div>
      </section>

      {/* Interactive Demo Preview */}
      <section className="max-w-7xl mx-auto px-lg py-2xl">
        <div className="reveal bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden cyber-glow demo-panel group/panel active">
          <div className="bg-surface-container-high px-md py-sm flex justify-between items-center border-b border-outline-variant">
            <div className="flex items-center gap-md">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error/30"></div>
                <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/30"></div>
              </div>
              <div className="flex items-center gap-sm ml-md">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  folder_open
                </span>
                <span className="text-xs text-on-surface-variant font-label-caps">
                  codex-project
                </span>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="bg-surface-container-highest px-md py-1 rounded text-[10px] font-bold text-on-surface-variant">
                Vscode Dark
              </div>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span className="text-[10px] font-bold">Cloud Sync</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] h-[600px]">
            <div className="flex flex-col border-r border-outline-variant bg-surface-container-lowest">
              <div className="flex bg-surface-container-low border-b border-outline-variant">
                <div className="flex items-center gap-xs px-md py-2 border-t-2 border-primary bg-surface-container-lowest">
                  <span className="text-yellow-500 text-xs font-bold">JS</span>
                  <span className="font-code-sm text-code-sm text-on-surface">index.js</span>
                  <span className="material-symbols-outlined text-[14px] opacity-40">close</span>
                </div>
                <div className="flex items-center gap-xs px-md py-2 opacity-60">
                  <span className="text-yellow-500 text-xs font-bold">JS</span>
                  <span className="font-code-sm text-code-sm text-on-surface">mathHelper.js</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </div>
                <div className="flex items-center gap-xs px-md py-2 opacity-60">
                  <span className="material-symbols-outlined text-sm">settings</span>
                  <span className="font-code-sm text-code-sm text-on-surface">package.json</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </div>
                <div className="flex items-center px-md opacity-40">
                  <span className="material-symbols-outlined text-sm">add</span>
                </div>
              </div>
              <div className="flex-1 p-xl font-code-md text-code-md overflow-auto">
                <div className="text-on-surface-variant opacity-50 mb-2">
                  {/* JavaScript multi-module demonstration */}
                </div>
                <div className="mb-1">
                  <span className="text-primary">const</span>{' '}
                  <span className="text-secondary">mathHelper</span> ={' '}
                  <span className="text-tertiary">require</span>(
                  <span className="text-tertiary">"./mathHelper.js"</span>);
                </div>
                <div className="mb-1">
                  <span className="text-secondary">console</span>.
                  <span className="text-tertiary">log</span>(
                  <span className="text-tertiary">"=== JavaScript Sandbox ==="</span>);
                </div>
                <div className="mb-1">
                  <span className="text-secondary">console</span>.
                  <span className="text-tertiary">log</span>(
                  <span className="text-tertiary">"Sum: "</span> +{' '}
                  <span className="text-secondary">mathHelper</span>.
                  <span className="text-tertiary">sum</span>([
                  <span className="text-primary">10</span>, <span className="text-primary">20</span>
                  , <span className="text-primary">30</span>]));
                </div>
                <div className="terminal-cursor"></div>
              </div>
              <div className="bg-surface-container-low border-t border-outline-variant p-md">
                <div className="flex justify-between items-center mb-md">
                  <div className="font-label-caps text-label-caps text-on-surface">
                    CONSOLE &amp; STDIN
                  </div>
                  <div className="flex gap-sm">
                    <button className="flex items-center gap-xs bg-surface-container-highest px-md py-1 rounded text-[10px] font-bold hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span> Clear
                    </button>
                    <button className="flex items-center gap-xs bg-error/20 text-error px-md py-1 rounded text-[10px] font-bold hover:bg-error/30 transition-colors">
                      <span className="material-symbols-outlined text-sm">bug_report</span> Debug
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-md h-32">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded p-md text-on-surface-variant font-code-sm italic">
                    Input for the program (Optional)
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded p-md text-on-surface-variant font-code-sm flex items-center justify-center">
                    click on RUN button to see the output
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low flex flex-col">
              <div className="p-md border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-sm font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary">smart_toy</span> AI Chat
                </div>
                <div className="flex items-center gap-sm">
                  <select className="bg-surface-container-highest border-none rounded text-[10px] py-1 pl-2 pr-6 font-bold text-on-surface-variant">
                    <option>English</option>
                  </select>
                  <button className="text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 p-md flex flex-col items-center justify-center text-center space-y-md opacity-40">
                <p className="text-body-sm">
                  Ask anything about your code, or click <span className="font-bold">Debug</span> to
                  fix errors.
                </p>
              </div>
              <div className="p-md mt-auto border-t border-outline-variant bg-surface-container-low">
                <div className="flex gap-sm mb-md">
                  <button className="flex-1 bg-primary-container text-on-primary-container py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined text-sm">chat</span> Chat
                  </button>
                  <button className="flex-1 bg-surface-container-highest text-on-surface-variant py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> Generate
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-md pr-16 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none"
                    placeholder="Ask about your code... (Enter to send, Shift+Enter for new line)"
                  ></textarea>
                  <button className="absolute right-2 bottom-2 bg-primary-container text-on-primary-container p-2 rounded-lg hover:brightness-110 transition-all flex items-center gap-xs font-bold text-xs">
                    <span className="material-symbols-outlined text-sm">send</span> Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dives */}
      <section className="max-w-7xl mx-auto px-lg space-y-2xl py-2xl">
        {/* 1. AI Debugger */}
        <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center">
          <div className="space-y-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Integrated AI Debugger
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Fix bugs in one click. Our AI analyzes your error stack traces and suggests direct
              code fixes with side-by-side diffs.
            </p>
            <ul className="space-y-sm">
              <li className="flex items-center gap-sm text-tertiary">
                <span className="material-symbols-outlined">check_circle</span> Instant Stack Trace
                Analysis
              </li>
              <li className="flex items-center gap-sm text-tertiary">
                <span className="material-symbols-outlined">check_circle</span> One-click Apply Fix
              </li>
            </ul>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
            <div className="bg-surface-container-high px-md py-sm font-label-caps text-xs">
              DIFF VIEW
            </div>
            <div className="grid grid-cols-2 h-64">
              <div className="p-md bg-error/5 border-r border-outline-variant font-code-sm line-through text-error/60">
                - return items[idx]
              </div>
              <div className="p-md bg-tertiary/5 font-code-sm text-tertiary">
                + return items[idx] if idx &lt; len(items) else None
              </div>
            </div>
          </div>
        </div>
        {/* 2. Multi-File */}
        <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center lg:flex-row-reverse">
          <div className="lg:order-2 space-y-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Full Project Scaffolding
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Don't stop at single files. Build complex applications with multi-file support, asset
              management, and a robust file explorer.
            </p>
          </div>
          <div className="lg:order-1 glass-layer rounded-xl p-lg flex gap-lg">
            <div className="w-40 border-r border-outline-variant pr-md font-body-sm text-on-surface-variant space-y-sm">
              <div className="flex items-center gap-xs text-primary font-bold">
                <span className="material-symbols-outlined text-sm">folder_open</span> src/
              </div>
              <div className="pl-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">description</span> api.js
              </div>
              <div className="pl-md flex items-center gap-xs text-secondary font-bold">
                <span className="material-symbols-outlined text-sm">description</span> main.js
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">folder</span> components/
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">description</span> package.json
              </div>
            </div>
            <div className="flex-1">
              <div className="h-40 w-full bg-surface-container-lowest rounded border border-outline-variant flex items-center justify-center italic text-on-surface-variant text-sm">
                main.js content...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Strip */}
      <section className="py-2xl marquee-container overflow-hidden bg-surface-container-lowest/50 border-y border-outline-variant/30">
        <div className="flex gap-2xl animate-marquee whitespace-nowrap">
          <div className="flex gap-2xl items-center font-label-caps text-on-surface-variant opacity-50 text-xl tracking-widest">
            <span>PYTHON</span> <span>JAVASCRIPT</span> <span>TYPESCRIPT</span> <span>RUST</span>{' '}
            <span>GOLANG</span> <span>C++</span> <span>JAVA</span> <span>RUBY</span>{' '}
            <span>PHP</span> <span>SWIFT</span> <span>KOTLIN</span> <span>SCALA</span>{' '}
            <span>HASKELL</span>
          </div>
          <div className="flex gap-2xl items-center font-label-caps text-on-surface-variant opacity-50 text-xl tracking-widest">
            <span>PYTHON</span> <span>JAVASCRIPT</span> <span>TYPESCRIPT</span> <span>RUST</span>{' '}
            <span>GOLANG</span> <span>C++</span> <span>JAVA</span> <span>RUBY</span>{' '}
            <span>PHP</span> <span>SWIFT</span> <span>KOTLIN</span> <span>SCALA</span>{' '}
            <span>HASKELL</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-lg py-2xl">
        <div className="bg-gradient-to-br from-primary-container to-surface-container rounded-3xl p-2xl text-center relative overflow-hidden cyber-glow">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]"></div>
          <h2 className="font-display-lg text-display-lg mb-lg relative z-10">
            Start Coding in Seconds
          </h2>
          <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mb-xl relative z-10">
            <div className="flex items-center gap-md font-code-md text-code-md text-left">
              <span className="text-tertiary">$</span>
              <span>start coding</span>
              <span className="terminal-cursor"></span>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = '/ide')}
            className="bg-white text-primary-container px-2xl py-lg rounded-xl font-bold text-headline-md hover:scale-105 active:scale-95 transition-all relative z-10 shadow-xl"
          >
            Launch CodeX Now
          </button>
        </div>
      </section>
    </main>
  );
};

export default Home;
