/**
 * Editable product/content data, loaded as a plain script so pages work
 * with or without a web server (no fetch()/CORS dependency on file://).
 * Mirrors assets/data/products.json — update both together, or swap this
 * for a real CMS/API call later without touching page markup.
 */
window.PUFFINS_PRODUCTS = {
  "products": [
    {
      "id": "rice-cakes",
      "name": "Puffins Rice Cakes",
      "slug": "rice-cakes",
      "shortDescription": "Baked, not fried. Light, crunchy rice cakes that beg to be topped — banana and peanut butter, avocado, or straight from the pack.",
      "format": "Cylindrical tube pack",
      "heroImage": "assets/img/brand/packshot-sea-salt.jpg",
      "galleryImages": [
        "assets/img/brand/packshot-sea-salt.jpg",
        "assets/img/brand/plain-rice-cakes.webp",
        "assets/img/brand/topped-four-ways.webp",
        "assets/img/brand/lifestyle-topped-egg-prosciutto.jpg"
      ],
      "status": "available",
      "flavors": [
        { "name": "Sea Salt", "status": "available", "swatch": "#0F2740" },
        { "name": "Unsalted", "status": "coming-soon", "swatch": "#c9b98c" },
        { "name": "Flavour 3", "status": "coming-soon", "swatch": "#FF8A00" },
        { "name": "Flavour 4", "status": "coming-soon", "swatch": "#17b3a3" },
        { "name": "Flavour 5", "status": "coming-soon", "swatch": "#d6389a" }
      ],
      "packSize": { "value": "8 cakes per sleeve, 6 g each (48 g net)", "confirmed": true },
      "price": { "amount": null, "currency": "INR", "confirmed": false, "note": "Pricing to be confirmed by SIF before checkout goes live." },
      "attributes": ["Baked, not fried", "Gluten free", "100% vegetarian", "No added preservatives"],
      "attributesConfirmed": false,
      "ingredients": { "text": "Rice — that's it. Whole grains are pressed at 200°C; the pressure drop expands the grain and binds it to itself. No syrup, no oil, no flour, nothing else added.", "confirmed": true },
      "allergens": { "text": null, "confirmed": false },
      "nutrition": { "perServing": null, "confirmed": false },
      "shelfLife": { "text": null, "confirmed": false },
      "storage": { "text": "Store in a cool, dry place. Reseal after opening to keep the crunch.", "confirmed": false },
      "faqs": [
        { "q": "Are Puffins Rice Cakes baked or fried?", "a": "Baked, not fried — that's how we keep them light without losing crunch." },
        { "q": "Are they gluten free?", "a": "Yes, made from puffed rice. Final allergen statement will be published once SIF confirms manufacturing details." },
        { "q": "How should I store them?", "a": "Keep the pack sealed in a cool, dry place, and reseal it after opening to keep every cake crunchy." }
      ]
    },
    {
      "id": "rice-chips",
      "name": "Puffins Rice Chips",
      "slug": "rice-chips",
      "shortDescription": "Thin, crispy puffed-rice chips in a sealed bag — the snackier bite you'll reach for on repeat.",
      "format": "Sealed bag",
      "heroImage": "assets/img/brand/topped-four-ways.webp",
      "galleryImages": [
        "assets/img/brand/topped-four-ways.webp",
        "assets/img/brand/plain-rice-cakes.webp"
      ],
      "status": "coming-soon",
      "flavors": [
        { "name": "Flavour 1", "status": "coming-soon", "swatch": "#FF8A00" },
        { "name": "Flavour 2", "status": "coming-soon", "swatch": "#FFC257" },
        { "name": "Flavour 3", "status": "coming-soon", "swatch": "#17b3a3" }
      ],
      "packSize": { "value": null, "confirmed": false },
      "price": { "amount": null, "currency": "INR", "confirmed": false, "note": "Pricing to be confirmed by SIF." },
      "attributes": ["Baked, not fried", "Gluten free", "100% vegetarian"],
      "attributesConfirmed": false,
      "ingredients": { "text": null, "confirmed": false },
      "allergens": { "text": null, "confirmed": false },
      "nutrition": { "perServing": null, "confirmed": false },
      "shelfLife": { "text": null, "confirmed": false },
      "storage": { "text": "Store in a cool, dry place.", "confirmed": false },
      "faqs": [
        { "q": "When will Rice Chips launch?", "a": "Rice Chips are next on our roadmap. Join the list on our Contact page and we'll let you know the moment they're available." }
      ]
    }
  ]
};
