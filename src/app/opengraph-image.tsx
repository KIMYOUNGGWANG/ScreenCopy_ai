import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'ScreenCopy.ai - AI App Store Screenshot Copy Generator'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #2563eb, #7c3aed)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Simple Sparkle Icon SVG */}
                    <svg
                        width="100"
                        height="100"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: 'white' }}
                    >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    <span style={{ fontWeight: 800 }}>ScreenCopy.ai</span>
                </div>
                <div style={{ fontSize: 48, marginTop: 40, opacity: 0.9, fontWeight: 400 }}>
                    AI App Store Screenshot Copy
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
