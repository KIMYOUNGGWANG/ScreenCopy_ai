// JSON-LD Structured Data for SEO
// Reference: https://developers.google.com/search/docs/appearance/structured-data/software-app

export function JsonLd() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ScreenCopy.ai',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Generate high-converting App Store screenshot copy in seconds using Advanced Vision AI. Analyze your UI and get optimized marketing text instantly.',
        url: 'https://screencopy.ai',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier available with 3 credits',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
            bestRating: '5',
            worstRating: '1',
        },
        author: {
            '@type': 'Organization',
            name: 'ScreenCopy.ai',
            url: 'https://screencopy.ai',
        },
        featureList: [
            'AI-powered screenshot analysis',
            'App Store copy generation',
            'Twitter thread generation',
            'Multi-language support',
            'ASO optimization',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

// Organization Schema for brand recognition
export function OrganizationJsonLd() {
    const organizationData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ScreenCopy.ai',
        url: 'https://screencopy.ai',
        logo: 'https://screencopy.ai/logo.png',
        sameAs: [
            'https://twitter.com/screencopyai',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: 'https://screencopy.ai/contact',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
    );
}

// WebSite Schema for sitelinks search box
export function WebSiteJsonLd() {
    const websiteData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'ScreenCopy.ai',
        url: 'https://screencopy.ai',
        description: 'AI-powered App Store screenshot copy generator for developers and marketers.',
        publisher: {
            '@type': 'Organization',
            name: 'ScreenCopy.ai',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
    );
}
