/**
 * Editable knowledge base for the "Puff" chat assistant (assets/js/main.js →
 * initAssistant()). Product facts (ingredients, pack size, flavours, FAQs)
 * live in products-data.js and are read live from window.PUFFINS_PRODUCTS —
 * do not duplicate them here. This file only holds general business/brand
 * Q&A sourced from the Developer Handoff brief. Per section 19 of that brief,
 * anything regulated (nutrition numbers, allergens, shelf life, pricing,
 * FSSAI, shipping/returns promises) must stay as an honest "not published
 * yet" answer until SIF confirms it — never invent a figure here.
 *
 * General (non-brand-specific) education on food grains, rice cakes as a
 * category, and healthy snacking lives separately in grains-knowledge.js,
 * searched via unsupervised TF-IDF retrieval (tfidf-search.js) rather than
 * this file's exact keyword rules — see initAssistant() in main.js.
 */
window.PUFFINS_ASSISTANT = {
  greeting: "Hey, I'm Puff! Ask me about our ingredients, how Puffins are made, the story behind the brand — or anything general about grains, rice cakes, or healthy snacking.",
  quickReplies: [
    { label: "What's in a Rice Cake?", topic: "ingredients" },
    { label: "How are they made?", topic: "method" },
    { label: "The founder's story", topic: "story" },
    { label: "Is it gluten free?", topic: "allergens" },
    { label: "When do Rice Chips launch?", topic: "chips" },
    { label: "Why are whole grains healthy?", query: "why are whole grains healthy" },
    { label: "Benefits of healthy snacking", query: "benefits of healthy snacking" },
    { label: "Contact us", topic: "contact" }
  ],
  topics: [
    {
      id: "method",
      keywords: ["method", "how is it made", "how are they made", "process", "how do you make", "puffed or fried", "fried"],
      answer: "Whole grains go into the press at 200°C. Pressure drops, the grain expands and binds to itself — no syrup, no oil, no flour. That's how we get the crunch without frying."
    },
    {
      id: "story",
      keywords: ["founder", "story", "who started", "ceo", "origin", "parth", "samarthya", "sif", "company", "about you", "who are you", "who makes"],
      answer: "Puffins is made by Samarthya Innovative Foods Pvt. Ltd. (SIF), based in Jaipur, Rajasthan. Founder & CEO Parthsarthi Pokra puts it simply: “Rice had always been a part of my world. I just hadn't thought of it as a snack.” Read the full story on our Our Story page."
    },
    {
      id: "location",
      keywords: ["where are you based", "location", "jaipur", "address", "from where", "which country", "based in"],
      answer: "We're based in Jaipur, Rajasthan, India, and currently focused on the Indian market."
    },
    {
      id: "allergens",
      keywords: ["gluten", "allergen", "allergy", "celiac", "wheat", "vegetarian", "vegan"],
      answer: "Rice Cakes are made from puffed rice — 100% vegetarian, and we're finalizing the official allergen statement with our manufacturing team before we publish it as a formal label claim. Check the Ingredients & Allergens tab on the product page for the latest, or ask us via Contact."
    },
    {
      id: "nutrition",
      keywords: ["nutrition", "calorie", "protein", "carbs", "fat content", "sugar", "how healthy", "kcal"],
      answer: "Our nutrition panel is being lab-verified before we publish exact numbers — we'd rather get it right than guess. It'll appear on the product page's Nutrition tab as soon as it's approved."
    },
    {
      id: "price",
      keywords: ["price", "cost", "mrp", "how much", "buy now", "purchase", "checkout"],
      answer: "Pricing is being finalized and online ordering isn't live yet. Head to the Shop page to see what's coming, or leave your details on Contact and we'll let you know the moment it opens."
    },
    {
      id: "chips",
      keywords: ["rice chips", "chips", "next product", "new flavour", "when will", "launch date"],
      answer: "Rice Chips — our thin, crispy bag format — are next on the roadmap. Join the list on our Contact page and we'll tell you the moment they launch."
    },
    {
      id: "contact",
      keywords: ["contact", "email", "phone", "reach you", "support", "get in touch", "talk to someone", "retailer", "distributor", "partnership", "wholesale"],
      answer: "Best way to reach us is the Contact page — pick Consumer or Retailer/Distributor enquiry and we'll route it to the right person."
    },
    {
      id: "shelf",
      keywords: ["shelf life", "expiry", "best before", "how long does it last", "storage", "store it", "keep fresh"],
      answer: "Store the pack in a cool, dry place and reseal it after opening to keep the crunch. We're finalizing the exact shelf-life period for the label — it'll show up on the product page once confirmed."
    },
    {
      id: "flavours",
      keywords: ["flavour", "flavor", "sea salt", "taste like", "variants", "which flavours"],
      answer: "Sea Salt is available today. A few more flavours are coming soon — final names are still being confirmed. Check the Shop page for the latest lineup."
    },
    {
      id: "shipping",
      keywords: ["shipping", "delivery", "return policy", "refund", "ship to", "courier"],
      answer: "Shipping and returns details will be published once online ordering goes live and SIF confirms the policy — for now, see the Shipping & Returns page for what's already settled, or ask on Contact."
    }
  ],
  fallback: "I don't have a confirmed answer for that yet — try the FAQ page, or reach us directly via Contact and we'll get back to you."
};
