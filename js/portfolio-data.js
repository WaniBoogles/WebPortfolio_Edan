(function () {
  'use strict';

  window.EdanPortfolio = window.EdanPortfolio || {};

  const projectDetailsData = {
    schedsti: {
      title: 'SchedSTI — Project Overview',
      overview: 'A standalone C# (.NET Framework) desktop scheduling system built for school operations, helping Admin/HR, Department Heads, and Faculty organize regular class schedules, avoid time/room conflicts, and view personal schedules cleanly across Windows and Linux Mint.',
      features: [
        ['Role-Based Access Workflow:', 'Dedicated views and permissions for Admin/HR, Department Heads, and Faculty members.'],
        ['Conflict-Free Scheduling:', 'Structured regular schedule management that prevents overlapping time slots, instructors, and room assignments.'],
        ['Auto-Responsive Desktop UI:', 'Built to scale cleanly across different desktop resolutions and cross-platform environments (Windows & Linux Mint).'],
        ['Confidentiality by Design:', 'All portfolio previews replace real instructor names, subject codes, sections, and schedule times with sanitized placeholders.']
      ],
      note: 'Repository is private to protect school system internals.',
      repo: ''
    },
    crystal: {
      title: 'Crystal Gems! — Project Overview',
      overview: 'A self-contained, offline 2D browser game inspired by Steven Universe and engineered to launch effortlessly on Linux Mint with a double-click — requiring zero external servers, installs, or dependencies.',
      features: [
        ['Zero-Install Offline Architecture:', 'Runs directly from local HTML5, CSS3, and JavaScript files in any modern browser on Linux Mint or Windows.'],
        ['Custom Startup & Main Menu:', 'Features a themed startup splash sequence and a warm, mature menu interface tailored for smooth keyboard and mouse interaction.'],
        ['Synthesized Web Audio:', 'Generates sound effects and background audio cues natively via the Web Audio API without external audio packages.'],
        ['Playable Stage Maps:', 'Interactive stage selection map and 2D canvas gameplay with clean frame updates and state management.']
      ],
      note: 'Open-source fan-made project on GitHub.',
      repo: 'https://github.com/WaniBoogles/Crystal-Gems-Fan-made-game-'
    },
    amethyx: {
      title: 'Amethyx AI — Project Overview',
      overview: 'Built from the ground up as a unified assistant running natively on Linux (GTK3/WebKit2), Windows (Amethyx.exe), and Android (Amethyx.apk / Amethyx-Public.apk). Designed for data privacy, isolated local memory, portability, and zero-key sharing via an encrypted Android vault (AES-256-GCM) and a 24/7 Cloudflare Worker relay.',
      features: [
        ['Data Privacy & Memory Isolation:', 'Per-user SQLite isolation (edan_memory.db) with Google OAuth 2.0 + PKCE account scoping, local chunked BM25 RAG knowledge base, and encrypted Android key vault (AES-256-GCM).'],
        ['Hybrid AI Engine:', 'Automatic routing and failover between Groq (gpt-oss-120b, Whisper) and Google Gemini (gemini-3.6-flash) paired with topic-locked Wikipedia/DuckDuckGo web context.'],
        ['Full Multimodal & Compact + Add Menu:', 'Streamlined + Add composer for multi-file attachments (.pdf, .docx, .pptx, .xlsx, code, photos, audio, video), camera capture, /imagine image generation, and 1-click file export (.md, .html, .pdf, .docx, .pptx).'],
        ['Voice & Developer UX:', 'Live voice dictation with DC-offset filtering, offline Piper/Android TTS, syntax-highlighted code overview drawer with working 1-click download, offline LaTeX math, custom accent themes, and LAN PC–Android sync (/api/sync).'],
        ['Zero-Key Public Sharing:', 'Amethyx-Public.apk connects through a PIN- and quota-protected server or Cloudflare Worker relay so others can use the models without ever accessing the owner\'s API keys.']
      ],
      note: 'Repository is currently private on GitHub (@WaniBoogles).',
      repo: 'https://github.com/WaniBoogles/AmethyxAI'
    }
  };

  const infoCatalog = {
    csharp: {
      name: 'C#',
      cat: 'Programming Language · Object-Oriented',
      icon: 'assets/icons/csharp.svg',
      desc: 'A modern, strongly-typed object-oriented language developed by Microsoft, widely used for desktop applications, enterprise software, and backend services.',
      usage: 'Used as the core language behind SchedSTI to structure role-based access, conflict-checked scheduling workflows, and maintainable OOP classes.'
    },
    dotnet: {
      name: '.NET Framework',
      cat: 'Desktop & Application Platform',
      icon: 'assets/icons/dotnet.svg',
      desc: 'A mature software development framework providing rich UI controls, strong type safety, and system libraries for building reliable desktop software.',
      usage: 'Powers SchedSTI\'s standalone desktop interface, form layouts, and responsive scaling across Windows and Linux Mint.'
    },
    html5: {
      name: 'HTML5',
      cat: 'Web Markup & Structure',
      icon: 'assets/icons/html5.svg',
      desc: 'The standard semantic markup language for structuring web pages, interactive applications, multimedia, and 2D Canvas experiences.',
      usage: 'Used to structure Crystal Gems!, the Amethyx AI cross-platform UI, and this portfolio with clean semantics and accessible controls.'
    },
    css3: {
      name: 'CSS3',
      cat: 'Styling & Responsive Design',
      icon: 'assets/icons/css3.svg',
      desc: 'The styling language of the web, enabling Flexbox/Grid layouts, custom dark themes, smooth transitions, and responsive breakpoints.',
      usage: 'Used across this portfolio, Crystal Gems!, and Amethyx AI to craft minimalist dark-purple themes that adapt cleanly to desktop and mobile screens.'
    },
    javascript: {
      name: 'JavaScript',
      cat: 'Web & UI Scripting Language',
      icon: 'assets/icons/javascript.svg',
      desc: 'The core programming language of the browser for interactive interfaces, asynchronous API calls, Canvas rendering, and real-time DOM updates.',
      usage: 'Drives Crystal Gems! gameplay and Web Audio synthesis, Amethyx AI\'s live chat/multimodal client, and this portfolio\'s Edan Terminal and slideshows.'
    },
    python: {
      name: 'Python',
      cat: 'Scripting & Backend Language',
      icon: 'assets/icons/python.svg',
      desc: 'A readable, versatile programming language prized for rapid automation, data handling, AI integrations, and lightweight local servers.',
      usage: 'Powers Amethyx AI\'s local backend, SQLite chunked RAG memory, document parsing, and Groq/Gemini cloud routing alongside everyday scripting.'
    },
    java: {
      name: 'Java (Core OOP)',
      cat: 'Object-Oriented Language',
      icon: 'assets/icons/java.svg',
      desc: 'A portable, class-based OOP language known for strong architecture, cross-platform execution, and native Android development.',
      usage: 'Grounded through Oracle Java Fundamentals, UML-driven 2D event-driven game development, and native Android integration in Amethyx AI.'
    },
    'java-android': {
      name: 'Java (Android)',
      cat: 'Mobile Development',
      icon: 'assets/icons/java.svg',
      desc: 'Native Android application development using Java for WebView bridges, secure local storage, hardware permissions, and APK packaging.',
      usage: 'Used to build Amethyx.apk and Amethyx-Public.apk with an AES-256-GCM encrypted key vault, microphone dictation bridge, and LAN/relay connectivity.'
    },
    sqlite: {
      name: 'SQLite',
      cat: 'Embedded Relational Database',
      icon: 'assets/icons/sqlite.svg',
      desc: 'A lightweight, zero-configuration, file-based SQL database engine ideal for local storage, fast search, and portable offline-first apps.',
      usage: 'Stores Amethyx AI\'s local chat history, saved notes, and chunked RAG knowledge base without needing an external database server.'
    },
    cloudflare: {
      name: 'Cloudflare Workers',
      cat: 'Serverless Edge Runtime',
      icon: 'assets/icons/cloudflare.svg',
      desc: 'A globally distributed serverless JavaScript runtime at the edge, ideal for low-latency API relays, authentication checks, and rate limiting.',
      usage: 'Hosts Amethyx AI\'s 24/7 zero-key public relay with PIN protection and usage quotas so Amethyx-Public.apk works safely without exposing API keys.'
    },
    linux: {
      name: 'Linux',
      cat: 'Operating System & CLI',
      icon: 'assets/icons/linux.svg',
      desc: 'An open-source operating system family powering developer workstations, servers, and cloud infrastructure with powerful CLI tooling.',
      usage: 'My daily environment (Linux Mint & Ubuntu) for Bash/CLI workflows, cross-platform app testing, GTK3/WebKit2 builds, and double-clickable web apps.'
    },
    sap: {
      name: 'SAP S/4HANA',
      cat: 'Enterprise ERP Fundamentals',
      icon: 'assets/icons/sap.svg',
      desc: 'SAP\'s modern enterprise resource planning (ERP) suite connecting finance, logistics, HR, and core business processes in real time.',
      usage: 'Studied through BSIT coursework and school training to understand how enterprise logic, structured data flows, and organizational roles connect.'
    },
    github: {
      name: 'GitHub',
      cat: 'Version Control & Collaboration',
      icon: 'assets/icons/github.svg',
      desc: 'A Git-based code hosting platform for tracking revisions, managing public and private repositories, and collaborating on software projects.',
      usage: 'Used under @WaniBoogles to manage source history, releases, and documentation for Amethyx AI, Crystal Gems!, and private academic builds.'
    },
    'soft-logic': {
      name: 'Analytical Thinking',
      cat: 'Soft Skill · Logical Problem-Solving',
      icon: 'assets/icons/soft-logic.svg',
      desc: 'The ability to examine a problem systematically, isolate root causes, compare trade-offs, and design structured solutions before jumping into code.',
      usage: 'Helps me debug cross-platform edge cases, design conflict-free scheduling rules in SchedSTI, and structure clean RAG/API routing in Amethyx AI.'
    },
    'soft-team': {
      name: 'Team Collaboration',
      cat: 'Soft Skill · Open Communication',
      icon: 'assets/icons/soft-team.svg',
      desc: 'Working constructively with teammates by communicating progress clearly, asking direct questions when blocked, and welcoming code or design feedback.',
      usage: 'I keep discussions practical, respectful, and transparent so everyone stays aligned on requirements, timelines, and shared deliverables.'
    },
    'soft-adapt': {
      name: 'Adaptability',
      cat: 'Soft Skill · Eager to Learn New Tech',
      icon: 'assets/icons/soft-adapt.svg',
      desc: 'Staying calm and effective when requirements change, switching between tools or operating systems, and quickly learning unfamiliar stacks.',
      usage: 'Enabled me to move comfortably across C#/.NET, HTML5/JS, Python, Android Java, Linux Mint, Windows, and Cloudflare Workers as each project demanded.'
    },
    'soft-time': {
      name: 'Time Management',
      cat: 'Soft Skill · Attention to Detail',
      icon: 'assets/icons/soft-time.svg',
      desc: 'Balancing priorities, breaking work into achievable milestones, and keeping details clean so projects finish reliably without last-minute chaos.',
      usage: 'Keeps my academic deadlines, UI refinements, and multi-platform builds organized while still leaving time to test and polish edge cases.'
    },
    'soft-empathy': {
      name: 'Empathy',
      cat: 'Soft Skill · User-Centered Mindset',
      icon: 'assets/icons/soft-empathy.svg',
      desc: 'Putting yourself in the shoes of end-users and teammates — understanding their frustrations, privacy concerns, and everyday workflows.',
      usage: 'Guides how I design clear interfaces, hide confidential school data in public previews, and build tools that feel comfortable and human to use.'
    }
  };

  const terminalAutoCommands = [
    'creation', 'projects', 'amethyx', 'schedsti', 'crystal gems',
    'open amethyx', 'open schedsti', 'open crystal',
    'goto projects', 'goto skills', 'goto contact',
    'skills', 'ojt', 'github', 'linkedin', 'email', 'help', 'clear', 'exit'
  ];

  window.EdanPortfolio.data = {
    projectDetailsData,
    infoCatalog,
    terminalAutoCommands
  };
})();
