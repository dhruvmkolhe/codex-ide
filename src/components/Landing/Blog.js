import React, { useEffect, useState } from 'react';

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState(null);

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

  const posts = [
    {
      date: 'June 10, 2024',
      title: 'CodeX V3.0: The Year of the AI Agent',
      excerpt:
        'How we integrated multi-agent orchestration to not just suggest code, but actually build entire features from natural language prompts.',
      content:
        'In our biggest update yet, CodeX V3.0 introduces native AI agents capable of autonomous feature development. By moving beyond traditional autocomplete and implementing a multi-agent orchestration framework, we can now parse complex business logic descriptions and securely execute changes inside a sandboxed environment without disrupting the user\'s workflow. Our proprietary engine divides work into "Planning", "Coding", and "Validating" phases.',
      tag: 'Product Update',
      color: 'text-primary',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    },
    {
      date: 'May 22, 2024',
      title: 'Securing the Sandbox: Our New Container Architecture',
      excerpt:
        'A deep dive into how we use gVisor and custom Seccomp profiles to ensure your code runs in the most secure environment possible.',
      content:
        'Security is paramount for any online IDE. When allowing thousands of users to compile code remotely, virtualization overhead normally tanks performance. We share how we built a highly optimized, low-latency container orchestration system using gVisor. We examine custom Seccomp boundaries that prevent escape exploits while delivering sub-millisecond VM wakeup times, keeping CodeX lightning fast.',
      tag: 'Engineering',
      color: 'text-tertiary',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    },
    {
      date: 'April 15, 2024',
      title: 'Why WASM is the Future of the CodeX Terminal',
      excerpt:
        'Moving terminal emulation and certain runtime components to WebAssembly to reduce latency and improve responsiveness.',
      content:
        'WebAssembly has fundamentally shifted how we think about web applications. By porting our core terminal emulation modules and certain interpreter components to WASM, we bypassed the JavaScript bottleneck, achieving native-like performance directly in your browser. This article walks through the technical hurdles of cross-compiling our command-line tools into viable WebAssembly binaries.',
      tag: 'Insight',
      color: 'text-secondary',
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    },
    {
      date: 'March 28, 2024',
      title: 'Collaboration Without Borders',
      excerpt:
        'Introducing high-fidelity voice chat and persistent workspace states for distributed teams.',
      content:
        "Collaboration shouldn't end when the file is saved. Our new borderless spaces bring native voice channels and WebRTC powered interactions directly into your IDE. We explore how we built the networking stack on top of Supabase's real-time channels, ensuring that your team stays connected to your codebase no matter where they are in the world.",
      tag: 'Feature',
      color: 'text-primary',
      image:
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <main className="pt-24 min-h-screen relative">
      <section className="max-w-7xl mx-auto px-lg py-2xl text-center">
        <h1 className="font-display-lg text-4xl sm:text-6xl text-on-surface mb-lg">
          CodeX <span className="text-primary">Blog</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Engineering deep dives, product updates, and the latest news from the CodeX team.
        </p>
      </section>

      {/* Adjust grid to lg:grid-cols-4 so all 4 display side-by-side on large screens */}
      <section className="max-w-7xl mx-auto px-lg pb-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl">
        {posts.map((post, i) => (
          <article
            key={i}
            className="reveal bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col"
          >
            <div className="h-48 bg-surface-container-high relative overflow-hidden">
              {/* Added Real Image */}
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>

              <div className="absolute top-md left-md bg-surface-container-highest/90 backdrop-blur px-md py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                {post.tag}
              </div>
            </div>

            <div className="p-lg flex flex-col flex-1">
              <time className="text-xs text-on-surface-variant mb-sm font-medium">{post.date}</time>
              <h2 className="font-headline-md text-lg text-on-surface mb-md group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-on-surface-variant text-body-sm mb-lg line-clamp-3">
                {post.excerpt}
              </p>

              {/* Added Click Handler to open modal */}
              <button
                onClick={() => setSelectedPost(post)}
                className="mt-auto flex items-center gap-xs text-primary font-bold text-sm hover:opacity-80 transition-opacity"
              >
                Read Article{' '}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Full Screen Modal Overlay for "Read Articles" */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm z-[100]">
          <div className="bg-surface-container w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-outline-variant shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-white/20 transition-colors z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="w-full h-64 md:h-80 relative flex-shrink-0">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent opacity-90"></div>
            </div>

            <div className="p-xl overflow-y-auto md:-mt-20 -mt-6 relative z-10">
              <div className="bg-surface-container-high/80 backdrop-blur inline-block px-4 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-widest mb-4">
                {selectedPost.tag}
              </div>
              <h2 className="text-3xl md:text-5xl font-display-lg text-on-surface mb-4">
                {selectedPost.title}
              </h2>
              <p className="text-sm text-on-surface-variant font-medium mb-8">
                Published on {selectedPost.date}
              </p>
              <div className="text-on-surface-variant leading-relaxed text-lg font-body-lg">
                <p className="mb-6 text-on-surface font-semibold">{selectedPost.excerpt}</p>
                <p>{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Blog;
