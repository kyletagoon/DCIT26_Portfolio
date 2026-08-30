const ACTIVITIES = [
  {
    title: "Quiz 1: Emerging Technologies",
    category: "Quizzes",
    date: "2026-08-27", // YYYY/MM/DD
    images: ["images/Quizzes/Quiz1_DCIT26_front.jpg", "images/Quizzes/Quiz1_DCIT26_back.jpg"],
    score: "18/20",
    summary: "Assessment in a form of Quiz about Emerging Technologies",
    details: "Quiz about characteristics of Emerging Technologies and types of Emerging Technologies such as A.I, Machine Learning, Augmented Reality (AR), Cloud Computing, Quantum Computing, and Industrial Revolution.",

  },

];

let activeFilter = "all";

function renderFilterTabs(){
  const tabsWrap = document.getElementById("filterTabs");
  const categories = ["all", ...new Set(ACTIVITIES.map(a => a.category))];

  tabsWrap.innerHTML = categories.map(cat => `
    <button class="filter-tab ${cat === activeFilter ? "active" : ""}"
            data-filter="${escapeHTML(cat)}"
            role="tab"
            aria-selected="${cat === activeFilter}">
      ${cat === "all" ? "All Activities" : escapeHTML(cat)}
    </button>
  `).join("");

  tabsWrap.querySelectorAll(".filter-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      renderFilterTabs();
      renderActivities();
    });
  });
}

function renderActivities(){
  const grid = document.getElementById("logGrid");
  const list = ACTIVITIES.filter(a => activeFilter === "all" || a.category === activeFilter);

  if (list.length === 0){
    grid.innerHTML = `<p class="log-empty">No activities logged in this category yet.</p>`;
    return;
  }

  grid.innerHTML = list.map((a) => {
    const thumb = getImages(a)[0] || "";
    return `
    <article class="log-card" tabindex="0" data-index="${ACTIVITIES.indexOf(a)}">
      <div class="card-thumb">
        ${thumb ? `
          <img src="${escapeHTML(thumb)}" alt="${escapeHTML(a.title)}"
               loading="lazy"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        ` : ""}
        <span class="card-thumb-fallback" ${thumb ? "" : `style="display:flex;"`}>
          ${thumb ? "Image not found" : "No image set"}
        </span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(a.title)}</h3>
        <p class="card-desc">${escapeHTML(a.summary)}</p>
        <div class="card-meta">
          <span>${formatDate(a.date)}</span>
        </div>
        ${a.score ? `<p class="card-score">Score: <strong>${escapeHTML(a.score)}</strong></p>` : ""}
      </div>
    </article>
  `;
  }).join("");

  grid.querySelectorAll(".log-card").forEach(card => {
    const open = () => openModal(ACTIVITIES[Number(card.dataset.index)]);
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }
    });
  });
}

const backdrop = document.getElementById("modalBackdrop");
let galleryImages = [];
let galleryIndex = 0;

function getImages(activity){
  if (Array.isArray(activity.images) && activity.images.length) return activity.images;
  if (activity.image) return [activity.image];
  return [];
}

function openModal(activity){
  document.getElementById("modalCategory").textContent = activity.category;
  document.getElementById("modalTitle").textContent = activity.title;
  document.getElementById("modalDate").textContent = formatDate(activity.date);

  galleryImages = getImages(activity);
  galleryIndex = 0;

  const scoreHTML = activity.score
    ? `<p class="modal-score">Score: <strong>${escapeHTML(activity.score)}</strong></p>`
    : "";

  document.getElementById("modalBody").innerHTML =
    `<div class="modal-thumb" id="modalThumb"></div>${scoreHTML}<p>${escapeHTML(activity.details)}</p>`;

  renderGalleryImage();

  backdrop.classList.add("open");
  document.getElementById("modalClose").focus();
}

function renderGalleryImage(){
  const thumb = document.getElementById("modalThumb");
  const src = galleryImages[galleryIndex] || "";
  const title = document.getElementById("modalTitle").textContent;
  const multiple = galleryImages.length > 1;

  thumb.innerHTML = `
    ${src ? `
      <img src="${escapeHTML(src)}" alt="${escapeHTML(title)}"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    ` : ""}
    <span class="modal-thumb-fallback" ${src ? "" : `style="display:flex;"`}>
      ${src ? "Image not found" : "No image set"}
    </span>
    ${multiple ? `
      <button type="button" class="gallery-nav gallery-prev" aria-label="Previous photo">&#8249;</button>
      <button type="button" class="gallery-nav gallery-next" aria-label="Next photo">&#8250;</button>
      <span class="gallery-counter">${galleryIndex + 1} / ${galleryImages.length}</span>
    ` : ""}
  `;

  if (multiple){
    thumb.querySelector(".gallery-prev").addEventListener("click", () => {
      galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
      renderGalleryImage();
    });
    thumb.querySelector(".gallery-next").addEventListener("click", () => {
      galleryIndex = (galleryIndex + 1) % galleryImages.length;
      renderGalleryImage();
    });
  }

  const img = thumb.querySelector("img");
  if (img){
    img.addEventListener("click", () => openLightbox(src, title));
  }
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

function openLightbox(src, alt){
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.classList.add("open");
}

function closeLightbox(){
  lightbox.classList.remove("open");
}

document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

function closeModal(){
  backdrop.classList.remove("open");
}

document.getElementById("modalClose").addEventListener("click", closeModal);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape"){
    if (lightbox.classList.contains("open")){ closeLightbox(); return; }
    closeModal();
  }
  if (!backdrop.classList.contains("open")) return;
  if (lightbox.classList.contains("open")) return;
  if (e.key === "ArrowRight" && galleryImages.length > 1){
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    renderGalleryImage();
  }
  if (e.key === "ArrowLeft" && galleryImages.length > 1){
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    renderGalleryImage();
  }
});

function setupScrollSpy(){
  const links = document.querySelectorAll(".nav-link");
  const sections = [...links].map(t => document.getElementById(t.dataset.target));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        links.forEach(t => t.classList.toggle("active", t.dataset.target === entry.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });

  sections.forEach(s => s && observer.observe(s));
}

function formatDate(iso){
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function escapeHTML(str){
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  renderFilterTabs();
  renderActivities();
  setupScrollSpy();
});