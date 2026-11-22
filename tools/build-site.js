const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const origin = "https://theholisticecosystem.com";
const brand = "The Holistic Ecosystem";
const sections = ["Health", "Finance", "Travel", "Hobby & Lifestyle", "Cooking"];
const healthTopics = ["Physical", "Mental & Emotional", "Spiritual", "Purpose", "Social Connections"];
const slugify = (title) => title.normalize("NFKD").replace(/\p{Mark}/gu, "")
  .toLowerCase().replace(/\p{Dash_Punctuation}/gu, "-")
  .replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "");
const htmlEntities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escape = (text) => String(text).replace(/[&<>"]/g, (character) => htmlEntities[character]);
const sectionUrl = (section) => "/blog/topics/" + slugify(section);
const topicUrl = (topic) => sectionUrl("Health") + "/" + slugify(topic);
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const usedSlugs = new Set(["topics"]);

const postFiles = fs.readdirSync(path.join(root, "posts")).filter((file) => file.endsWith(".md"));
const matter = postFiles.length ? require("gray-matter") : null;
const markdown = postFiles.length ? require("markdown-it")() : null;
const posts = postFiles.map((file) => {
  const { data, content } = matter(fs.readFileSync(path.join(root, "posts", file), "utf8"));
  const { title, description, socialDescription = description, author = "Jamie",
    section, category, tags = [], imageAlt = "" } = data;
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  const dateValue = new Date(date);
  if (![title, description, socialDescription, author, category].every((value) => typeof value === "string" && value.trim()) ||
      !Array.isArray(tags) || !tags.every((tag) => typeof tag === "string" && tag.trim()) ||
      typeof imageAlt !== "string" ||
      !sections.includes(section) || (section === "Health" && !healthTopics.includes(category)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(dateValue.getTime()) ||
      dateValue.toISOString().slice(0, 10) !== date || !content.trim()) {
    throw new Error(file + ": invalid or missing post frontmatter or body");
  }
  const slug = slugify(title);
  if (!slug || usedSlugs.has(slug)) throw new Error(file + ": empty, reserved, or duplicate title slug");
  usedSlugs.add(slug);
  const image = new URL(data.image || "/assets/images/logo.png", origin);
  if (!["https:", "http:"].includes(image.protocol)) throw new Error(file + ": invalid image URL");
  return { title, description, socialDescription, author, date, section, category,
    tags: [...new Set(tags.map((tag) => tag.trim()))], imageAlt, image: image.href,
    hasImage: Boolean(data.image), url: "/blog/" + encodeURIComponent(slug), slug, content };
}).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

function navigation(activeSection, activeTopic) {
  const current = (selected) => selected ? ' aria-current="page"' : "";
  const links = sections.map((section) => {
    const link = `<a href="${sectionUrl(section)}"${current(section === activeSection && !activeTopic)}>${escape(section)}</a>`;
    if (section !== "Health") return `<li>${link}</li>`;
    return `<li class="health-menu">${link}<details class="health-topics">
      <summary aria-label="Health categories"></summary>
      <ul>${healthTopics.map((topic) => `<li><a href="${topicUrl(topic)}"${current(topic === activeTopic)}>${escape(topic)}</a></li>`).join("")}</ul>
    </details></li>`;
  }).join("");
  return `<nav class="blog-navigation" aria-label="Blog navigation">
    <button class="navigation-toggle" type="button" aria-expanded="false" aria-controls="blog-links" hidden>Blog topics</button>
    <div class="blog-links-group" id="blog-links">
      <span class="blog-links-label">Blogs:</span>
      <ul class="blog-links">${links}</ul>
    </div>
    <form class="site-search header-search" action="/search.html" method="get" role="search">
      <label class="sr-only" for="site-search-header">Search the site</label>
      <input id="site-search-header" type="search" name="q" placeholder="Search" required>
      <button class="search-button" type="submit">Search</button>
    </form>
  </nav>`;
}

function updateHeader(html, activeSection, activeTopic) {
  const headerPattern = /<header class="site-header">[\s\S]*?<\/header>/;
  const header = html.match(headerPattern)?.[0];
  if (!header || !header.includes('class="nav-wrap"') || !header.includes('class="nav-links"')) return html;
  const updated = header.replace('class="site-header"', 'class="site-header blog-enabled-header"')
    .replace('class="nav-links"', 'class="nav-links" id="main-links"')
    .replace(/<ul class="nav-links" id="main-links">/, `<button class="navigation-toggle" type="button" aria-expanded="false" aria-controls="main-links" hidden>Menu</button>
        <ul class="nav-links" id="main-links">`)
    .replace(/\s*<form\b[^>]*class="[^"]*header-search[^"]*"[^>]*>[\s\S]*?<\/form>/, "")
    .replace("</header>", navigation(activeSection, activeTopic) + "\n</header>");
  return html.replace(headerPattern, () => updated)
    .replace("</head>", '  <link rel="stylesheet" href="/blog.css">\n  <script src="/blog-ui.js" defer></script>\n</head>');
}

const template = fs.readFileSync(path.join(root, "public", "blog.html"), "utf8");
const header = template.match(/<div class="crisis-link">[\s\S]*?<\/header>/)[0]
  .replace(/(href|src)="(?:\.\/)?(assets\/[^"]+|[a-z]+\.html)"/g, '$1="/$2"');
const footer = template.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];

function page({ title, description, socialDescription = description, url, image = origin + "/assets/images/logo.png",
  imageAlt, date, author, tags = [], section, topic, body }) {
  const fullTitle = title + " | " + brand;
  const canonical = origin + url;
  const metadata = [
    ["description", description], ["og:type", date ? "article" : "website"],
    ["og:title", title], ["og:description", socialDescription], ["og:image", image],
    ["og:url", canonical], ["twitter:card", "summary_large_image"],
    ["twitter:title", title], ["twitter:description", socialDescription], ["twitter:image", image],
    ...(imageAlt ? [["og:image:alt", imageAlt], ["twitter:image:alt", imageAlt]] : []),
    ...(date ? [["article:published_time", date + "T00:00:00Z"], ["article:section", section],
      ["author", author], ...tags.map((tag) => ["article:tag", tag])] : []),
  ].map(([key, value]) => `<meta ${key.startsWith("og:") || key.startsWith("article:") ? "property" : "name"}="${key}" content="${escape(value)}">`).join("\n");
  return updateHeader(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(fullTitle)}</title>
${metadata}
<link rel="canonical" href="${escape(canonical)}">
<link rel="icon" href="/assets/favicon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&amp;display=swap">
<link rel="stylesheet" href="/style.css">
</head>
<body class="educational-page blog-page">
${header}
<main class="section ${date ? "blog-article-shell" : "blog-index-shell"}"><div class="blog-content">${body}</div></main>
${footer}
</body>
</html>
`, section, topic);
}

function writePage(route, html) {
  const file = path.join(output, route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function postDetails(post) {
  return `<p class="post-details"><time datetime="${post.date}">${dateFormat.format(new Date(post.date))}</time>
    <span aria-hidden="true">·</span><span>${escape(post.author)}</span></p>
    <ul class="post-tags" aria-label="Post topics">${[...new Set([post.category, ...post.tags])].map((tag) =>
      `<li class="post-tag">${escape(tag)}</li>`).join("")}</ul>`;
}

function listing(title, url, matchingPosts, section, topic) {
  const description = section ? `Browse ${title} posts from ${brand}.` :
    "Explore health, finance, travel, hobbies and everyday living, and cooking.";
  const topicLinks = section === "Health" && !topic
    ? `<ul class="blog-topic-links">${healthTopics.map((name) => `<li><a href="${topicUrl(name)}">${escape(name)}</a></li>`).join("")}</ul>` : "";
  const cards = matchingPosts.map((post) => `<article class="post-card${post.hasImage ? "" : " post-card-text"}">
  ${post.hasImage ? `<a class="post-card-cover" href="${post.url}" aria-label="Read ${escape(post.title)}">
    <img src="${escape(post.image)}" alt="${escape(post.imageAlt)}" loading="lazy" decoding="async"></a>` : ""}
  ${postDetails(post)}
  <h2><a href="${post.url}">${escape(post.title)}</a></h2>
  <p>${escape(post.description)}</p>
  <a href="${post.url}" aria-label="Read more about ${escape(post.title)}">Read more</a>
  </article>`).join("");
  writePage(url, page({ title, description, url, section, topic,
    body: `<header class="blog-intro">${section ? '<a href="/blog">All blogs</a>' : ""}
      <h1>${escape(title)}</h1><p>${escape(description)}</p>${topicLinks}</header>
      <div class="blog-index-layout">
        ${cards ? `<div class="post-list">${cards}</div>` : '<p class="blog-empty">No posts have been published here yet.</p>'}
        <aside class="blog-newsletter">
          <h2>Healthy Minds, Healthy Bodies</h2>
          <p>Jamie’s newsletter on mental health and everyday wellness.</p>
          <a href="https://jamieth2032.substack.com/">Visit the newsletter</a>
        </aside>
      </div>` }));
}

function shareLinks(post) {
  const canonical = origin + post.url;
  const url = encodeURIComponent(canonical);
  const title = encodeURIComponent(post.title);
  return `<aside class="post-share" aria-label="Share this post">
    <button type="button" data-copy-link="${escape(canonical)}" hidden>Copy Link</button>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}">LinkedIn</a>
    <a href="https://twitter.com/intent/tweet?url=${url}&amp;text=${title}">X</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${url}">Facebook</a>
    <span role="status"></span>
  </aside>`;
}

function updateSitePages(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) updateSitePages(file);
    if (item.isFile() && item.name.endsWith(".html")) {
      const html = fs.readFileSync(file, "utf8");
      const updated = updateHeader(html);
      if (updated !== html) fs.writeFileSync(file, updated);
    }
  }
}

fs.rmSync(output, { force: true, recursive: true });
fs.cpSync(path.join(root, "public"), output, { recursive: true });
updateSitePages(output);
listing("Blog", "/blog", posts);
for (const section of sections) {
  listing(section, sectionUrl(section), posts.filter((post) => post.section === section), section);
}
for (const topic of healthTopics) {
  listing(topic, topicUrl(topic), posts.filter((post) => post.section === "Health" && post.category === topic), "Health", topic);
}
for (const post of posts) {
  const body = `<nav aria-label="Breadcrumb" class="post-breadcrumb"><a href="/blog">Blog</a> /
    <a href="${sectionUrl(post.section)}">${escape(post.section)}</a>
    ${post.section === "Health" ? `/ <a href="${topicUrl(post.category)}">${escape(post.category)}</a>` : ""}</nav>
    <article class="blog-article">
    <header><h1>${escape(post.title)}</h1>${postDetails(post)}</header>
    <p class="post-deck">${escape(post.description)}</p>
    ${post.hasImage ? `<img class="post-cover" src="${escape(post.image)}" alt="${escape(post.imageAlt)}">` : ""}
    <div class="post-body">${markdown.render(post.content)}</div>
    </article>${shareLinks(post)}`;
  writePage("/blog/" + post.slug, page({ ...post, body }));
}

const searchData = path.join(output, "search-data.js");
const searchPosts = posts.map(({ title, description, section, category, tags, url }) =>
  ({ title, description, keywords: [section, category, ...tags].join(" "), url }));
fs.appendFileSync(searchData, "\nwindow.SEARCH_INDEX.push(..." + JSON.stringify(searchPosts) + ");\n");
console.log(`Built 11 blog listings and ${posts.length} posts.`);
