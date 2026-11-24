(function () {
  'use strict';

  window.EdanPortfolio = window.EdanPortfolio || {};

  // Interactive Portfolio Terminal + Window Controls (Minimize, Maximize, Close/Launch)
  const termWindow = document.getElementById('termWindow');
  const termBackdrop = document.getElementById('termBackdrop');
  const termLauncher = document.getElementById('termLauncher');
  const termGlitchFx = document.getElementById('termGlitchFx');
  const termMinBtn = document.getElementById('termMinBtn');
  const termMaxBtn = document.getElementById('termMaxBtn');
  const termCloseBtn = document.getElementById('termCloseBtn');
  const termScreen = document.getElementById('termScreen');
  const termHistory = document.getElementById('termHistory');
  const termForm = document.getElementById('termForm');
  const termInput = document.getElementById('termInput');

  const maxSvg = '<svg viewBox="0 0 10 10"><rect x="1.8" y="1.8" width="6.4" height="6.4" rx="1"/></svg>';
  const restoreSvg = '<svg viewBox="0 0 10 10"><rect x="1.5" y="3" width="5.2" height="5.2" rx="0.8"/><path d="M3.5 3V1.8h5v5H7.2"/></svg>';

  const playTerminalTransition = (done) => {
    if (!termGlitchFx) {
      done();
      return;
    }
    termGlitchFx.classList.remove('active');
    void termGlitchFx.offsetWidth;
    termGlitchFx.classList.add('active');
    setTimeout(() => {
      done();
    }, 160);
    setTimeout(() => {
      termGlitchFx.classList.remove('active');
    }, 390);
  };

  const isMaximized = () => Boolean(termWindow && termWindow.classList.contains('is-maximized'));

  const unmaximizeTerminal = () => {
    if (!isMaximized()) return;
    termWindow.classList.remove('is-maximized');
    if (termBackdrop) termBackdrop.classList.remove('open');
    if (termMaxBtn) termMaxBtn.innerHTML = maxSvg;
  };

  const closeTerminal = () => {
    if (!termWindow || !termLauncher) return;
    if (isMaximized()) {
      unmaximizeTerminal();
    }
    playTerminalTransition(() => {
      termWindow.classList.remove('is-minimized');
      termWindow.classList.add('is-closed');
      termLauncher.classList.add('visible');
    });
  };

  const openTerminal = () => {
    if (!termWindow || !termLauncher) return;
    playTerminalTransition(() => {
      termWindow.classList.remove('is-closed', 'is-minimized');
      termLauncher.classList.remove('visible');
      if (termInput) termInput.focus();
    });
  };

  if (termMinBtn && termWindow) {
    termMinBtn.addEventListener('click', () => {
      if (isMaximized()) {
        unmaximizeTerminal();
      }
      termWindow.classList.toggle('is-minimized');
    });
  }

  if (termMaxBtn && termWindow) {
    termMaxBtn.addEventListener('click', () => {
      termWindow.classList.remove('is-minimized');
      const willMax = !termWindow.classList.contains('is-maximized');
      termWindow.classList.toggle('is-maximized', willMax);
      if (termBackdrop) termBackdrop.classList.toggle('open', willMax);
      termMaxBtn.innerHTML = willMax ? restoreSvg : maxSvg;
      if (termInput) termInput.focus();
    });
  }

  if (termCloseBtn) termCloseBtn.addEventListener('click', closeTerminal);
  if (termBackdrop) {
    termBackdrop.addEventListener('click', unmaximizeTerminal);
  }
  if (termLauncher) termLauncher.addEventListener('click', openTerminal);

  const appendLine = (text, cls) => {
    if (!termHistory) return;
    const div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    termHistory.appendChild(div);
  };

  const hasAny = (str, words) => words.some((w) => str.includes(w));
  let lastTopic = '';
  const cmdHistory = [];
  let historyIdx = -1;

  const getAutoCommands = () => {
    const data = window.EdanPortfolio.data;
    return (data && Array.isArray(data.terminalAutoCommands)) ? data.terminalAutoCommands : [];
  };

  const openProjectModal = (key) => {
    const modals = window.EdanPortfolio.modals;
    if (modals && typeof modals.openProjectModalByKey === 'function') {
      modals.openProjectModalByKey(key);
    }
  };

  const reply = (title, body, topic) => {
    if (title) appendLine(title, 'accent');
    appendLine(body);
    if (topic) lastTopic = topic;
  };

  const runCommand = (raw) => {
    const clean = raw.trim();
    if (!clean) return;
    const q = clean.toLowerCase();

    cmdHistory.push(clean);
    historyIdx = cmdHistory.length;

    appendLine('visitor@portfolio:~$ ' + clean, 'muted');

    if (q === 'clear' || q === 'cls') {
      if (termHistory) termHistory.innerHTML = '';
      lastTopic = '';
      return;
    }

    if (q === 'exit' || q === 'quit') {
      closeTerminal();
      return;
    }

    if (/^(open|view|launch)\s+/.test(q)) {
      if (q.includes('amethyx')) {
        openProjectModal('amethyx');
        reply('Action:', 'Opened Amethyx AI project overview.', 'amethyx');
        if (termScreen) termScreen.scrollTop = termScreen.scrollHeight;
        return;
      }
      if (q.includes('schedsti') || q.includes('sched')) {
        openProjectModal('schedsti');
        reply('Action:', 'Opened SchedSTI project overview.', 'schedsti');
        if (termScreen) termScreen.scrollTop = termScreen.scrollHeight;
        return;
      }
      if (q.includes('crystal') || q.includes('gem')) {
        openProjectModal('crystal');
        reply('Action:', 'Opened Crystal Gems! project overview.', 'crystal');
        if (termScreen) termScreen.scrollTop = termScreen.scrollHeight;
        return;
      }
    }

    if (/^(goto|go to|scroll|cd)\s+/.test(q)) {
      const targetId = q.includes('project') || q.includes('work') ? 'projects'
        : q.includes('skill') ? 'skills'
        : q.includes('contact') || q.includes('email') ? 'contact'
        : '';
      if (targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        reply('Navigating:', 'Scrolled to #' + targetId + '.', targetId);
        if (termScreen) termScreen.scrollTop = termScreen.scrollHeight;
        return;
      }
    }

    if (q === 'help' || q === '?' || q === 'ls' || q === 'commands') {
      appendLine('Hey! Here are things you can ask me about (↑/↓ history · Tab autocomplete):', 'accent');
      appendLine('  creation / projects  - My built works (Amethyx AI, SchedSTI, Crystal Gems!)');
      appendLine('  open amethyx         - Open Amethyx AI details modal (also schedsti, crystal)');
      appendLine('  goto projects/skills - Jump directly to a section on the page');
      appendLine('  amethyx / schedsti   - Ask about a specific project');
      appendLine('  skills               - Technical & Soft skills (or ask about a language)');
      appendLine('  ojt / work           - My current OJT or work status');
      appendLine('  github / linkedin    - My GitHub repos & LinkedIn profile');
      appendLine('  email / contact      - How to reach me');
      appendLine('  clear / exit         - Clear or close this terminal');
      lastTopic = 'help';
    } else if (hasAny(q, ['you good', 'how are you', 'how r u', 'hows it going', "how's it going", 'doing good', 'whats up', "what's up", 'kamusta'])) {
      reply('Status:', "I'm doing good, thank you for asking! Always ready to share my works or talk about an IT / Software Intern role.", 'about');
    } else if (hasAny(q, ['professional', 'work ethic', 'reliable', 'disciplined', 'serious', 'organized'])) {
      reply('Work Ethic:', "I keep my work organized, attentive to detail, and reliable — I take deadlines, clean structure, and clear communication seriously while keeping a warm, approachable attitude.", 'soft');
    } else if (hasAny(q, ['hire', 'why should', 'why pick', 'choose you', 'bring to the team', 'value'])) {
      reply('What I Bring:', "I combine OOP and responsive front-end foundations with practical cross-platform testing on Linux and Windows — plus I'm adaptable, eager to learn quickly, and focused on building tools people can actually use comfortably.", 'about');
    } else if (hasAny(q, ['weakness', 'struggle', 'still learning', 'improve', 'challenge'])) {
      reply('Growth Area:', "Since I'm still a 4th-year BSIT student without formal industry experience yet, I'm actively sharpening my real-world engineering workflows and always welcome constructive feedback.", 'ojt');
    } else if (hasAny(q, ['ojt', 'working', 'employed', 'job', 'currently work', 'do you work', 'have a work', 'internship', 'available', 'hiring'])) {
      reply('Work / OJT Status:', "Currently, I have no work nor in an OJT yet. I am a 4th-year BSIT student looking for an IT / Software Internship where I can contribute and gain real industry experience.", 'ojt');
    } else if (hasAny(q, ['responsive', 'fast', 'quick', 'reply', 'screen size', 'scaling'])) {
      appendLine('Responsiveness:', 'accent');
      appendLine('Yes — both in how I collaborate with a team and in what we build. In SchedSTI I handled auto-responsive UI scaling and development fixes from bug-testing feedback, and in HTML5/CSS3 I focus on clean layouts that adapt smoothly.');
    } else if (hasAny(q, ['excel', 'strength', 'strong', 'best at', 'good at', 'specialty', 'good in', 'great at'])) {
      appendLine('Where I Excel:', 'accent');
      appendLine('I do best when turning practical requirements into working software — especially UI layout in HTML5 & CSS3, Object-Oriented Programming in C# and Java, and setting up clean cross-platform builds on Linux Mint and Windows.');
    } else if (hasAny(q, ['schedsti', 'sched', 'scheduling', 'schedule', 'timeslot', 'time slot', 'login'])) {
      if (hasAny(q, ['why', 'standalone', 'desktop', 'offline'])) {
        reply('SchedSTI (Architecture):', "We built SchedSTI as a standalone C# (.NET Framework) desktop system so Admin/HR, Department Heads, and Faculty can launch it directly on Windows or Linux Mint without a heavy server setup — with my focus on core development and iterative fixes from bug testing.", 'schedsti');
      } else if (hasAny(q, ['privacy', 'confidential', 'placeholder', 'instructor', 'name', 'hide'])) {
        reply('SchedSTI (Privacy):', "On this portfolio, we replaced instructor names, subject codes, sections, and exact schedule times with placeholders so no confidential school or faculty information is exposed publicly.", 'schedsti');
      } else {
        reply('SchedSTI:', "We developed SchedSTI in C# (.NET Framework) so scheduling regular classes and time slots stays clear and conflict-free across Admin/HR, Department Heads, and Faculty. I focused on core application development and refining features from QA and bug-testing feedback.", 'schedsti');
      }
    } else if (hasAny(q, ['crystal', 'gem', 'steven', 'game', 'canvas', 'map', 'main menu', 'startup'])) {
      if (hasAny(q, ['why', 'double', 'offline', 'mint', 'linux'])) {
        reply('Crystal Gems! (Design):', "I made Crystal Gems! completely self-contained in HTML5, CSS3, and JavaScript so I can launch it on Linux Mint just by double-tapping the file, with Web Audio synthesis and zero external installs.", 'crystal');
      } else {
        reply('Crystal Gems!:', "Crystal Gems! is a Steven Universe-inspired 2D HTML5 game I built to launch cleanly on Linux Mint, featuring a custom startup splash, a warm yet mature main menu, synthesized audio, and playable stage maps.", 'crystal');
      }
    } else if (hasAny(q, ['amethyx', 'ai assistant', 'assistant', 'rag', 'sqlite', 'cloudflare', 'relay', 'android', 'apk', 'imagine', 'voice', 'groq', 'gemini', 'multimodal'])) {
      if (hasAny(q, ['android', 'apk', 'relay', 'cloudflare', 'public', 'key', 'vault', 'security', 'sync'])) {
        reply('Amethyx AI (Android & Relay):', "I built both Amethyx.apk (with an AES-256-GCM encrypted key vault) and Amethyx-Public.apk so others can use it without ever touching my API keys, routed 24/7 through a PIN- and quota-protected Cloudflare Worker relay, plus LAN PC-Android sync via /api/sync.", 'amethyx');
      } else if (hasAny(q, ['imagine', 'voice', 'tts', 'multimodal', 'pdf', 'export', 'file'])) {
        reply('Amethyx AI (Multimodal & Voice):', "Amethyx AI reads multiple simultaneous attachments (.pdf, .docx, .pptx, .xlsx, code, photos, audio, video), supports toggle-to-stop live voice dictation and auto-read TTS, generates images with /imagine, and exports answers to .md, .html, .pdf, .docx, or .pptx in 1 click.", 'amethyx');
      } else {
        reply('Amethyx AI:', "Amethyx AI is my cross-platform multimodal AI assistant for Linux (GTK3/WebKit2), Windows (.exe), and Android (.apk). It combines local SQLite RAG memory, live web search, Groq & Gemini cloud routing, voice dictation, /imagine image generation, and a 24/7 Cloudflare Worker relay. Repo: https://github.com/WaniBoogles/AmethyxAI", 'amethyx');
      }
    } else if (hasAny(q, ['creation', 'project', 'work', 'built', 'made', 'portfolio', 'app', 'apps', 'show'])) {
      appendLine('My Works:', 'accent');
      appendLine('1) Amethyx AI [Python, JavaScript, HTML/CSS, Java (Android), SQLite, Cloudflare Workers] — Cross-platform multimodal AI assistant for Linux, Windows (.exe), and Android (.apk) with local RAG, Groq/Gemini routing, voice dictation, and /imagine.');
      appendLine('2) SchedSTI [C#, .NET Framework] — Role-based scheduling desktop app for regular schedules, time slots, and room allocations across Windows and Linux.');
      appendLine('3) Crystal Gems! [HTML5, CSS3, JavaScript] — Offline 2D browser game built for Linux Mint with a startup screen, main menu, synthesized audio, and stage maps.');
    } else if (hasAny(q, ['python'])) {
      appendLine('Python:', 'accent');
      appendLine('I use Python for scripting, logical problem-solving, and powering the local backend/SQLite RAG engine of Amethyx AI — alongside project work in C# (.NET Framework), Java, and HTML5/CSS3/JS.');
    } else if (hasAny(q, ['java']) && !q.includes('javascript')) {
      appendLine('Java:', 'accent');
      appendLine('I have Core OOP experience in Java — including Android WebView/vault integration for Amethyx AI, a 2D interactive game with event-driven programming and UML diagrams, plus Oracle Java Fundamentals training.');
    } else if (hasAny(q, ['c#', 'csharp', '.net', 'dotnet'])) {
      appendLine('C# (.NET Framework):', 'accent');
      appendLine('C# and the .NET Framework are what I used to build SchedSTI, handling role-based access, regular schedule workflows, and cross-platform UI scaling.');
    } else if (hasAny(q, ['html', 'css', 'javascript', 'web', 'frontend', 'front-end'])) {
      appendLine('Web Development:', 'accent');
      appendLine('I use HTML5, CSS3, and JavaScript for responsive layouts and interactive browser projects — like Crystal Gems! and this portfolio.');
    } else if (hasAny(q, ['linux', 'mint', 'ubuntu', 'windows', 'os', 'bash', 'cli'])) {
      appendLine('Operating Systems:', 'accent');
      appendLine('I use Linux Mint daily along with Ubuntu and Windows. I like making sure my projects run smoothly on Linux (like double-clickable HTML apps and cross-platform .NET tools).');
    } else if (hasAny(q, ['sap', 's/4hana', 'erp'])) {
      appendLine('SAP S/4HANA:', 'accent');
      appendLine('I have foundational knowledge of SAP S/4HANA process concepts and enterprise logic from my coursework and school training.');
    } else if (hasAny(q, ['empathy', 'soft', 'team', 'communicate', 'communication', 'collab', 'attitude'])) {
      appendLine('Soft Skills & Empathy:', 'accent');
      appendLine('Empathy really matters to me in IT — building software means thinking about the people actually using it. Alongside empathy, I bring analytical thinking, team collaboration, adaptability, and time management.');
    } else if (hasAny(q, ['skill', 'tech', 'language', 'lang', 'stack', 'tool']) || /\bknow\b/.test(q)) {
      appendLine('Technical & Soft Skills:', 'accent');
      appendLine('Technical: HTML5, CSS3, JavaScript, C# (.NET Framework), Java (Core OOP & Android), Python, SQLite, Linux, SAP S/4HANA (Fundamentals), and GitHub.');
      appendLine('Soft: Analytical Thinking, Team Collaboration, Adaptability, Time Management, and Empathy.');
    } else if (hasAny(q, ['linkedin', 'linked in', 'profile'])) {
      appendLine('LinkedIn:', 'accent');
      appendLine('You can connect with me on LinkedIn at https://www.linkedin.com/in/rhon-yuan-edan-63069736b.');
    } else if (hasAny(q, ['github', 'git', 'repo', 'waniboogles', 'code', 'source'])) {
      appendLine('GitHub:', 'accent');
      appendLine('My GitHub account is WaniBoogles — you can check out repos like AmethyxAI (https://github.com/WaniBoogles/AmethyxAI), Crystal-Gems-Fan-made-game-, and SchedSTI at https://github.com/WaniBoogles.');
    } else if (hasAny(q, ['email', 'contact', 'mail', 'reach', 'hire', 'message', 'apply'])) {
      appendLine('Contact:', 'accent');
      appendLine('Thank you for checking out my portfolio! You can email me at rhonyuane@gmail.com, connect on LinkedIn (https://www.linkedin.com/in/rhon-yuan-edan-63069736b), or reach me via GitHub (WaniBoogles).');
    } else if (hasAny(q, ['school', 'college', 'sti', 'study', 'studying', 'course', 'degree', 'bsit', 'graduate', 'education'])) {
      appendLine('Education:', 'accent');
      appendLine('I am a 4th-year Bachelor of Science in Information Technology (BSIT) student at STI College Lucena, with a STEM Senior High School background.');
    } else if (hasAny(q, ['theme', 'color', 'purple', 'dark', 'pixel', 'portrait', 'design', 'style'])) {
      appendLine('Design & Aesthetic:', 'accent');
      appendLine('I prefer dark gray, black, and purple with a clean, minimal look — inspired a bit by Prime Kindergarten and the warm, mature feel of the Steven Universe menu, plus my own Piskel pixel portrait.');
    } else if (hasAny(q, ['who are you', 'your name', 'nickname', 'yuan', 'wani', 'edan', 'about'])) {
      appendLine('About Me:', 'accent');
      appendLine('I am Rhon Yuan M. Edan (you can call me Yuan, or Wani). I am a BSIT student focused on OOP fundamentals, enterprise logic, and multi-platform software/web development.');
    } else if (hasAny(q, ['thank', 'thanks', 'ty'])) {
      reply('', "You're welcome! Let me know if you want to check anything else about my works or skills.", lastTopic);
    } else if (hasAny(q, ['good move', 'nice', 'cool', 'awesome', 'great', 'makes sense', 'alright', 'okay', 'ok', 'yes', 'yep', 'yeah', 'sure']) && q.split(/\s+/).length <= 5) {
      if (lastTopic === 'schedsti') {
        reply('', "Thanks! Making it standalone and keeping confidential data out while showing the scheduling flow felt like the right call.", lastTopic);
      } else if (lastTopic === 'crystal') {
        reply('', "Glad you like it! Feel free to check out the startup, main menu, and stage map previews down below.", lastTopic);
      } else if (lastTopic === 'amethyx') {
        reply('', "Thank you! You can also click View Details on the Amethyx AI card or check the repo at github.com/WaniBoogles/AmethyxAI.", lastTopic);
      } else {
        reply('', "Glad to hear that! Feel free to ask anything else about my projects, skills, OJT status, or contact info.", lastTopic);
      }
    } else if (['hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening'].includes(q)) {
      reply('', "Hey! Ask me anything about my works (SchedSTI, Crystal Gems!, Amethyx AI), skills, OJT status, GitHub, or email.", 'greeting');
    } else if (hasAny(q, ['why', 'how', 'tell me more', 'more']) && lastTopic) {
      if (lastTopic === 'schedsti') {
        reply('SchedSTI:', "Building it together as a standalone .NET app let us iterate quickly on role-based access, conflict checking, and bug-testing fixes across Windows and Linux Mint.", 'schedsti');
      } else if (lastTopic === 'crystal') {
        reply('Crystal Gems!:', "I focused on making it work completely offline in any browser on Linux Mint, with synthesized Web Audio and live-rendered stage maps.", 'crystal');
      } else if (lastTopic === 'amethyx') {
        reply('Amethyx AI:', "I wanted one unified assistant that stays private and portable across Linux, Windows, and Android — combining local SQLite RAG, Groq & Gemini cloud routing, and a zero-key Cloudflare Worker relay.", 'amethyx');
      } else {
        reply('', "Feel free to ask a specific question about SchedSTI, Crystal Gems!, Amethyx AI, my skills, or my OJT status!", lastTopic);
      }
    } else {
      appendLine("That isn't related to my works or portfolio.", 'warn');
      appendLine("You can ask about my projects (SchedSTI, Crystal Gems!, Amethyx AI), skills, OJT status, GitHub (WaniBoogles), or email.", 'muted');
    }

    if (termScreen) {
      termScreen.scrollTop = termScreen.scrollHeight;
    }
  };

  if (termForm && termInput) {
    termForm.addEventListener('submit', (e) => {
      e.preventDefault();
      runCommand(termInput.value);
      termInput.value = '';
    });

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        if (!cmdHistory.length) return;
        e.preventDefault();
        historyIdx = Math.max(0, historyIdx - 1);
        termInput.value = cmdHistory[historyIdx] || '';
      } else if (e.key === 'ArrowDown') {
        if (!cmdHistory.length) return;
        e.preventDefault();
        historyIdx = Math.min(cmdHistory.length, historyIdx + 1);
        termInput.value = historyIdx < cmdHistory.length ? cmdHistory[historyIdx] : '';
      } else if (e.key === 'Tab') {
        const val = termInput.value.trim().toLowerCase();
        if (!val) return;
        const match = getAutoCommands().find((c) => c.startsWith(val));
        if (match) {
          e.preventDefault();
          termInput.value = match;
        }
      }
    });
  }

  if (termScreen && termInput) {
    termScreen.addEventListener('click', () => termInput.focus());
  }

  document.querySelectorAll('.hint-cmd').forEach((btn) => {
    btn.addEventListener('click', () => {
      runCommand(btn.dataset.cmd || '');
      if (termInput) termInput.focus();
    });
  });

  window.EdanPortfolio.terminal = {
    openTerminal,
    closeTerminal,
    isMaximized,
    unmaximizeTerminal
  };
})();
