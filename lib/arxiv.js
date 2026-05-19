import * as cheerio from "cheerio";

/**
 * Fetch new papers from the arXiv API and return them as structured JSON objects.
 * @param {string} query - The search query (e.g., 'all:electron' or 'cat:cs.AI')
 * @param {number} maxResults - Max number of papers to return (default 10)
 */
export async function searchArxiv(query, maxResults = 10) {
  // If query doesn't specify a field prefix, default to 'all:'
  let formattedQuery = query;
  if (!query.includes(':')) {
    formattedQuery = `all:${query}`;
  }

  const endpoint = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(formattedQuery)}&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

  try {
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
  } catch (error) {
    console.error("arXiv Search failed:", error);
    throw error;
  }
}
