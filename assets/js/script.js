"use strict";

const USERNAME = "fadlyas07";
const EXCLUDED = new Set([
  "fadlyas07",
  "fadlyas07.github.io",
  "linux",
  "llvm-project",
  "mediapipe",
  "naruto"
]);

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupHeader();
  setupLanguageToggle();
  setupReveal();
  setupTabs();
  setupCopyButton();
  setupActiveNavigation();
  loadGitHubProfile();
});

function setYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

function setupHeader() {
  const header = document.getElementById("topbar");
  if (!header) return;

  const update = () => header.classList.toggle("scrolled", window.scrollY > 18);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

  items.forEach(item => observer.observe(item));
}

function setupTabs() {
  const buttons = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];

  const activate = name => {
    buttons.forEach(button => {
      const active = button.dataset.tab === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    panels.forEach(panel => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });

    if (name === "repos") loadRepositories();
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activate(button.dataset.tab));

    button.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;

      buttons[nextIndex].focus();
      activate(buttons[nextIndex].dataset.tab);
    });
  });
}

function setupCopyButton() {
  const button = document.getElementById("copy-handle");
  const label = document.getElementById("copy-label");
  const snackbar = document.getElementById("snackbar");
  if (!button) return;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("@fadlyas07");
      if (label) label.textContent = window.portfolioLanguage === "id" ? "Sudah disalin" : "Copied";
      if (snackbar) {
        snackbar.classList.add("show");
        window.setTimeout(() => snackbar.classList.remove("show"), 1800);
      }
      window.setTimeout(() => {
        if (label) label.textContent = window.portfolioLanguage === "id" ? "Salin @fadlyas07" : "Copy @fadlyas07";
      }, 2000);
    } catch {
      window.location.href = "https://github.com/fadlyas07";
    }
  });
}

function setupActiveNavigation() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a[href^='#']")];

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55%" });

  sections.forEach(section => observer.observe(section));
}

async function loadGitHubProfile() {
  try {
    const response = await fetch(`https://api.github.com/users/${USERNAME}`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const data = await response.json();

    const repos = document.getElementById("repo-count");
    const followers = document.getElementById("follower-count");
    if (repos) repos.textContent = data.public_repos;
    if (followers) followers.textContent = data.followers;
  } catch (error) {
    console.warn("Profil GitHub gagal dimuat:", error);
  }
}

let repositoriesLoaded = false;

async function loadRepositories() {
  if (repositoriesLoaded) return;
  repositoriesLoaded = true;

  const grid = document.getElementById("repo-grid");
  if (!grid) return;

  try {
    const response = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const repos = (await response.json())
      .filter(repo => !repo.fork && !repo.archived && !EXCLUDED.has(repo.name.toLowerCase()))
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) ||
                      (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, 6);

    if (!repos.length) throw new Error("Tidak ada repo yang cocok");
    grid.replaceChildren(...repos.map(createRepoCard));
  } catch (error) {
    console.warn("Repository gagal dimuat:", error);
    const message = document.createElement("div");
    message.className = "repo-error";
    message.textContent = "Daftar repo sedang nggak bisa dimuat. Coba buka profil GitHub langsung, ya.";
    grid.replaceChildren(message);
  }
}

function createRepoCard(repo) {
  const card = document.createElement("article");
  card.className = "repo-card";

  const icon = document.createElement("span");
  icon.className = "repo-icon";
  icon.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">folder</span>';

  const title = document.createElement("h4");
  const link = document.createElement("a");
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = repo.name;
  title.append(link);

  const description = document.createElement("p");
  description.textContent = repo.description || "Eksperimen dan source code yang dibagikan di GitHub.";

  const meta = document.createElement("div");
  meta.className = "repo-meta";

  const language = document.createElement("span");
  language.className = "repo-language";
  const dot = document.createElement("span");
  dot.className = "language-dot";
  const languageText = document.createElement("span");
  languageText.textContent = repo.language || "Code";
  language.append(dot, languageText);

  const stars = document.createElement("span");
  stars.textContent = `★ ${repo.stargazers_count}`;

  const forks = document.createElement("span");
  forks.textContent = `⑂ ${repo.forks_count}`;

  meta.append(language, stars, forks);
  card.append(icon, title, description, meta);
  return card;
}

/* =====================================================
   ENGLISH / INDONESIAN LANGUAGE
===================================================== */

window.portfolioLanguage = "id";

function setupLanguageToggle() {
  const toggle = document.getElementById("language-toggle");

  if (!toggle) return;

  const buttons = [...toggle.querySelectorAll("[data-language]")];

  /*
   * Indonesian is the default language for first-time visitors.
   * The visitor's latest language preference is stored in the browser.
   */
  let savedLanguage = "id";

  try {
    savedLanguage =
      localStorage.getItem("fadly-portfolio-language-v2") || "id";
  } catch {
    savedLanguage = "id";
  }

  if (!["en", "id"].includes(savedLanguage)) {
    savedLanguage = "id";
  }

  const applyLanguage = language => {
    window.portfolioLanguage = language;

    document.documentElement.lang = language;

    buttons.forEach(button => {
      const active = button.dataset.language === language;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    LANGUAGE_CONTENT.forEach(item => {
      const element = document.querySelector(item.selector);

      if (!element) return;

      const content = item[language];

      if (item.type === "html") {
        element.innerHTML = content;
      } else if (item.type === "attribute") {
        element.setAttribute(item.attribute, content);
      } else {
        element.textContent = content;
      }
    });

    document.title =
      language === "id"
        ? "Muhammad Fadly A. S. — Android, Linux & Open Source"
        : "Muhammad Fadly A. S. — Android, Linux & Open Source";

    const description = document.querySelector(
      'meta[name="description"]'
    );

    if (description) {
      description.content =
        language === "id"
          ? "Portofolio Muhammad Fadly A. S., developer yang suka ngulik Android, Linux, kernel, scripting, dan open source."
          : "The portfolio of Muhammad Fadly A. S., a developer who enjoys exploring Android, Linux, kernels, scripting, and open source.";
    }

    /*
     * Footer diterjemahkan menggunakan innerHTML sehingga elemen tahun
     * dibuat ulang. Jalankan setYear kembali setelah menerjemahkan.
     */
    setYear();

    try {
      localStorage.setItem(
        "fadly-portfolio-language-v2",
        language
      );
    } catch {
      // Website tetap bekerja apabila localStorage diblokir.
    }
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.language);
    });
  });

  applyLanguage(savedLanguage);
}

const LANGUAGE_CONTENT = [
  {
    selector: ".skip-link",
    en: "Skip to content",
    id: "Lewati ke isi"
  },
  {
    selector: ".brand",
    type: "attribute",
    attribute: "aria-label",
    en: "Return to homepage",
    id: "Kembali ke beranda"
  },
  {
    selector: ".desktop-nav",
    type: "attribute",
    attribute: "aria-label",
    en: "Main navigation",
    id: "Navigasi utama"
  },
  {
    selector: ".desktop-nav a:nth-child(1)",
    en: "Home",
    id: "Beranda"
  },
  {
    selector: ".desktop-nav a:nth-child(2)",
    en: "Work",
    id: "Karya"
  },
  {
    selector: ".desktop-nav a:nth-child(3)",
    en: "About",
    id: "Tentang"
  },
  {
    selector: ".desktop-nav a:nth-child(4)",
    en: "Contact",
    id: "Kontak"
  },
  {
    selector: ".github-button",
    type: "attribute",
    attribute: "aria-label",
    en: "Open GitHub profile",
    id: "Buka profil GitHub"
  },
  {
    selector: ".hello",
    en: "Hey, I'm Fadly.",
    id: "Halo, gue Fadly."
  },
  {
    selector: ".hero h1",
    type: "html",
    en: "I enjoy exploring small things until <span>they actually work.</span>",
    id: "Suka ngulik hal kecil sampai <span>akhirnya benar-benar jalan.</span>"
  },
  {
    selector: ".hero-description",
    en: "I mainly explore Android, Linux, kernels, scripting, and open source. It does not always have to be something big—as long as it is useful, tidy, and worth learning from.",
    id: "Fokus utamaku ada di Android, Linux, kernel, scripting, dan open source. Nggak selalu bikin sesuatu yang besar—yang penting berguna, rapi, dan bisa dipelajari lagi."
  },
  {
    selector: '.hero-actions .primary-button',
    type: "html",
    en: '<span class="material-symbols-rounded" aria-hidden="true">auto_awesome</span>See the good stuff',
    id: '<span class="material-symbols-rounded" aria-hidden="true">auto_awesome</span>Lihat yang paling seru'
  },
  {
    selector: "#copy-label",
    en: "Copy @fadlyas07",
    id: "Salin @fadlyas07"
  },
  {
    selector: ".quick-facts .fact:nth-child(3) small",
    en: "started exploring",
    id: "mulai ngulik"
  },
  {
    selector: ".profile-photo img",
    type: "attribute",
    attribute: "alt",
    en: "Profile photo of Muhammad Fadly A. S.",
    id: "Foto profil Muhammad Fadly A. S."
  },
  {
    selector: ".mini-intro p",
    en: "Lately, I have been enjoying simple apps, cleaner workflows, and learning from code that once made me wonder, “how does this even work?”",
    id: "Lagi senang bikin aplikasi yang simpel, merapikan workflow, dan belajar dari kode yang sebelumnya terasa “kok bisa?”."
  },

  /* Featured work */
  {
    selector: "#work .section-label",
    en: "Selected work",
    id: "Pilihan utama"
  },
  {
    selector: "#work .section-heading h2",
    en: "The work worth putting up front.",
    id: "Yang paling layak ditaruh di depan."
  },
  {
    selector: "#work .section-heading > p",
    en: "Not everything I have ever made—just a few projects that best represent how I learn and work.",
    id: "Bukan semua yang pernah dibuat. Cuma beberapa yang paling mewakili cara gue belajar dan bekerja."
  },
  {
    selector: ".featured-grid .project-card:nth-child(1) .status-chip",
    en: "in development",
    id: "lagi dikembangkan"
  },
  {
    selector: ".featured-grid .project-card:nth-child(1) .project-content > p",
    en: "A lightweight and calm Android experiment. The focus is not having countless features, but creating a clean experience, thoughtful motion, and English–Indonesian support.",
    id: "Eksperimen aplikasi Android yang sengaja dibuat ringan dan tenang. Fokusnya bukan banyak fitur, tapi pengalaman yang bersih, animasi yang pas, dan dukungan bahasa Indonesia–Inggris."
  },
  {
    selector: ".featured-grid .project-card:nth-child(1) .text-button",
    type: "html",
    en: 'Open project <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>',
    id: 'Buka proyek <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>'
  },
  {
    selector: ".featured-grid .project-card:nth-child(2) .project-content > p",
    en: "A place to learn about Linux kernels, toolchains, compilation, and how Android works closer to the system.",
    id: "Tempat belajar soal Linux kernel, toolchain, kompilasi, dan bagaimana Android bekerja lebih dekat ke sistem."
  },
  {
    selector: ".featured-grid .project-card:nth-child(2) .text-button",
    type: "html",
    en: 'View source <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>',
    id: 'Lihat source <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>'
  },
  {
    selector: ".featured-grid .project-card:nth-child(3) .project-content > p",
    en: "A collection of small scripts that reduce repetitive work while building Android kernels. Nothing complicated, but genuinely useful.",
    id: "Kumpulan script kecil buat mengurangi pekerjaan berulang saat build kernel Android. Nggak rumit, tapi kepakai."
  },
  {
    selector: ".featured-grid .project-card:nth-child(3) .text-button",
    type: "html",
    en: 'View scripts <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>',
    id: 'Lihat scripts <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>'
  },

  /* Information tabs */
  {
    selector: "#more .section-label",
    en: "A little more about me",
    id: "Kenalan lebih jauh"
  },
  {
    selector: "#more .section-heading h2",
    en: "More information, without the clutter.",
    id: "Informasi lengkap, tapi nggak ditumpuk."
  },
  {
    selector: "#more .section-heading > p",
    en: "Choose what you would like to read. Everything else stays neatly tucked away so the homepage remains calm.",
    id: "Pilih menu yang mau dibaca. Bagian lain tetap disimpan rapi biar halaman depan nggak terasa ramai."
  },
  {
    selector: "#tab-about",
    type: "html",
    en: '<span class="material-symbols-rounded" aria-hidden="true">person</span>About',
    id: '<span class="material-symbols-rounded" aria-hidden="true">person</span>Tentang'
  },
  {
    selector: "#tab-journey",
    type: "html",
    en: '<span class="material-symbols-rounded" aria-hidden="true">route</span>Journey',
    id: '<span class="material-symbols-rounded" aria-hidden="true">route</span>Perjalanan'
  },
  {
    selector: "#tab-repos",
    type: "html",
    en: '<span class="material-symbols-rounded" aria-hidden="true">folder_open</span>More repos',
    id: '<span class="material-symbols-rounded" aria-hidden="true">folder_open</span>Repo lain'
  },
  {
    selector: "#panel-about .panel-kicker",
    en: "A quick story",
    id: "Sedikit cerita"
  },
  {
    selector: "#panel-about .about-panel h3",
    en: "Not claiming to be the best. I just enjoy exploring.",
    id: "Nggak merasa paling jago. Cuma betah ngulik."
  },
  {
    selector: "#panel-about .about-copy p:nth-child(1)",
    en: "It began with curiosity about Android kernels and Linux. That taught me to read source code, try a build, encounter errors, and slowly understand what was actually going wrong.",
    id: "Mulainya dari rasa penasaran sama Android kernel dan Linux. Dari sana jadi terbiasa baca source, nyoba build, nemu error, lalu pelan-pelan ngerti bagian mana yang sebenarnya bermasalah."
  },
  {
    selector: "#panel-about .about-copy p:nth-child(2)",
    en: "My interests are now expanding into Android apps, simple web experiences, automation, and tools that improve my own workflow.",
    id: "Sekarang minatnya mulai melebar ke aplikasi Android, web sederhana, automation, dan tools yang bisa membantu workflow sendiri."
  },
  {
    selector: "#panel-about .value-card:nth-child(1) strong",
    en: "Understand first",
    id: "Pahami dulu"
  },
  {
    selector: "#panel-about .value-card:nth-child(1) p",
    en: "Technology comes after the problem is clear.",
    id: "Teknologi datang setelah masalahnya jelas."
  },
  {
    selector: "#panel-about .value-card:nth-child(2) strong",
    en: "Build useful things",
    id: "Bikin yang kepakai"
  },
  {
    selector: "#panel-about .value-card:nth-child(2) p",
    en: "I prefer small solutions that are genuinely useful.",
    id: "Lebih suka solusi kecil yang benar-benar berguna."
  },
  {
    selector: "#panel-about .value-card:nth-child(3) strong",
    en: "Improve gradually",
    id: "Perbaiki pelan-pelan"
  },
  {
    selector: "#panel-about .value-card:nth-child(3) p",
    en: "It does not need to be perfect on the first attempt.",
    id: "Nggak harus sempurna di percobaan pertama."
  },

  /* Journey */
  {
    selector: "#panel-journey article:nth-child(1) h3",
    en: "Starting with Android and Linux",
    id: "Mulai dari Android dan Linux"
  },
  {
    selector: "#panel-journey article:nth-child(1) p",
    en: "Learning about kernels, custom ROMs, build environments, and confidently experimenting with my own devices.",
    id: "Belajar kernel, custom ROM, build environment, dan berani utak-atik perangkat sendiri."
  },
  {
    selector: "#panel-journey article:nth-child(2) .journey-year",
    en: "Then",
    id: "Lanjut"
  },
  {
    selector: "#panel-journey article:nth-child(2) h3",
    en: "Toolchains and scripting",
    id: "Toolchain dan scripting"
  },
  {
    selector: "#panel-journey article:nth-child(2) p",
    en: "Making build processes cleaner with shell scripts, Git, LLVM, Clang, and packaging.",
    id: "Mulai merapikan proses build dengan shell script, Git, LLVM, Clang, dan packaging."
  },
  {
    selector: "#panel-journey article:nth-child(3) .journey-year",
    en: "Now",
    id: "Sekarang"
  },
  {
    selector: "#panel-journey article:nth-child(3) h3",
    en: "Building more complete experiences",
    id: "Bikin pengalaman yang lebih utuh"
  },
  {
    selector: "#panel-journey article:nth-child(3) p",
    en: "Not only the system underneath, but also apps and interfaces that feel comfortable to use.",
    id: "Nggak cuma sistem di belakang, tapi juga aplikasi dan tampilan yang nyaman dipakai."
  },

  /* Repository panel */
  {
    selector: "#panel-repos .panel-kicker",
    en: "Loaded directly from GitHub",
    id: "Dari GitHub langsung"
  },
  {
    selector: "#panel-repos .repo-panel-heading h3",
    en: "A few more public repositories.",
    id: "Beberapa repo publik lainnya."
  },
  {
    selector: "#panel-repos .small-link",
    en: "View all",
    id: "Lihat semua"
  },

  /* Contact */
  {
    selector: "#contact .section-label",
    en: "Connect",
    id: "Terhubung"
  },
  {
    selector: "#contact h2",
    en: "Found something interesting to explore together? Just say hi.",
    id: "Kalau ada hal menarik buat diulik bareng, kabarin aja."
  },
  {
    selector: "#contact .contact-copy > p",
    en: "The easiest place to see my work and reach me right now is GitHub.",
    id: "Tempat paling gampang buat melihat kerjaan dan menghubungi gue saat ini masih GitHub."
  },
  {
    selector: "#contact .contact-actions .primary-button",
    type: "html",
    en: 'Open GitHub <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>',
    id: 'Buka GitHub <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>'
  },
  {
    selector: "#contact .contact-actions .light-button",
    en: "All repositories",
    id: "Semua repository"
  },

  /* Footer and mobile navigation */
  {
    selector: ".footer-brand p",
    type: "html",
    en: 'Built slowly by <strong>Muhammad Fadly A. S.</strong><br><small>© <span id="year"></span> · still learning, still exploring.</small>',
    id: 'Dibuat pelan-pelan oleh <strong>Muhammad Fadly A. S.</strong><br><small>© <span id="year"></span> · tetap belajar, tetap ngulik.</small>'
  },
  {
    selector: ".back-top",
    type: "html",
    en: 'Back to top <span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>',
    id: 'Ke atas <span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>'
  },
  {
    selector: ".mobile-nav a:nth-child(2) small",
    en: "Work",
    id: "Karya"
  },
  {
    selector: ".mobile-nav a:nth-child(3) small",
    en: "About",
    id: "Tentang"
  },
  {
    selector: "#snackbar",
    en: "Username copied",
    id: "Username disalin"
  }
];

/* =====================================================
   FULL DYNAMIC HEADER GREETING — BOGOR TIME
===================================================== */

(() => {
  const TIME_ZONE = "Asia/Jakarta";
  const ROTATION_INTERVAL = 4200;

  const greetingData = {
    morning: {
      periodIcon: "🌅",
      greetings: [
        {
          text: "Selamat pagi",
          language: "Indonesia",
          lang: "id",
          flag: "🇮🇩"
        },
        {
          text: "Good morning",
          language: "Inggris",
          lang: "en",
          flag: "🇬🇧"
        },
        {
          text: "おはようございます",
          language: "Jepang",
          lang: "ja",
          flag: "🇯🇵"
        },
        {
          text: "좋은 아침이에요",
          language: "Korea",
          lang: "ko",
          flag: "🇰🇷"
        },
        {
          text: "صباح الخير",
          language: "Arab",
          lang: "ar",
          dir: "rtl",
          flag: "🇸🇦"
        },
        {
          text: "Bonjour",
          language: "Prancis",
          lang: "fr",
          flag: "🇫🇷"
        },
        {
          text: "Guten Morgen",
          language: "Jerman",
          lang: "de",
          flag: "🇩🇪"
        },
        {
          text: "Buenos días",
          language: "Spanyol",
          lang: "es",
          flag: "🇪🇸"
        },
        {
          text: "Buongiorno",
          language: "Italia",
          lang: "it",
          flag: "🇮🇹"
        }
      ]
    },

    afternoon: {
      periodIcon: "☀️",
      greetings: [
        {
          text: "Selamat siang",
          language: "Indonesia",
          lang: "id",
          flag: "🇮🇩"
        },
        {
          text: "Good afternoon",
          language: "Inggris",
          lang: "en",
          flag: "🇬🇧"
        },
        {
          text: "こんにちは",
          language: "Jepang",
          lang: "ja",
          flag: "🇯🇵"
        },
        {
          text: "좋은 오후예요",
          language: "Korea",
          lang: "ko",
          flag: "🇰🇷"
        },
        {
          text: "نهارك سعيد",
          language: "Arab",
          lang: "ar",
          dir: "rtl",
          flag: "🇸🇦"
        },
        {
          text: "Bon après-midi",
          language: "Prancis",
          lang: "fr",
          flag: "🇫🇷"
        },
        {
          text: "Guten Tag",
          language: "Jerman",
          lang: "de",
          flag: "🇩🇪"
        },
        {
          text: "Buenas tardes",
          language: "Spanyol",
          lang: "es",
          flag: "🇪🇸"
        },
        {
          text: "Buon pomeriggio",
          language: "Italia",
          lang: "it",
          flag: "🇮🇹"
        }
      ]
    },

    evening: {
      periodIcon: "🌇",
      greetings: [
        {
          text: "Selamat sore",
          language: "Indonesia",
          lang: "id",
          flag: "🇮🇩"
        },
        {
          text: "Good evening",
          language: "Inggris",
          lang: "en",
          flag: "🇬🇧"
        },
        {
          text: "こんばんは",
          language: "Jepang",
          lang: "ja",
          flag: "🇯🇵"
        },
        {
          text: "좋은 저녁이에요",
          language: "Korea",
          lang: "ko",
          flag: "🇰🇷"
        },
        {
          text: "مساء الخير",
          language: "Arab",
          lang: "ar",
          dir: "rtl",
          flag: "🇸🇦"
        },
        {
          text: "Bonsoir",
          language: "Prancis",
          lang: "fr",
          flag: "🇫🇷"
        },
        {
          text: "Guten Abend",
          language: "Jerman",
          lang: "de",
          flag: "🇩🇪"
        },
        {
          text: "Buenas tardes",
          language: "Spanyol",
          lang: "es",
          flag: "🇪🇸"
        },
        {
          text: "Buonasera",
          language: "Italia",
          lang: "it",
          flag: "🇮🇹"
        }
      ]
    },

    night: {
      periodIcon: "🌙",
      greetings: [
        {
          text: "Selamat malam",
          language: "Indonesia",
          lang: "id",
          flag: "🇮🇩"
        },
        {
          text: "Good evening",
          language: "Inggris",
          lang: "en",
          flag: "🇬🇧"
        },
        {
          text: "こんばんは",
          language: "Jepang",
          lang: "ja",
          flag: "🇯🇵"
        },
        {
          text: "편안한 밤 되세요",
          language: "Korea",
          lang: "ko",
          flag: "🇰🇷"
        },
        {
          text: "مساء الخير",
          language: "Arab",
          lang: "ar",
          dir: "rtl",
          flag: "🇸🇦"
        },
        {
          text: "Bonsoir",
          language: "Prancis",
          lang: "fr",
          flag: "🇫🇷"
        },
        {
          text: "Guten Abend",
          language: "Jerman",
          lang: "de",
          flag: "🇩🇪"
        },
        {
          text: "Buenas noches",
          language: "Spanyol",
          lang: "es",
          flag: "🇪🇸"
        },
        {
          text: "Buonasera",
          language: "Italia",
          lang: "it",
          flag: "🇮🇹"
        }
      ]
    }
  };

  function getBogorTime() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());

    const values = {};

    parts.forEach(part => {
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    });

    return {
      hour: Number(values.hour || 0),
      time: `${values.hour || "00"}:${values.minute || "00"}`
    };
  }

  function getTimePeriod(hour) {
    if (hour >= 4 && hour < 11) {
      return "morning";
    }

    if (hour >= 11 && hour < 15) {
      return "afternoon";
    }

    if (hour >= 15 && hour < 18) {
      return "evening";
    }

    return "night";
  }

  function initializeDynamicHeaderGreeting() {
    const brand = document.querySelector(".brand");

    if (!brand) return;

    if (typeof window.__dynamicHeaderGreetingCleanup === "function") {
      window.__dynamicHeaderGreetingCleanup();
    }

    brand.classList.add("dynamic-greeting");

    brand.innerHTML = `
      <span class="brand-mark greeting-symbol" aria-hidden="true">
        <span class="greeting-flag">🇮🇩</span>
        <span class="greeting-period-icon">🌅</span>
      </span>

      <span class="brand-text greeting-copy">
        <strong class="greeting-title">Selamat pagi</strong>
        <small class="greeting-meta">Indonesia · Bogor</small>
      </span>
    `;

    const flagElement = brand.querySelector(".greeting-flag");
    const periodIconElement = brand.querySelector(
      ".greeting-period-icon"
    );
    const titleElement = brand.querySelector(".greeting-title");
    const metaElement = brand.querySelector(".greeting-meta");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let currentPeriod = getTimePeriod(getBogorTime().hour);
    let greetingIndex = 0;
    let animationTimeout;

    function applyGreeting() {
      const bogorTime = getBogorTime();
      const updatedPeriod = getTimePeriod(bogorTime.hour);

      if (updatedPeriod !== currentPeriod) {
        currentPeriod = updatedPeriod;
        greetingIndex = 0;
      }

      const periodData = greetingData[currentPeriod];
      const greetings = periodData.greetings;
      const greeting =
        greetings[greetingIndex % greetings.length];

      brand.classList.remove(
        "period-morning",
        "period-afternoon",
        "period-evening",
        "period-night"
      );

      brand.classList.add(`period-${currentPeriod}`);

      flagElement.textContent = greeting.flag;
      periodIconElement.textContent = periodData.periodIcon;

      titleElement.textContent = greeting.text;
      titleElement.lang = greeting.lang;
      titleElement.dir = greeting.dir || "auto";

      metaElement.textContent =
        `${greeting.language} · ${bogorTime.time} WIB`;

      metaElement.lang = "id";
      metaElement.dir = "ltr";

      brand.setAttribute(
        "aria-label",
        `${greeting.text}. Bahasa ${greeting.language}. ` +
        `Waktu Bogor ${bogorTime.time} WIB.`
      );

      brand.setAttribute(
        "title",
        `${greeting.text} — ${greeting.language} · ` +
        `${bogorTime.time} WIB`
      );
    }

    function renderGreeting(animate = true) {
      window.clearTimeout(animationTimeout);

      if (!animate || reducedMotion) {
        applyGreeting();
        return;
      }

      brand.classList.add("is-changing");

      animationTimeout = window.setTimeout(() => {
        applyGreeting();

        requestAnimationFrame(() => {
          brand.classList.remove("is-changing");
        });
      }, 240);
    }

    renderGreeting(false);

    const greetingRotation = window.setInterval(() => {
      const currentGreetings =
        greetingData[currentPeriod].greetings;

      greetingIndex =
        (greetingIndex + 1) % currentGreetings.length;

      renderGreeting(true);
    }, ROTATION_INTERVAL);

    const bogorClockSync = window.setInterval(() => {
      const newPeriod = getTimePeriod(getBogorTime().hour);

      if (newPeriod !== currentPeriod) {
        currentPeriod = newPeriod;
        greetingIndex = 0;
        renderGreeting(true);
        return;
      }

      applyGreeting();
    }, 30000);

    window.__dynamicHeaderGreetingCleanup = () => {
      window.clearInterval(greetingRotation);
      window.clearInterval(bogorClockSync);
      window.clearTimeout(animationTimeout);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeDynamicHeaderGreeting,
      { once: true }
    );
  } else {
    initializeDynamicHeaderGreeting();
  }
})();

