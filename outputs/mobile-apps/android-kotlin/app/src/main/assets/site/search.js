(function () {
  const form = document.querySelector(".search-page-form");
  const input = document.querySelector("#site-search-page");
  const summary = document.querySelector("#search-summary");
  const results = document.querySelector("#search-results");
  const index = window.SEARCH_INDEX || [];

  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function scorePage(page, terms) {
    const haystack = `${page.title} ${page.description} ${page.keywords}`.toLowerCase();
    return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
  }

  function render(query) {
    if (!summary || !results) return;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    results.innerHTML = "";

    if (!terms.length) {
      summary.textContent = "Enter a search term to find pages on the site.";
      return;
    }

    const matches = index
      .map((page) => ({ ...page, score: scorePage(page, terms) }))
      .filter((page) => page.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    summary.textContent = matches.length
      ? `${matches.length} result${matches.length === 1 ? "" : "s"} for "${query}".`
      : `No results found for "${query}".`;

    matches.forEach((page) => {
      const article = document.createElement("article");
      article.className = "search-result";
      article.innerHTML = `<h2>${page.title}</h2><p>${page.description}</p><a href="${page.url}">Open page</a>`;
      results.appendChild(article);
    });
  }

  const currentQuery = getQuery();
  if (input) input.value = currentQuery;
  render(currentQuery);

  if (form) {
    form.addEventListener("submit", function (event) {
      const query = input ? input.value.trim() : "";
      if (!query) {
        event.preventDefault();
        render("");
      }
    });
  }
})();
