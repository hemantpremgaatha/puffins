/**
 * TinyTfidf — a small, dependency-free unsupervised text-retrieval engine.
 *
 * This is genuine unsupervised learning (not a hosted LLM, not a trained
 * RNN/LSTM): it "fits" on a corpus of documents with no labels at all, using
 * classic TF-IDF (term frequency - inverse document frequency) vectorization,
 * then answers a free-text query by cosine-similarity nearest-neighbour
 * search over that vector space. That's the standard unsupervised technique
 * behind search engines and document retrieval before neural embeddings.
 *
 * Why not an LSTM/RNN here: this is a static, no-build, no-backend site
 * (see site/README.md). A sequence model needs either (a) a server to train
 * and host it, or (b) a large, honest text corpus to train on in-browser —
 * neither exists here, and a neural net trained on a few dozen hand-written
 * facts would just memorize and regurgitate them poorly (or hallucinate
 * between them) instead of doing plain retrieval well. TF-IDF retrieval over
 * a curated corpus gives reliable, on-topic answers with zero infrastructure,
 * which is what a small food brand's site actually needs. If a real backend
 * ever exists for this site, this is the piece to swap for a hosted-LLM or
 * embedding-based semantic search — see initAssistant() in main.js for
 * where the answer gets used.
 *
 * Usage:
 *   var engine = new TinyTfidf();
 *   engine.fit(["doc one text", "doc two text", ...]);   // unsupervised fit
 *   var hits = engine.query("some question", 3);          // top-3 matches
 *   // hits: [{ index: 0, score: 0.42 }, ...] sorted best-first
 */
(function (global) {
  "use strict";

  var STOPWORDS = (
    "a an the is are was were be been being do does did doing have has had " +
    "having i you he she it we they me him her us them my your his its our " +
    "their this that these those and or but if then so of in on at to from " +
    "for with without into over under again further as by about above below " +
    "up down out off can could shall should will would may might must not " +
    "no nor than too very just what which who whom when where why how all " +
    "any both each few more most other some such only own same good better " +
    "best bad well really actually nice great okay fine"
  ).split(" ").reduce(function (set, w) { set[w] = true; return set; }, {});

  /* Crude suffix-stripping so "puffing"/"puffed"/"puff" (or "grains"/"grain")
     land on the same term instead of missing each other entirely — a real
     stemmer (Porter etc.) would be overkill for a corpus this small. */
  function stem(word) {
    if (word.length > 5 && word.slice(-3) === "ing") word = word.slice(0, -3);
    else if (word.length > 4 && word.slice(-2) === "ed") word = word.slice(0, -2);
    if (word.length > 3 && word.slice(-1) === "s" && word.slice(-2) !== "ss") word = word.slice(0, -1);
    return word;
  }

  function tokenize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) { return w.length > 1 && !STOPWORDS[w]; })
      .map(stem);
  }

  function termCounts(tokens) {
    var counts = {};
    tokens.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    return counts;
  }

  function magnitude(vec) {
    var sum = 0;
    for (var k in vec) { if (vec.hasOwnProperty(k)) sum += vec[k] * vec[k]; }
    return Math.sqrt(sum);
  }

  function dot(a, b) {
    var sum = 0;
    var small = Object.keys(a).length < Object.keys(b).length ? a : b;
    var big = small === a ? b : a;
    for (var k in small) {
      if (small.hasOwnProperty(k) && big.hasOwnProperty(k)) sum += small[k] * big[k];
    }
    return sum;
  }

  function TinyTfidf() {
    this.docFreq = {};      // term -> number of docs containing it
    this.docCount = 0;
    this.vectors = [];      // per-doc TF-IDF vectors
    this.norms = [];        // per-doc vector magnitude, precomputed
  }

  /** Unsupervised fit: learn document-frequency statistics from raw text, no labels. */
  TinyTfidf.prototype.fit = function (docs) {
    var self = this;
    var docTokens = docs.map(tokenize);
    self.docCount = docs.length;
    self.docFreq = {};

    docTokens.forEach(function (tokens) {
      var seen = {};
      tokens.forEach(function (t) {
        if (!seen[t]) { seen[t] = true; self.docFreq[t] = (self.docFreq[t] || 0) + 1; }
      });
    });

    self.vectors = docTokens.map(function (tokens) {
      var tf = termCounts(tokens);
      var vec = {};
      for (var term in tf) {
        if (tf.hasOwnProperty(term)) {
          var idf = Math.log((1 + self.docCount) / (1 + self.docFreq[term])) + 1;
          vec[term] = tf[term] * idf;
        }
      }
      return vec;
    });
    self.norms = self.vectors.map(magnitude);
    return self;
  };

  /** Vectorize a query using the already-learned document-frequency stats. */
  TinyTfidf.prototype._vectorizeQuery = function (text) {
    var self = this;
    var tf = termCounts(tokenize(text));
    var vec = {};
    for (var term in tf) {
      if (tf.hasOwnProperty(term) && self.docFreq.hasOwnProperty(term)) {
        var idf = Math.log((1 + self.docCount) / (1 + self.docFreq[term])) + 1;
        vec[term] = tf[term] * idf;
      }
    }
    return vec;
  };

  /** Returns top-N {index, score} matches, best (highest cosine similarity) first. */
  TinyTfidf.prototype.query = function (text, topN) {
    var self = this;
    var qVec = self._vectorizeQuery(text);
    var qNorm = magnitude(qVec);
    if (qNorm === 0) return [];

    var scores = self.vectors.map(function (docVec, i) {
      var denom = qNorm * self.norms[i];
      var score = denom === 0 ? 0 : dot(qVec, docVec) / denom;
      return { index: i, score: score };
    });
    scores.sort(function (a, b) { return b.score - a.score; });
    return scores.slice(0, topN || 1);
  };

  global.TinyTfidf = TinyTfidf;
})(window);
