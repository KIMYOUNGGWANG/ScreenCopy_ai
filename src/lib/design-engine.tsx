import { ImageResponse } from '@vercel/og'
import { BentoGridTemplate } from '@/components/templates/bento-grid'

export async function generateSocialImage(
    title: string,
    subtitle: string,
    items: string[],
    accentColor: string
): Promise<Buffer> {
    const response = new ImageResponse(
        (
            <BentoGridTemplate
                title={title}
                subtitle={subtitle}
                items={items}
                accentColor={accentColor}
            />
        ),
        {
            width: 1200,
            height: 630,
            // We can add fonts here later if needed
        }
    )

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
}
