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
      if (label) label.textContent = "Sudah disalin";
      if (snackbar) {
        snackbar.classList.add("show");
        window.setTimeout(() => snackbar.classList.remove("show"), 1800);
      }
      window.setTimeout(() => {
        if (label) label.textContent = "Salin @fadlyas07";
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
