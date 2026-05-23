import * as cheerio from "cheerio";

async function fetchFromArxiv(formattedQuery, maxResults) {
  const endpoint = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(formattedQuery)}&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
  
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`ArXiv API Error: ${response.statusText}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  
  const papers = [];
  
  $("entry").each((_, element) => {
    const entry = $(element);
    
    const id = entry.find("id").text().trim();
    const title = entry.find("title").text().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    const summary = entry.find("summary").text().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    const published = entry.find("published").text().trim();
    
    const authors = [];
    entry.find("author").each((_, authorElem) => {
      authors.push($(authorElem).find("name").text().trim());
    });
    
    // Get links
    const pdfLink = entry.find("link[title='pdf']").attr("href") || 
                    entry.find("link[type='application/pdf']").attr("href") || 
                    "";
    const infoLink = entry.find("link[rel='alternate']").attr("href") || id;
    
    // Primary category
    const primaryCategory = entry.find("primary_category").attr("term") || 
                             entry.find("arxiv\\:primary_category").attr("term") || 
                             "";
    
    papers.push({
      id: id.split("/abs/").pop() || id,
      title: title,
      summary: summary,
      authors: authors.join(", "),
      publishedDate: published ? new Date(published).toISOString().split('T')[0] : "",
      pdfLink: pdfLink,
      infoLink: infoLink,
      category: primaryCategory
    });
  });
  
  return papers;
}

/**
 * Fetch new papers from the arXiv API and return them as structured JSON objects.
 * Uses a robust multi-stage fallback search for high-relevance query matching.
 * @param {string} query - The search query (e.g., 'all:electron' or 'cat:cs.AI')
 * @param {number} maxResults - Max number of papers to return (default 10)
 */
export async function searchArxiv(query, maxResults = 10) {
  try {
    let words = [];
    let formattedQuery = query;
    
    if (!query.includes(':') && !query.includes('AND') && !query.includes('OR')) {
      const stopWords = new Set([
        'and', 'or', 'the', 'on', 'from', 'in', 'of', 'a', 'an', 'with', 'to', 'for', 'about',
        'latest', 'top', 'papers', 'paper', 'research', 'academic', 'articles', 'article',
        'find', 'get', 'pull', 'search', 'seek'
      ]);

      words = query
        .replace(/[^\w\s-]/g, '') // remove punctuation
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 0 && !stopWords.has(w.toLowerCase()));

      if (words.length > 0) {
        formattedQuery = words.map(w => `all:${w}`).join(' AND ');
      } else {
        formattedQuery = `all:${query}`;
      }
    } else if (!query.includes(':')) {
      formattedQuery = `all:${query}`;
    }

    // Stage 1: Strict AND search
    let papers = await fetchFromArxiv(formattedQuery, maxResults);

    // Stage 2: Relaxed search (remove very common words to match specific keywords)
    if (papers.length < maxResults && words.length > 2) {
      const commonWords = new Set(['generative', 'ai', 'reasoning', 'large', 'language', 'model', 'models', 'machine', 'learning', 'deep', 'neural', 'networks', 'network']);
      const specificWords = words.filter(w => !commonWords.has(w.toLowerCase()));
      if (specificWords.length > 0 && specificWords.length < words.length) {
        const relaxedQuery = specificWords.map(w => `all:${w}`).join(' AND ');
        const extraPapers = await fetchFromArxiv(relaxedQuery, maxResults - papers.length);
        for (const p of extraPapers) {
          if (!papers.some(existing => existing.id === p.id)) {
            papers.push(p);
          }
        }
      }
    }

    // Stage 3: Fallback search (match any term)
    if (papers.length < maxResults) {
      const fallbackQuery = `all:${query}`;
      const extraPapers = await fetchFromArxiv(fallbackQuery, maxResults - papers.length);
      for (const p of extraPapers) {
        if (!papers.some(existing => existing.id === p.id)) {
          papers.push(p);
        }
      }
    }

    return papers;
  } catch (error) {
    console.error("arXiv Search failed:", error);
    throw error;
  }
}
