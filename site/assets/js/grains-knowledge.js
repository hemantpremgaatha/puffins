/**
 * General-knowledge corpus for the "Puff" chat assistant — food grains,
 * rice cakes as a category, and the health benefits of snacking smart.
 *
 * Unlike assistant-data.js (Puffins-brand/product facts, some withheld until
 * SIF confirms a regulated figure), everything here is generic, widely
 * accepted nutrition education — not a claim about this product specifically,
 * and not medical advice. Keep entries hedged ("may", "generally", "as part
 * of a balanced diet") and don't add disease-cure or medical-treatment
 * claims; if in doubt, leave it out rather than overstate it.
 *
 * Retrieval, not rules: main.js feeds `match` (a bag of phrasings/keywords)
 * into TinyTfidf (assets/js/tfidf-search.js) as one unsupervised-learning
 * corpus, so a free-text question doesn't need to hit an exact keyword —
 * see queryGrainsKnowledge() in main.js.
 */
window.PUFFINS_GRAINS_KNOWLEDGE = [
  {
    id: "what-are-whole-grains",
    match: "what are whole grains definition bran germ endosperm intact grain kernel",
    answer: "A whole grain keeps all three original parts of the kernel — the fibre-rich bran, the nutrient-packed germ, and the starchy endosperm — instead of stripping them away. That's what separates it from a refined grain."
  },
  {
    id: "whole-vs-refined",
    match: "whole grain vs refined grain difference white rice brown rice processed milled",
    answer: "Refining a grain removes the bran and germ for a softer texture and longer shelf life, but it also strips out most of the fibre, B vitamins, and minerals. Whole grains keep that intact, which is generally why they digest more slowly and keep you fuller for longer."
  },
  {
    id: "why-brown-rice",
    match: "why brown rice healthier than white rice benefits fiber nutrients",
    answer: "Brown rice is the whole-grain version of rice — only the inedible outer husk is removed, so the bran and germ stay in. That gives it more fibre, magnesium, and B vitamins than white rice, which has both the bran and germ milled away."
  },
  {
    id: "gluten-free-grains",
    match: "gluten free grains list rice millet quinoa oats sorghum celiac wheat",
    answer: "Rice, millet, quinoa, sorghum (jowar), and pearl millet (bajra) are naturally gluten-free grains. Oats are naturally gluten-free too, but can pick up cross-contamination during processing, so look for a certified gluten-free label if that matters to you."
  },
  {
    id: "fiber-in-grains",
    match: "fiber fibre whole grains digestion gut health benefits how much",
    answer: "Whole grains are one of the easiest everyday ways to get dietary fibre, which supports digestion and helps you feel fuller after eating. Most people don't hit the recommended daily fibre intake, so swapping a refined-grain snack for a whole-grain one is a simple upgrade."
  },
  {
    id: "millets-ancient-grains",
    match: "millets ancient grains jowar bajra ragi nutrition india traditional",
    answer: "Millets like jowar, bajra, and ragi are ancient grains that have been staples in Indian diets for centuries. They're naturally gluten-free, fibre-rich, and generally need less water to grow than rice or wheat, which is part of why they're having a comeback."
  },
  {
    id: "grains-energy-carbs",
    match: "grains carbohydrates energy source complex carbs fuel body",
    answer: "Grains are mainly a complex-carbohydrate food, which your body breaks down for energy. Whole grains release that energy more gradually than refined ones because the fibre slows digestion down."
  },
  {
    id: "what-is-a-rice-cake",
    match: "what is a rice cake generic snack puffed grain disc how invented",
    answer: "A rice cake is rice that's been puffed under heat and pressure until it expands and fuses into a light, crunchy disc — no oil, no frying, no batter. It's essentially just the grain, puffed."
  },
  {
    id: "how-puffing-works",
    match: "how is rice puffed process heat pressure expand grain science",
    answer: "Puffing works by heating grain under pressure until the moisture inside turns to steam. When the pressure is released, that steam expands almost instantly, blowing the grain up into a light, airy structure — the same basic idea behind puffed rice and popcorn."
  },
  {
    id: "rice-cakes-vs-fried-snacks",
    match: "rice cakes vs chips fried snacks calories oil difference healthier",
    answer: "Because rice cakes are puffed rather than fried, they generally use no added oil, which typically means fewer calories from fat compared to a deep-fried chip of the same size — a useful swap if you're watching oil intake without giving up crunch."
  },
  {
    id: "rice-cakes-weight-management",
    match: "rice cakes weight loss diet portion low calorie snack",
    answer: "Rice cakes are often reached for in weight-conscious diets because they're light and low in calories per piece compared to many fried snacks — though how filling they feel varies a lot from person to person, so pairing one with a source of protein or fibre (like a spread or fruit) usually helps more than eating it alone."
  },
  {
    id: "rice-cakes-gluten-free-generic",
    match: "are rice cakes gluten free generic celiac safe",
    answer: "Plain rice cakes made from rice alone are naturally gluten-free, since rice doesn't contain gluten. Always check the specific product's label though — some flavoured or mixed-grain rice cakes add wheat-based ingredients."
  },
  {
    id: "rice-cakes-history",
    match: "history of rice cakes origin where invented asia snack",
    answer: "Puffed rice snacks have roots across Asia going back generations — puffed rice itself is an ancient technique. The modern packaged \"rice cake\" as a light, wafer-style snack became popular in the West from the mid-20th century onward as a low-fat alternative to fried snacks."
  },
  {
    id: "why-snack-smart",
    match: "benefits healthy snacking why choose better snacks good snacks",
    answer: "Snacking itself isn't the problem — what you snack on is. Choosing a whole-grain or fibre-rich snack over a deep-fried or heavily sugared one generally means steadier energy, less of a sugar spike, and more nutrients for the same handful of food."
  },
  {
    id: "snacking-blood-sugar",
    match: "snacking blood sugar spike sugar crash glycemic",
    answer: "Snacks high in refined sugar or fried starch tend to spike blood sugar quickly, followed by a crash that leaves you hungry again soon after. Fibre-rich, whole-grain snacks digest more slowly, which generally means a gentler, steadier energy curve. This is general nutrition education, not medical advice — talk to a doctor or dietitian for guidance specific to you."
  },
  {
    id: "snacking-vs-skipping-meals",
    match: "snacking vs skipping meals hungry overeating portion control",
    answer: "A planned, healthy snack between meals can actually help prevent the overeating that often happens when you show up to your next meal too hungry. The key word is planned — mindless snacking on whatever's closest is where it tends to go sideways."
  },
  {
    id: "healthy-snack-checklist",
    match: "what to look for healthy snack label ingredients checklist",
    answer: "A quick checklist for a healthier snack: short ingredient list, whole grain or whole food as the first ingredient, no partially hydrogenated oils, and no added sugar sitting in the first few ingredients. Puffed, baked, or roasted generally beats deep-fried."
  },
  {
    id: "snacking-kids",
    match: "healthy snacks for kids children school lunch tiffin",
    answer: "Kids often need snacks between meals simply because their stomachs are smaller and they burn through energy fast. Whole-grain, low-oil snacks are an easy way to keep that energy steady through the school day without leaning on sugary packaged options."
  },
  {
    id: "protein-in-grains",
    match: "protein in grains quinoa which grain highest protein",
    answer: "Most grains are carbohydrate-first foods, but some — quinoa in particular — carry a meaningfully higher protein content than rice or wheat, and quinoa is also one of the few plant proteins considered \"complete\" (it has all nine essential amino acids)."
  },
  {
    id: "portion-control-snacks",
    match: "portion control snacking how much is too much serving size",
    answer: "Even a healthy snack adds up if the portion isn't sized — a pre-portioned sleeve or a small bowl rather than eating straight from a family-size bag is the simplest way to keep a good snack from turning into an accidental extra meal."
  }
];
