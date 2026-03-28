# SEO Import File — Ryan Owen Photography (New Site)
**Prepared:** 2026-03-28
**Domain:** https://www.ryanowenphotography.com
**Format:** Copy-paste `<head>` blocks for each page + JSON-LD schema

---

## HOW TO USE THIS FILE

1. Open each `.html` file in `/site/`
2. Find the existing `<head>` section
3. Replace or supplement the existing title/meta with the block provided below for that page
4. The JSON-LD blocks go just before `</head>` or just before `</body>` — either works

> **OG Image note:** Each page references `/site/images/og-image.jpg` as the social share image.
> This should be a 1200×630px horizontal photo (a strong hero shot works well).
> You can use a different image per page for best results — just update the `og:image` URL.

---

## GLOBAL NOTES (applies to every page)

**Business Info used in all schema:**
- Name: Ryan Owen Photography / Ryan Owen Media Inc.
- Address: 7805 Coastal Highway, Ocean City, MD 21842
- Phone: 240-401-8385
- Email: ryan@ryanowenphotography.com
- Hours: Open daily, by appointment
- Instagram: https://www.instagram.com/ryanowenphotography
- Facebook: https://www.facebook.com/ryanowenphotography

**Rating used in schema (from old site):** 5 stars / 9 reviews
> Update the `ratingCount` and `ratingValue` as you collect more reviews.

---
---

## 1. HOMEPAGE — `site/index.html`

```html
<!-- ===== SEO HEAD BLOCK — HOMEPAGE ===== -->
<title>Real Estate Photographer | Ocean City, MD | Ryan Owen Photography</title>
<meta name="description" content="Award-winning real estate photographer serving Ocean City MD and the Eastern Shore for 30+ years. Drone, twilight, video, virtual tours. FAA-certified. Book online." />
<meta name="keywords" content="real estate photographer Ocean City MD, Eastern Shore photographer, drone photography Maryland, twilight photography, real estate video, virtual tours Maryland" />
<link rel="canonical" href="https://www.ryanowenphotography.com/" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Ryan Owen Photography | Best Real Estate Photographer on the Eastern Shore" />
<meta property="og:description" content="30+ years shooting the Eastern Shore. Vibrant, composite real estate photography, drone, twilight, video, and virtual tours. Ocean City, MD." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/" />
<meta property="og:site_name" content="Ryan Owen Photography" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Ryan Owen Photography | Real Estate Photographer | Ocean City, MD" />
<meta name="twitter:description" content="30+ years shooting the Eastern Shore. Real estate photography, drone, twilight, video, and virtual tours." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.ryanowenphotography.com/#business",
      "name": "Ryan Owen Photography",
      "legalName": "Ryan Owen Media Inc.",
      "url": "https://www.ryanowenphotography.com",
      "logo": "https://www.ryanowenphotography.com/site/images/ROP-Logo-New.png",
      "image": "https://www.ryanowenphotography.com/site/images/og-image.jpg",
      "description": "Professional real estate photographer serving Ocean City MD and the Eastern Shore for over 30 years. Specializing in real estate photography, drone photography, twilight photography, video, and virtual tours.",
      "telephone": "+12404018385",
      "email": "ryan@ryanowenphotography.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "7805 Coastal Highway",
        "addressLocality": "Ocean City",
        "addressRegion": "MD",
        "postalCode": "21842",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 38.3957,
        "longitude": -75.0650
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      },
      "areaServed": [
        "Ocean City, MD",
        "Ocean Pines, MD",
        "Berlin, MD",
        "Bethany Beach, DE",
        "Fenwick Island, DE",
        "Rehoboth Beach, DE",
        "Lewes, DE",
        "Eastern Shore Maryland",
        "Eastern Shore Delaware"
      ],
      "priceRange": "$$",
      "sameAs": [
        "https://www.instagram.com/ryanowenphotography",
        "https://www.facebook.com/ryanowenphotography"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "reviewCount": "9",
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    {
      "@type": "Person",
      "@id": "https://www.ryanowenphotography.com/#ryan",
      "name": "Ryan Owen",
      "jobTitle": "Professional Photographer",
      "worksFor": { "@id": "https://www.ryanowenphotography.com/#business" },
      "alumniOf": "Brooks Institute of Photography",
      "knowsAbout": [
        "Real estate photography",
        "Drone photography",
        "Aerial photography",
        "Twilight photography",
        "Real estate videography",
        "Virtual tours",
        "Fine art photography",
        "Food photography",
        "Eastern Shore Maryland photography"
      ],
      "hasCredential": "FAA Part 107 Certified Drone Operator",
      "url": "https://www.ryanowenphotography.com/site/about.html",
      "image": "https://www.ryanowenphotography.com/site/images/ryan-owen-headshot.jpg",
      "sameAs": [
        "https://www.instagram.com/ryanowenphotography",
        "https://www.facebook.com/ryanowenphotography"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.ryanowenphotography.com/#website",
      "url": "https://www.ryanowenphotography.com",
      "name": "Ryan Owen Photography",
      "description": "Professional real estate photography, drone, twilight, video, and virtual tours on the Eastern Shore.",
      "publisher": { "@id": "https://www.ryanowenphotography.com/#business" }
    }
  ]
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 2. SERVICES — `site/services.html`

```html
<!-- ===== SEO HEAD BLOCK — SERVICES ===== -->
<title>Real Estate Photography Services | Drone, Twilight, Video, Virtual Tours | Ryan Owen Photography</title>
<meta name="description" content="Real estate photography, drone photography, twilight shoots, video walkthroughs, and Zillow virtual tours. Serving Ocean City MD and the Eastern Shore. View packages and pricing." />
<meta name="keywords" content="real estate photography services, drone photography Maryland, twilight photography Ocean City, real estate video Eastern Shore, Zillow virtual tour, photography packages Maryland" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/services.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Photography Services | Real Estate, Drone, Twilight & Video — Ryan Owen Photography" />
<meta property="og:description" content="Full-service real estate media: photography, drone, twilight, video walkthroughs, and virtual tours. Ocean City, MD." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/services.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Photography Services | Ryan Owen Photography" />
<meta name="twitter:description" content="Real estate photography, drone, twilight, video, and virtual tours. Ocean City, MD and Eastern Shore." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Ryan Owen Photography Services",
  "description": "Professional photography and media services for real estate on the Eastern Shore of Maryland and Delaware.",
  "url": "https://www.ryanowenphotography.com/site/services.html",
  "provider": { "@id": "https://www.ryanowenphotography.com/#business" },
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "Real Estate Photography",
        "description": "Professional interior and exterior real estate photography using HDR and composite techniques. Vibrant, true-to-life images that sell homes faster.",
        "provider": { "@id": "https://www.ryanowenphotography.com/#business" },
        "areaServed": "Eastern Shore MD and DE",
        "url": "https://www.ryanowenphotography.com/site/services.html"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Service",
        "name": "Drone Photography & Videography",
        "description": "FAA Part 107 certified aerial drone photography and video for real estate listings. Unique perspectives that showcase properties and their surroundings.",
        "provider": { "@id": "https://www.ryanowenphotography.com/#business" },
        "areaServed": "Eastern Shore MD and DE"
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Service",
        "name": "Twilight Photography",
        "description": "Stunning dusk and twilight exterior shots that make listings stand out. Warm interior light against a blue evening sky creates irresistible curb appeal.",
        "provider": { "@id": "https://www.ryanowenphotography.com/#business" },
        "areaServed": "Eastern Shore MD and DE"
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "Service",
        "name": "Real Estate Video",
        "description": "Professional video walkthroughs, promotional videos, and social media reels for real estate listings.",
        "provider": { "@id": "https://www.ryanowenphotography.com/#business" },
        "areaServed": "Eastern Shore MD and DE"
      }
    },
    {
      "@type": "ListItem",
      "position": 5,
      "item": {
        "@type": "Service",
        "name": "Zillow Virtual Tours / 360° Tours",
        "description": "Interactive 360-degree virtual tours compatible with Zillow and MLS listings. Let buyers walk the property before scheduling a showing.",
        "provider": { "@id": "https://www.ryanowenphotography.com/#business" },
        "areaServed": "Eastern Shore MD and DE"
      }
    }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What areas does Ryan Owen Photography serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ryan Owen Photography serves Ocean City MD, Berlin MD, Ocean Pines MD, Bethany Beach DE, Fenwick Island DE, Rehoboth Beach DE, Lewes DE, and the broader Eastern Shore of Maryland and Delaware."
      }
    },
    {
      "@type": "Question",
      "name": "How do I book a real estate photography session?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can book online using the Photography Request Form at ryanowenphotography.com, or call Ryan directly at 240-401-8385. You'll receive a price estimate immediately after submitting the form."
      }
    },
    {
      "@type": "Question",
      "name": "Is Ryan Owen Photography FAA certified for drone photography?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Ryan Owen holds an FAA Part 107 Remote Pilot Certificate, which is required for commercial drone photography. All aerial shoots are conducted legally and safely."
      }
    },
    {
      "@type": "Question",
      "name": "What is the turnaround time for real estate photos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Edited photos are typically delivered within 24–48 hours of the shoot. Rush delivery options may be available — contact Ryan for details."
      }
    },
    {
      "@type": "Question",
      "name": "Does Ryan Owen Photography offer packages for real estate agents?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Photography packages are available combining standard photography, drone, twilight, video, and virtual tours. Pricing is based on property size and services selected."
      }
    }
  ]
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 3. ABOUT — `site/about.html`

```html
<!-- ===== SEO HEAD BLOCK — ABOUT ===== -->
<title>About Ryan Owen | 30-Year Eastern Shore Photographer | Ocean City, MD</title>
<meta name="description" content="Ryan Owen is a Brooks Institute-trained, FAA-certified photographer with 30+ years shooting the Eastern Shore. Based in Ocean City, MD. Real estate, drone, fine art, and food photography." />
<meta name="keywords" content="Ryan Owen photographer, Ocean City MD photographer, Brooks Institute photographer, FAA drone pilot Maryland, Eastern Shore real estate photographer, about Ryan Owen Photography" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/about.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="profile" />
<meta property="og:title" content="About Ryan Owen | Ocean City MD Photographer" />
<meta property="og:description" content="Brooks Institute-trained, FAA-certified photographer with 30+ years on the Eastern Shore. Real estate, drone, fine art, and food photography." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/ryan-owen-headshot.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/about.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="About Ryan Owen Photography | Ocean City, MD" />
<meta name="twitter:description" content="Brooks Institute-trained, FAA-certified photographer. 30+ years on the Eastern Shore." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/ryan-owen-headshot.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "@id": "https://www.ryanowenphotography.com/#ryan",
    "name": "Ryan Owen",
    "jobTitle": "Professional Photographer",
    "description": "Ryan Owen is a professionally trained photographer with over 30 years of experience shooting the Eastern Shore of Maryland and Delaware. A graduate of the Brooks Institute of Photography and FAA Part 107 certified drone operator, Ryan specializes in real estate photography, aerial drone photography, twilight photography, fine art, and food photography.",
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Brooks Institute of Photography"
    },
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "FAA Part 107 Remote Pilot Certificate",
      "credentialCategory": "License"
    },
    "worksFor": { "@id": "https://www.ryanowenphotography.com/#business" },
    "url": "https://www.ryanowenphotography.com/site/about.html",
    "image": "https://www.ryanowenphotography.com/site/images/ryan-owen-headshot.jpg",
    "knowsAbout": [
      "Real estate photography",
      "Aerial drone photography",
      "Twilight photography",
      "Fine art photography",
      "Food photography",
      "Real estate videography",
      "Virtual tours",
      "HDR photography",
      "Composite photography",
      "Ocean City Maryland photography",
      "Eastern Shore photography"
    ],
    "sameAs": [
      "https://www.instagram.com/ryanowenphotography",
      "https://www.facebook.com/ryanowenphotography"
    ]
  }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 4. PORTFOLIO — `site/portfolio.html`

```html
<!-- ===== SEO HEAD BLOCK — PORTFOLIO ===== -->
<title>Real Estate Photography Portfolio | Ocean City MD | Ryan Owen Photography</title>
<meta name="description" content="Browse Ryan Owen's real estate photography portfolio. Interior, exterior, drone, twilight, and video work from Ocean City MD and the Eastern Shore." />
<meta name="keywords" content="real estate photography portfolio, Ocean City real estate photos, Eastern Shore property photography, drone real estate photos Maryland, twilight real estate photography examples" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/portfolio.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Photography Portfolio | Ryan Owen Photography | Ocean City, MD" />
<meta property="og:description" content="Real estate photography, drone, twilight, and video portfolio from the Eastern Shore of Maryland and Delaware." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/portfolio.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Portfolio | Ryan Owen Photography" />
<meta name="twitter:description" content="Real estate, drone, twilight, and video photography portfolio from the Eastern Shore." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Ryan Owen Photography Portfolio",
  "description": "Real estate, drone, twilight, fine art, and food photography portfolio by Ryan Owen Photography, Ocean City MD.",
  "url": "https://www.ryanowenphotography.com/site/portfolio.html",
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" },
  "provider": { "@id": "https://www.ryanowenphotography.com/#business" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 5. CONTACT — `site/contact.html`

```html
<!-- ===== SEO HEAD BLOCK — CONTACT ===== -->
<title>Contact Ryan Owen Photography | Ocean City, MD | 240-401-8385</title>
<meta name="description" content="Contact Ryan Owen Photography to book a real estate photo shoot. Ocean City, MD. Call 240-401-8385 or email ryan@ryanowenphotography.com. Book online for an instant estimate." />
<meta name="keywords" content="contact Ryan Owen Photography, book real estate photographer Ocean City MD, real estate photographer phone number, hire photographer Eastern Shore" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/contact.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Contact Ryan Owen Photography | Ocean City, MD" />
<meta property="og:description" content="Book a real estate photo shoot with Ryan Owen. Call 240-401-8385 or submit a request online for an instant estimate." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/contact.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Contact Ryan Owen Photography" />
<meta name="twitter:description" content="Book a shoot or get a quote. Ocean City, MD. Call 240-401-8385." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Ryan Owen Photography",
  "url": "https://www.ryanowenphotography.com/site/contact.html",
  "mainEntity": { "@id": "https://www.ryanowenphotography.com/#business" },
  "description": "Contact page for Ryan Owen Photography. Book real estate photography, drone, twilight, or video services on the Eastern Shore."
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 6. STOCK — `site/stock.html`

```html
<!-- ===== SEO HEAD BLOCK — STOCK ===== -->
<title>Stock Photography | Ocean City, Bethany Beach, Rehoboth, Lewes | Ryan Owen Photography</title>
<meta name="description" content="Stock photography collections from Ocean City MD, Bethany Beach, Fenwick Island, Rehoboth Beach, and Lewes DE. Available for licensing. Eastern Shore fine art and landscape photos." />
<meta name="keywords" content="stock photography Ocean City MD, Delaware beach stock photos, Eastern Shore stock photography, Bethany Beach photos for sale, Rehoboth Beach stock images, Lewes DE photography" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/stock.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Stock Photography | Eastern Shore MD & DE | Ryan Owen Photography" />
<meta property="og:description" content="Licensable stock photography from Ocean City MD, Bethany Beach, Rehoboth Beach, Fenwick Island, and Lewes DE." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/stock.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Stock Photography | Eastern Shore | Ryan Owen Photography" />
<meta name="twitter:description" content="Licensable photos from Ocean City MD, Bethany Beach, Rehoboth Beach, Fenwick Island, and Lewes DE." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Eastern Shore Stock Photography",
  "description": "Stock photography collections from the Eastern Shore of Maryland and Delaware, including Ocean City MD, Bethany Beach, Fenwick Island, Rehoboth Beach, and Lewes DE. Available for licensing.",
  "url": "https://www.ryanowenphotography.com/site/stock.html",
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" },
  "provider": { "@id": "https://www.ryanowenphotography.com/#business" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 7. STOCK — OCEAN CITY — `site/stock-ocean-city.html`

```html
<!-- ===== SEO HEAD BLOCK — STOCK OCEAN CITY ===== -->
<title>Ocean City MD Stock Photography | Boardwalk, Inlet & Beach Photos | Ryan Owen</title>
<meta name="description" content="Stock photography of Ocean City, Maryland — boardwalk, inlet, sunrise, condo row, and more. Available for licensing. Captured by Ryan Owen Photography." />
<meta name="keywords" content="Ocean City MD stock photography, Ocean City Maryland photos, OC boardwalk photos, Ocean City inlet photography, Maryland beach stock images for licensing" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/stock-ocean-city.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Ocean City MD Stock Photography | Ryan Owen Photography" />
<meta property="og:description" content="Boardwalk, inlet, sunrise, and condo row photography from Ocean City, MD. Available for licensing." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/stock-ocean-city.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Ocean City MD Stock Photography | Ryan Owen" />
<meta name="twitter:description" content="Boardwalk, inlet, sunrise, and condo row photos from Ocean City, MD. Available for licensing." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Ocean City MD Stock Photography",
  "description": "Professional stock photography of Ocean City, Maryland — boardwalk, inlet, sunrise, condos, and coastal scenes. Available for licensing.",
  "url": "https://www.ryanowenphotography.com/site/stock-ocean-city.html",
  "about": {
    "@type": "Place",
    "name": "Ocean City, Maryland",
    "address": { "@type": "PostalAddress", "addressLocality": "Ocean City", "addressRegion": "MD", "addressCountry": "US" }
  },
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 8. STOCK — BETHANY BEACH — `site/stock-bethany-beach.html`

```html
<!-- ===== SEO HEAD BLOCK — STOCK BETHANY BEACH ===== -->
<title>Bethany Beach DE Stock Photography | Coastal Photos for Licensing | Ryan Owen</title>
<meta name="description" content="Stock photography of Bethany Beach, Delaware — coastal scenes, beach, and town. Available for licensing. Captured by Ryan Owen Photography." />
<meta name="keywords" content="Bethany Beach stock photography, Bethany Beach Delaware photos, Delaware beach photos for licensing, Bethany Beach coastal images" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/stock-bethany-beach.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Bethany Beach DE Stock Photography | Ryan Owen Photography" />
<meta property="og:description" content="Coastal scenes and beach photography from Bethany Beach, Delaware. Available for licensing." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/stock-bethany-beach.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Bethany Beach DE Stock Photography | Ryan Owen" />
<meta name="twitter:description" content="Coastal beach photography from Bethany Beach, Delaware. Available for licensing." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Bethany Beach DE Stock Photography",
  "description": "Professional stock photography of Bethany Beach, Delaware. Coastal scenes available for licensing.",
  "url": "https://www.ryanowenphotography.com/site/stock-bethany-beach.html",
  "about": {
    "@type": "Place",
    "name": "Bethany Beach, Delaware",
    "address": { "@type": "PostalAddress", "addressLocality": "Bethany Beach", "addressRegion": "DE", "addressCountry": "US" }
  },
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 9. STOCK — REHOBOTH BEACH — `site/stock-rehoboth-beach.html`

```html
<!-- ===== SEO HEAD BLOCK — STOCK REHOBOTH BEACH ===== -->
<title>Rehoboth Beach DE Stock Photography | Coastal Photos for Licensing | Ryan Owen</title>
<meta name="description" content="Stock photography of Rehoboth Beach, Delaware — boardwalk, beach, and coastal scenes. Available for licensing. Captured by Ryan Owen Photography." />
<meta name="keywords" content="Rehoboth Beach stock photography, Rehoboth Beach Delaware photos, Delaware coast stock images, Rehoboth boardwalk photos for licensing" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/stock-rehoboth-beach.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Rehoboth Beach DE Stock Photography | Ryan Owen Photography" />
<meta property="og:description" content="Boardwalk, beach, and coastal photography from Rehoboth Beach, Delaware. Available for licensing." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/stock-rehoboth-beach.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Rehoboth Beach DE Stock Photography | Ryan Owen" />
<meta name="twitter:description" content="Boardwalk and beach photography from Rehoboth Beach, Delaware. Available for licensing." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Rehoboth Beach DE Stock Photography",
  "description": "Professional stock photography of Rehoboth Beach, Delaware. Boardwalk and coastal scenes available for licensing.",
  "url": "https://www.ryanowenphotography.com/site/stock-rehoboth-beach.html",
  "about": {
    "@type": "Place",
    "name": "Rehoboth Beach, Delaware",
    "address": { "@type": "PostalAddress", "addressLocality": "Rehoboth Beach", "addressRegion": "DE", "addressCountry": "US" }
  },
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 10. STOCK — FENWICK ISLAND — `site/stock-fenwick-island.html`

```html
<!-- ===== SEO HEAD BLOCK — STOCK FENWICK ISLAND ===== -->
<title>Fenwick Island DE Stock Photography | Lighthouse & Dunes Photos | Ryan Owen</title>
<meta name="description" content="Stock photography of Fenwick Island, Delaware — lighthouse, rainbow, dunes, and waterline. Available for licensing. Captured by Ryan Owen Photography." />
<meta name="keywords" content="Fenwick Island stock photography, Fenwick Island DE photos, Delaware lighthouse stock images, Fenwick Island dunes photography for licensing" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/stock-fenwick-island.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Fenwick Island DE Stock Photography | Ryan Owen Photography" />
<meta property="og:description" content="Lighthouse, rainbow, dunes, and waterline photography from Fenwick Island, Delaware. Available for licensing." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/stock-fenwick-island.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Fenwick Island DE Stock Photography | Ryan Owen" />
<meta name="twitter:description" content="Lighthouse, dunes, and coastal photography from Fenwick Island, Delaware. Available for licensing." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Fenwick Island DE Stock Photography",
  "description": "Professional stock photography of Fenwick Island, Delaware — lighthouse, rainbow, dunes, and waterline scenes available for licensing.",
  "url": "https://www.ryanowenphotography.com/site/stock-fenwick-island.html",
  "about": {
    "@type": "Place",
    "name": "Fenwick Island, Delaware",
    "address": { "@type": "PostalAddress", "addressLocality": "Fenwick Island", "addressRegion": "DE", "addressCountry": "US" }
  },
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 11. STOCK — LEWES — `site/stock-lewes.html`

```html
<!-- ===== SEO HEAD BLOCK — STOCK LEWES ===== -->
<title>Lewes DE Stock Photography | Pier, Lighthouse & Cape Henlopen Photos | Ryan Owen</title>
<meta name="description" content="Stock photography of Lewes, Delaware — pier, lighthouse, Cape Henlopen, and beach. Available for licensing. Captured by Ryan Owen Photography." />
<meta name="keywords" content="Lewes Delaware stock photography, Lewes DE photos, Cape Henlopen stock images, Lewes lighthouse photography for licensing, Delaware Bay photography" />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/stock-lewes.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Lewes DE Stock Photography | Ryan Owen Photography" />
<meta property="og:description" content="Pier, lighthouse, Cape Henlopen, and beach photography from Lewes, Delaware. Available for licensing." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/site/stock-lewes.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Lewes DE Stock Photography | Ryan Owen" />
<meta name="twitter:description" content="Pier, lighthouse, and Cape Henlopen photography from Lewes, Delaware. Available for licensing." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Lewes DE Stock Photography",
  "description": "Professional stock photography of Lewes, Delaware — pier, lighthouse, Cape Henlopen, and beach scenes available for licensing.",
  "url": "https://www.ryanowenphotography.com/site/stock-lewes.html",
  "about": {
    "@type": "Place",
    "name": "Lewes, Delaware",
    "address": { "@type": "PostalAddress", "addressLocality": "Lewes", "addressRegion": "DE", "addressCountry": "US" }
  },
  "author": { "@id": "https://www.ryanowenphotography.com/#ryan" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 12. BOOKING FORM — `booking_form.html` (root)

```html
<!-- ===== SEO HEAD BLOCK — BOOKING FORM ===== -->
<title>Book a Photo Shoot | Photography Request Form | Ryan Owen Photography</title>
<meta name="description" content="Request real estate photography, drone, twilight, video, or virtual tour services. Get an instant price estimate. Serving Ocean City, MD and the Eastern Shore." />
<meta name="keywords" content="book real estate photographer, photography request form, hire drone photographer Ocean City MD, get real estate photo quote Maryland" />
<link rel="canonical" href="https://www.ryanowenphotography.com/booking_form.html" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Book a Photo Shoot | Ryan Owen Photography" />
<meta property="og:description" content="Submit a photography request and get an instant price estimate. Real estate, drone, twilight, video, and virtual tours. Ocean City, MD." />
<meta property="og:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.ryanowenphotography.com/booking_form.html" />
<meta property="og:site_name" content="Ryan Owen Photography" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Book a Shoot | Ryan Owen Photography" />
<meta name="twitter:description" content="Request real estate photography and get an instant estimate. Ocean City, MD and the Eastern Shore." />
<meta name="twitter:image" content="https://www.ryanowenphotography.com/site/images/og-image.jpg" />

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Photography Booking Request Form",
  "description": "Online booking form for real estate photography, drone, twilight, video, and virtual tour services by Ryan Owen Photography.",
  "url": "https://www.ryanowenphotography.com/booking_form.html",
  "provider": { "@id": "https://www.ryanowenphotography.com/#business" }
}
</script>
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## 13. TERMS — `site/terms.html`

```html
<!-- ===== SEO HEAD BLOCK — TERMS ===== -->
<title>Terms & Conditions | Ryan Owen Photography</title>
<meta name="description" content="Terms and conditions for photography services provided by Ryan Owen Media Inc. Ocean City, MD." />
<link rel="canonical" href="https://www.ryanowenphotography.com/site/terms.html" />
<meta name="robots" content="noindex, follow" />

<!-- No OG or schema needed for a terms page -->
<!-- ===== END SEO HEAD BLOCK ===== -->
```

---

## BONUS: SITE-WIDE FILES TO CREATE

### `site/robots.txt`
```
User-agent: *
Allow: /

# Block admin and API routes
Disallow: /admin/
Disallow: /auth/
Disallow: /jobs
Disallow: /me
Disallow: /my-jobs

# AI crawlers — allow all (good for AI search visibility)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://www.ryanowenphotography.com/sitemap.xml
```

### `site/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://www.ryanowenphotography.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/services.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/portfolio.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/about.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/contact.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/booking_form.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/stock.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/stock-ocean-city.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/stock-bethany-beach.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/stock-rehoboth-beach.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/stock-fenwick-island.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://www.ryanowenphotography.com/site/stock-lewes.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

</urlset>
```

---

## AI SEARCH NOTES

The following additions specifically help AI-powered search tools (Perplexity, ChatGPT Search, Google AI Overviews, Bing Copilot):

| What Was Added | Why It Helps AI Search |
|---|---|
| **FAQPage schema on Services page** | AI tools pull FAQ content directly into answers |
| **Person schema with `knowsAbout`** | Establishes Ryan as an authority/entity on specific topics |
| **Person schema with `hasCredential`** | FAA certification signals expertise to AI trust signals |
| **Person schema with `alumniOf`** | Brooks Institute establishes professional credibility |
| **`areaServed` on every Service** | AI geo-filters use this to answer "who does X near me" |
| **`robots.txt` explicit allow for GPTBot, PerplexityBot, ClaudeBot** | Ensures AI crawlers are not accidentally blocked |
| **Rich `description` fields on all schema** | AI models use these as citation text in answers |
| **`@id` cross-referencing across schema** | Tells AI the business, person, and website are the same entity |
| **`sameAs` social links** | Strengthens entity recognition across the web |
| **Unique, specific meta descriptions** | AI overviews pull from meta descriptions for snippets |
