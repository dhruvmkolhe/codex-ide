import React, { useEffect, useState } from 'react';
import { sanitizeHtml } from '../../utils/sanitizer';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('Quick Start Guide');

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection]);

  const sections = [
    {
      title: 'Getting Started',
      icon: 'rocket_launch',
      items: ['Quick Start Guide', 'UI Overview'],
    },
    {
      title: 'Core Features',
      icon: 'extension',
      items: ['Multiplayer Rooms', 'Execution Simulator', 'Tldraw Whiteboard', 'Time Travel'],
    },
    {
      title: 'Language Support',
      icon: 'language',
      items: ['Supported Runtimes'],
    },
    {
      title: 'API Reference',
      icon: 'menu_book',
      items: ['Backend AI Endpoints', 'Supabase Channels'],
    },
  ];

  const parseInline = (text) => {
    if (!text) return null;
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface font-bold">$1</strong>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-surface-container-highest px-1.5 py-0.5 rounded-md font-mono text-[11px] text-tertiary border border-outline-variant shadow-sm">$1</code>'
      );
    // Sanitize HTML before rendering
    return <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    // Group lists appropriately so standard <li> tags aren't bare
    const elements = [];
    let currentList = [];
    let listType = null;

    const pushList = () => {
      if (currentList.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul
              key={`ul-${elements.length}`}
              className="ml-lg mb-lg list-disc space-y-xs marker:text-primary"
            >
              {currentList}
            </ul>
          );
        } else {
          elements.push(
            <ol
              key={`ol-${elements.length}`}
              className="ml-lg mb-lg list-decimal space-y-xs marker:text-primary font-bold"
            >
              {currentList}
            </ol>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    text.split('\n').forEach((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines

      // If it's not a list item, flush current list
      if (!trimmedLine.startsWith('-') && !trimmedLine.match(/^\d+\./)) {
        pushList();
      }

      if (trimmedLine.startsWith('###')) {
        elements.push(
          <h3
            key={i}
            className="text-xl font-bold text-on-surface mt-xl mb-md border-b border-outline-variant pb-sm"
          >
            {parseInline(trimmedLine.replace('###', '').trim())}
          </h3>
        );
      } else if (trimmedLine.startsWith('##')) {
        elements.push(
          <h2 key={i} className="text-2xl font-display-sm text-on-surface mt-2xl mb-lg">
            {parseInline(trimmedLine.replace('##', '').trim())}
          </h2>
        );
      } else if (trimmedLine.startsWith('-')) {
        listType = 'ul';
        currentList.push(
          <li key={i} className="text-on-surface-variant text-body-md pl-xs">
            {parseInline(trimmedLine.replace('-', '').trim())}
          </li>
        );
      } else if (trimmedLine.match(/^\d+\./)) {
        listType = 'ol';
        currentList.push(
          <li key={i} className="text-on-surface-variant font-normal text-body-md pl-xs">
            {parseInline(trimmedLine.replace(/^\d+\./, '').trim())}
          </li>
        );
      } else if (
        trimmedLine.startsWith('`') &&
        trimmedLine.endsWith('`') &&
        !trimmedLine.includes(' ')
      ) {
        // Block-level code, like standard npm commands
        elements.push(
          <code
            key={i}
            className="block bg-[#1E1E1E] p-md rounded-lg font-mono text-sm text-green-400 my-md border border-outline-variant whitespace-pre shadow-inner tracking-wide"
          >
            {trimmedLine.replace(/`/g, '')}
          </code>
        );
      } else {
        elements.push(
          <p key={i} className="mb-md text-on-surface-variant leading-relaxed text-body-md">
            {parseInline(line)}
          </p>
        );
      }
    });

    // Flush any remaining lists
    pushList();

    return elements;
  };

  const content = {
    'Quick Start Guide': {
      title: 'Quick Start Guide',
      body: 'Get up and running with CodeX in less than 2 minutes on your local machine.',
      details: `
                Welcome to CodeX. Follow these steps to initialize your environment:

                ### 1. Installation
                Open your terminal inside the project directory and run:
                \`npm install\`

                ### 2. Configure Environment Secrets
                Inside your \`.env\` file, ensure you have provided your backend URLs and API keys (such as your Supabase configuration and OpenAI/Gemini endpoints) for AI routing and realtime databases.

                ### 3. Start the Servers
                Start both the webpack development frontend and node proxy backend by running:
                \`npm start\`

                Alternatively, spin them up independently:
                \`npm run start:backend\` (Port 5001)
                \`npm run start:frontend\` (Port 3000)
            `,
      specs: {
        Frontend: 'React + Tailwind',
        Backend: 'Node.js (Express)',
        Database: 'Supabase / PostgreSQL',
      },
    },
    'UI Overview': {
      title: 'UI Overview',
      body: 'A deep dive into the CodeX interface, designed for ergonomic and distraction-free development.',
      details: `
                ### Workspace Geometry
                Our UI is divided into 5 major zones designed to minimize context switching:

                - **Activity Bar (Far Left)**: Toggle your sidebars like the file Explorer, Search tools, Drafts, and Visual execution stepper.
                - **Exploration Pane (Left Sidebar)**: Manage your files, create folders, and navigate logic. 
                - **Editor Grid (Center)**: CodeMirror 6 text-editor engine powering syntax highlighting, linting, and autocomplete.
                - **Panel Zone (Bottom)**: Houses the active terminal readouts and chat AI assistant.
                
                ### Customizing Your View
                You can swap IDE paradigms at any time. Look for the Layout Switcher to choose between Stable IDE, Beta Mode, or the "Neo Interface" which emulates standard VS Code environments.
            `,
    },
    'Multiplayer Rooms': {
      title: 'Multiplayer Rooms',
      body: "Real-time, multi-user development that feels like you're in the same room.",
      details: `
                ### Instantly Syncing Code Without Borders
                CodeX leverages Supabase Postgres real-time channels enabling instant live-coding collaborations.

                ### How to join a room
                - A typical URL is \`http://localhost:3000/\`
                - To start a private multiplayer room, simply modify your URL path to include a room name.
                - For example, navigating to \`http://localhost:3000/codex/my-secret-room\` automatically joins the shared file space.
                - Share that exact link with someone else. You will see an indicator pop up and their cursors will appear in real time over the code!

                ### Safety & Conflicts
                Network stability is handled seamlessly under the hood using debounced socket broadcasts and conflict-free cursor resolution mapping.
            `,
    },
    'Execution Simulator': {
      title: '3D Execution Simulator',
      body: 'Visually traces and compiles your code line-by-line using a gorgeous 3D memory vault.',
      details: `
                ### Uncover the Magic Behind the Code
                A game-changer for CS students and developers debugging complex pathing. CodeX can compile and trace the execution path of your scripts directly in the sidebar.

                ### Features
                - **Step-by-Step Traversal**: The simulator locks onto your file and translates it into an execution loop. You can step forward or back to see which line is running.
                - **Auto Play**: Sit back and hit play to watch your code run automatically.
                - **Three.js 3D Memory Vault**: We use WebGL 3D rendering to project a "Computer Memory Vault" onto the scene. As your variables update, physical digital boxes will rotate, appear, or update their holograms live.

                ### Supported Types
                - True/False Boolean values display as Green Cones.
                - Number logic displays as Cyan Cubes.
                - Strings and other data types display as Magenta Toruses.
            `,
    },
    'Tldraw Whiteboard': {
      title: 'Tldraw Whiteboard',
      body: 'An endless digital canvas for mapping out logic architectures before writing a single line of code.',
      details: `
                ### Built-In Visual Planning
                Sometimes code is not enough. You need to map out your infrastructure visually.

                - Access the Whiteboard directly from the Activity Bar (Shapes icon). 
                - It overlays natively on top of the IDE, allowing you to instantly sketch, diagram workflows, map databases, and draw flowcharts.
                - When you are done, close the modal to drop directly back into your files perfectly uninterrupted.
                - Native dark mode provides a sleek, non-straining UX.
            `,
    },
    'Time Travel': {
      title: 'Time Travel (Snapshots)',
      body: 'Safe versioning control protecting your data. Jump backward in time instantly.',
      details: `
                ### Code Snapshots
                By pressing the Clock Icon in Beta Mode, you access the Time Travel Snapshot feature. 
                
                - CodeX backs up your current active Editor string as a memory snapshot when you command it.
                - By logging your code history, if you make breaking changes or try an experiment that ruins your file, you don't panic.
                - Just open the history tab and click "Restore" to safely revert your file payload back to its exact format from when the snapshot was taken.
            `,
    },
    'Supported Runtimes': {
      title: 'Supported Runtimes',
      body: 'Over 10+ programming languages supported out of the box with syntax highlighting and compiler execution.',
      details: `
                ### Rich CodeMirror 6 Bindings
                CodeX leverages CodeMirror language extensions to provide advanced file analysis.
                Depending on your file extension (e.g. \`.js\`, \`.py\`, \`.cpp\`), the IDE engine will dynamically inject:

                - **Data Scripts**: Python
                - **Systems Code**: C++, Java, C#
                - **Web Applications**: HTML, JavaScript, CSS, JSON
                - **Databases**: SQL
                
                ### Code Verification
                Pressing "Run" executes the script safely via the backend isolated sandbox endpoints. Responses, errors, and print statements are forwarded back downstream directly into your visual IDE terminal in milliseconds.
            `,
    },
    'Backend AI Endpoints': {
      title: 'Backend AI Endpoints',
      body: 'Programmatically interact with our AI microservices inside the `server` directory.',
      details: `
                ### Secure Routing
                To protect our external LLM limits, all AI integrations run through proxy REST routes under \`server/index.js\`.

                ### Main Endpoints
                - \`POST /api/ai/chat\`
                Routes natural language user requests to advanced endpoints (Nemotron, Gemini, Groq) extracting structured response payloads. 

                - \`POST /api/run-code\`
                Evaluates file sandbox requests on the backend without compromising the React DOM.
            `,
    },
    'Supabase Channels': {
      title: 'Supabase real-time Channels',
      body: 'WebSocket hooks bridging instances across the globe.',
      details: `
                ### Data Sync Protocol
                A deep dive into how multiplayer functions under the hood:

                - We subscribe the IDE Editor state to \`realtime:public:shared_code:room_id=eq.{roomId}\`.
                - Upon detecting a payload delta, it dispatches an \`UPDATE\` postgres trigger.
                - The DB syncs the delta array and broadcasts the delta back down to all websockets currently subscribed to that Room channel ID.
                - React manages reconciliation via the \`useCollaboration\` hook, shifting editor text without causing cursor snapping.
            `,
    },
  };

  const activeContent = content[activeSection] || content['Quick Start Guide'];

  return (
    <main className="pt-24 min-h-screen">
      <section className="max-w-7xl mx-auto px-lg py-2xl grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-2xl">
        {/* Sidebar */}
        <aside className="hidden lg:block space-y-xl sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-md scrollbar-thin">
          {sections.map((s, i) => (
            <div key={i} className="mb-xl">
              <h4 className="font-label-caps text-[10px] text-on-surface-variant tracking-widest mb-md uppercase">
                {s.title}
              </h4>
              <ul className="space-y-sm">
                {s.items.map((item, j) => (
                  <li
                    key={j}
                    onClick={() => setActiveSection(item)}
                    className={`text-body-sm transition-colors px-md py-1 border-l cursor-pointer ${
                      activeSection === item
                        ? 'text-primary border-primary font-bold bg-primary/5'
                        : 'text-on-surface-variant border-outline-variant hover:text-primary hover:border-primary'
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Content */}
        <div className="space-y-xl">
          {/* Mobile Selector Dropdown */}
          <div className="block lg:hidden mb-lg">
            <label className="block text-xs font-bold text-primary mb-xs uppercase tracking-widest">
              Select Documentation Section
            </label>
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full bg-[#181c22] border border-[#414750] rounded-xl px-4 py-2 text-on-surface font-body-md shadow-sm outline-none focus:border-primary"
            >
              {sections.map((s, i) => (
                <optgroup key={i} label={s.title} className="bg-[#181c22]">
                  {s.items.map((item, j) => (
                    <option key={j} value={item} className="bg-[#181c22] text-white">
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <section className="reveal">
            <div className="flex items-center gap-md text-primary mb-md">
              <span className="material-symbols-outlined">description</span>
              <span className="font-bold text-sm tracking-widest uppercase">Documentation</span>
            </div>
            <h1 className="font-display-lg text-4xl sm:text-5xl text-on-surface mb-lg">
              {activeContent.title}
            </h1>
            <p className="font-body-lg text-on-surface-variant italic border-l-4 border-primary pl-md py-2 bg-primary/5 rounded-r-lg">
              {activeContent.body}
            </p>
          </section>

          <div className="reveal bg-surface-container-low border border-outline-variant p-xl rounded-2xl shadow-sm">
            {activeContent.details && (
              <div className="mb-xl">
                <div className="text-on-surface font-body-md">
                  {renderMarkdown(activeContent.details)}
                </div>
              </div>
            )}

            {activeContent.specs && (
              <div className="mb-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  {Object.entries(activeContent.specs).map(([key, value], i) => (
                    <div
                      key={i}
                      className="bg-surface-container-high p-md rounded-xl border border-outline-variant hover:border-primary/50 transition-colors group"
                    >
                      <p className="text-[10px] font-bold text-primary-container bg-primary px-2 py-0.5 rounded w-fit uppercase tracking-widest mb-2">
                        {key}
                      </p>
                      <p className="text-sm font-bold text-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-xl border-t border-outline-variant">
            <button
              onClick={() => {
                const allItems = sections.flatMap((s) => s.items);
                const currentIndex = allItems.indexOf(activeSection);
                if (currentIndex > 0) setActiveSection(allItems[currentIndex - 1]);
              }}
              className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed group"
              disabled={sections.flatMap((s) => s.items).indexOf(activeSection) === 0}
            >
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>{' '}
              Previous
            </button>
            <button
              onClick={() => {
                const allItems = sections.flatMap((s) => s.items);
                const currentIndex = allItems.indexOf(activeSection);
                if (currentIndex < allItems.length - 1)
                  setActiveSection(allItems[currentIndex + 1]);
              }}
              className="flex items-center gap-sm text-primary hover:text-primary-container transition-colors font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed group"
              disabled={
                sections.flatMap((s) => s.items).indexOf(activeSection) ===
                sections.flatMap((s) => s.items).length - 1
              }
            >
              Next Section{' '}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Docs;
