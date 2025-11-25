import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://screencopy.ai' // Replace with actual domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/', '/generate/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
