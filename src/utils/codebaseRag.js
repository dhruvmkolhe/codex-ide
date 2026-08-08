/**
 * CodeX Codebase-Wide RAG (Retrieval-Augmented Generation) Engine
 *
 * Embeds and indexes multi-file workspace code chunks into a local vector similarity index.
 * Allows AI completion and chat models to search relevant codebase context across all files.
 */

class CodebaseRagEngine {
  constructor() {
    this.chunks = []; // Array of { fileName, lineStart, lineEnd, content, vector }
  }

  /**
   * Tokenizes text into normalized term frequencies
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  /**
   * Compute TF-IDF frequency vector map for a text block
   */
  computeVector(text) {
    const tokens = this.tokenize(text);
    const vector = new Map();
    const total = tokens.length || 1;

    for (const token of tokens) {
      vector.set(token, (vector.get(token) || 0) + 1 / total);
    }
    return vector;
  }

  /**
   * Calculate Cosine Similarity between two term frequency vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, freqA] of vecA.entries()) {
      normA += freqA * freqA;
      if (vecB.has(term)) {
        dotProduct += freqA * vecB.get(term);
      }
    }

    for (const [, freqB] of vecB.entries()) {
      normB += freqB * freqB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Index all workspace files into searchable 20-line overlapping chunks
   */
  indexFiles(files) {
    this.chunks = [];
    if (!files || !Array.isArray(files)) return;

    for (const file of files) {
      if (!file.name || !file.content) continue;

      const lines = file.content.split('\n');
      const chunkSize = 20;
      const overlap = 5;

      for (let i = 0; i < lines.length; i += chunkSize - overlap) {
        const chunkLines = lines.slice(i, i + chunkSize);
        const chunkText = chunkLines.join('\n').trim();

        if (chunkText.length > 20) {
          this.chunks.push({
            fileName: file.name,
            lineStart: i + 1,
            lineEnd: i + chunkLines.length,
            content: chunkText,
            vector: this.computeVector(chunkText),
          });
        }
      }
    }
  }

  /**
   * Search workspace index for top K most relevant chunks matching the query
   */
  search(query, topK = 3) {
    if (!query || this.chunks.length === 0) return [];

    const queryVector = this.computeVector(query);
    const scored = [];

    for (const chunk of this.chunks) {
      const score = this.cosineSimilarity(queryVector, chunk.vector);
      if (score > 0.05) {
        scored.push({ ...chunk, score });
      }
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Generate RAG context block formatted for LLM system prompts
   */
  generateRagContext(query, topK = 3) {
    const matches = this.search(query, topK);
    if (matches.length === 0) return '';

    const formatted = matches
      .map(
        (m) =>
          `--- File: ${m.fileName} (Lines ${m.lineStart}-${m.lineEnd}, Similarity: ${(m.score * 100).toFixed(1)}%) ---\n${m.content}`
      )
      .join('\n\n');

    return `\n\n=== Codebase RAG Relevant Context ===\n${formatted}\n===============================\n`;
  }
}

export const codebaseRag = new CodebaseRagEngine();
