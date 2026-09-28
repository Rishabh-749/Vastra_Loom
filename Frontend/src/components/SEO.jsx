import { useEffect } from 'react';

/**
 * Enterprise SEO Manager for VASTRA LOOM
 * Automatically generates OpenGraph, Twitter Cards, canonical links, and Schema.org JSON-LD
 */
export const SEO = ({
  title,
  description = 'VASTRA LOOM | India’s premier bespoke haute couture atelier. Explore royal handloom sherwanis, heritage achkans, and handcrafted raw silk silhouettes.',
  image = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  url,
  type = 'website',
  schema = null,
}) => {
  const fullTitle = title
    ? `${title} | VASTRA LOOM Haute Couture`
    : 'VASTRA LOOM | Bespoke Indian Haute Couture & Handloom Silks';

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://vastraloom.com');

    // Helper to set or create meta tags
    const setMeta = (attrName, attrVal, content) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Search Meta
    setMeta('name', 'description', description);
    setMeta('name', 'author', 'VASTRA LOOM Bespoke Atelier');
    setMeta('name', 'robots', 'index, follow');

    // 3. OpenGraph Social Meta
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'VASTRA LOOM');

    // 4. Twitter Social Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // 5. Schema.org JSON-LD
    let scriptTag = document.getElementById('vastra-seo-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'vastra-seo-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'VASTRA LOOM',
      url: currentUrl,
      logo: 'https://vastraloom.com/logo.png',
      description: 'Master weavers crafting royal bespoke couture garments.',
      sameAs: [
        'https://instagram.com/vastraloom',
        'https://facebook.com/vastraloom',
      ],
    };

    scriptTag.textContent = JSON.stringify(schema || defaultSchema);
  }, [fullTitle, description, image, url, type, schema]);

  return null;
};

export default SEO;
