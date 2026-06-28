const fs = require("node:fs");
const path = require("node:path");
const { mentalHealthTopics } = require("../mental-health-topics");

const roots = [".", "public", "outputs"];
const alphabetOrder = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "G",
  "H",
  "M",
  "O",
  "P",
  "S",
  "T",
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function topicUrl(topic) {
  return `mental-health/${topic.slug}`;
}

function relativeTopicUrl(topic) {
  return topic.slug;
}

function pageIntro(topic) {
  return [
    `${topic.description} Learning about ${topic.title} can help people better understand experiences, language, support options, and when it may be helpful to reach out for professional guidance.`,
    "This page is intended as an educational starting point. It does not diagnose, treat, or replace support from a licensed mental health professional, therapist, psychologist, psychiatrist, physician, or crisis service.",
    "Over time, this hub will grow with practical articles, podcast episodes, videos, downloadable resources, lived-experience education, and external support links.",
  ];
}

function relatedArticlesMarkup(topic) {
  if (!topic.relatedArticles || topic.relatedArticles.length === 0) {
    return '<p class="resource-note">Related articles will be added here soon.</p>';
  }

  return `<div class="sections-grid">
${topic.relatedArticles
  .map(
    (article) => `          <article class="content-panel">
            <h2>${escapeHtml(article.title)}</h2>
            <p>${escapeHtml(article.summary)}</p>
            <a class="button-link" href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">Read the Article &rarr;</a>
          </article>`
  )
  .join("\n")}
        </div>`;
}

function topicPage(topic) {
  const intro = pageIntro(topic);
  const description = `${topic.description} This topic page is part of The Holistic Ecosystem mental health education hub.`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(topic.title)} | The Holistic Ecosystem" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="https://www.theholisticecosystem.com/assets/images/logo.png" />
    <meta property="og:url" content="https://www.theholisticecosystem.com/mental-health/${escapeHtml(topic.slug)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(topic.title)} | The Holistic Ecosystem" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="https://www.theholisticecosystem.com/assets/images/logo.png" />
    <link rel="icon" href="/assets/favicon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <title>${escapeHtml(topic.title)} | The Holistic Ecosystem</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../style.css" />
  </head>
  <body class="educational-page">
    <div class="crisis-link"><a href="https://988lifeline.org/">Feeling down? Chat with 988</a></div>
    <header class="site-header">
      <nav class="nav-wrap" aria-label="Main navigation">
        <a class="brand" href="/"><img class="site-logo" src="../assets/the-holistic-ecosystem-logo.png" alt="The Holistic Ecosystem logo" /><span>The Holistic Ecosystem</span></a>
        <ul class="nav-links"><li><a href="/#home">Home</a></li><li><a href="../theecosystem">The Ecosystem</a></li><li><a href="../contact">Contact</a></li></ul>
        <form class="site-search header-search" action="../search" method="get" role="search">
          <label class="sr-only" for="site-search-header">Search the site</label>
          <input id="site-search-header" type="search" name="q" placeholder="Search" />
          <button type="submit">Search</button>
        </form>
      </nav>
    </header>
    <main class="section">
      <div class="section-inner content-block page-block resource-page">
        <p class="eyebrow">Mental Health Education</p>
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="../theecosystem">The System</a></li>
            <li><a href="../mental">Mental</a></li>
            <li><a href="../mental-health-education">Mental Health Education</a></li>
            <li><span aria-current="page">${escapeHtml(topic.title)}</span></li>
          </ol>
        </nav>

        <h1>${escapeHtml(topic.title)}</h1>
        ${intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n        ")}

        <section class="resource-section" aria-labelledby="related-articles">
          <h2 id="related-articles">Related Articles</h2>
          ${relatedArticlesMarkup(topic)}
        </section>

        <section class="resource-section" aria-labelledby="resources">
          <h2 id="resources">Resources</h2>
          <p class="resource-note">Helpful resources, support links, worksheets, and learning tools will be added here soon.</p>
        </section>

        <section class="resource-section" aria-labelledby="coming-soon">
          <h2 id="coming-soon">Coming Soon</h2>
          <p>Additional educational articles, podcast episodes, videos, downloadable tools, and support resources will continue to be added over time.</p>
        </section>

        <a class="button-link" href="../mental-health-education">Back to Mental Health Education</a>
      </div>
    </main>
    <footer class="site-footer"><div class="footer-inner"><p class="disclaimer">Disclaimer: This page is not controlled by a licensed professional, uses words that may be considered offensive, and may have content not appropriate for all ages. This website also uses affiliate marketing.</p></div></footer>
  </body>
</html>
`;
}

function azListMarkup() {
  const groups = new Map();
  for (const topic of mentalHealthTopics) {
    const firstLetter = topic.title[0].toUpperCase();
    if (!groups.has(firstLetter)) groups.set(firstLetter, []);
    groups.get(firstLetter).push(topic);
  }

  return alphabetOrder
    .filter((letter) => groups.has(letter))
    .map((letter) => {
      const items = groups
        .get(letter)
        .map(
          (topic) =>
            `<li><a href="${topicUrl(topic)}">${escapeHtml(topic.title)}</a></li>`
        )
        .join("");

      return `            <div class="az-group"><h3>${letter}</h3><ul>${items}</ul></div>`;
    })
    .join("\n");
}

function updateEducationPage(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(
    /          <div class="az-list">[\s\S]*?          <\/div>\r?\n        <\/section>/,
    `          <div class="az-list">
${azListMarkup()}
          </div>
        </section>`
  );

  fs.writeFileSync(filePath, updated);
}

for (const root of roots) {
  const outputDir = path.join(root, "mental-health");
  fs.mkdirSync(outputDir, { recursive: true });

  for (const topic of mentalHealthTopics) {
    fs.writeFileSync(path.join(outputDir, `${topic.slug}.html`), topicPage(topic));
  }

  const educationPage = path.join(root, "mental-health-education.html");
  if (fs.existsSync(educationPage)) {
    updateEducationPage(educationPage);
  }
}
