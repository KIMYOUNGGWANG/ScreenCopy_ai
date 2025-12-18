import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import {
    getDeviceById,
    getTemplateById,
    DEVICE_FRAMES,
    LAYOUT_TEMPLATES,
    type PreviewConfig
} from '@/lib/devices'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { screenshotUrl, config } = body as {
            screenshotUrl: string
            config: PreviewConfig
        }

        // Validate inputs
        if (!screenshotUrl || !config) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400 }
            )
        }

        const device = getDeviceById(config.deviceId) || DEVICE_FRAMES[0]
        const template = getTemplateById(config.templateId) || LAYOUT_TEMPLATES[0]

        // Fetch screenshot as base64
        let screenshotBase64 = ''
        try {
            const screenshotRes = await fetch(screenshotUrl)
            const screenshotBuffer = await screenshotRes.arrayBuffer()
            screenshotBase64 = `data:image/png;base64,${Buffer.from(screenshotBuffer).toString('base64')}`
        } catch (e) {
            console.error('Failed to fetch screenshot:', e)
            return new Response(
                JSON.stringify({ error: 'Failed to fetch screenshot' }),
                { status: 400 }
            )
        }

        // Calculate positions based on template
        const getTextStyle = () => {
            switch (template.textPosition) {
                case 'top':
                    return { top: 80, isOverlay: false }
                case 'bottom':
                    return { bottom: 80, isOverlay: false }
                case 'overlay-top':
                    return { top: device.screenInset.top + 100, isOverlay: true }
                case 'overlay-bottom':
                    return { bottom: device.screenInset.bottom + 100, isOverlay: true }
                default:
                    return { top: 80, isOverlay: false }
            }
        }

        const getDeviceY = () => {
            if (template.textPosition === 'top') return device.height * 0.18
            if (template.textPosition === 'bottom') return device.height * 0.02
            return device.height * 0.05 + (template.deviceOffsetY * device.height / 100)
        }

        const textStyle = getTextStyle()
        const deviceScale = template.deviceScale
        const scaledDeviceWidth = device.width * deviceScale
        const scaledDeviceHeight = device.height * deviceScale
        const deviceX = (device.width - scaledDeviceWidth) / 2
        const deviceY = getDeviceY()

        // Shadow styles
        const getShadowStyle = () => {
            switch (config.shadowIntensity) {
                case 'light': return '0 20px 60px rgba(0,0,0,0.3)'
                case 'medium': return '0 40px 100px rgba(0,0,0,0.4)'
                case 'heavy': return '0 60px 140px rgba(0,0,0,0.6)'
                default: return 'none'
            }
        }

        // Device bezel color
        const getBezelColor = () => {
            switch (config.deviceColor) {
                case 'white': return '#f5f5f5'
                case 'natural': return '#e5c890'
                default: return '#1a1a1a'
            }
        }

        // Generate image using Vercel OG
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        background: template.showGradientBg
                            ? `linear-gradient(${config.gradientAngle || 135}deg, ${config.gradientFrom}, ${config.gradientTo})`
                            : config.backgroundColor,
                    }}
                >
                    {/* Text - Top position */}
                    {(template.textPosition === 'top' && config.headline) && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 80,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '0 60px',
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: 72,
                                    fontWeight: 700,
                                    color: config.textColor,
                                    margin: 0,
                                    lineHeight: 1.2,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                }}
                            >
                                {config.headline}
                            </h1>
                            {config.subtext && (
                                <p
                                    style={{
                                        fontSize: 36,
                                        color: config.textColor,
                                        opacity: 0.9,
                                        marginTop: 16,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    {config.subtext}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Device Frame */}
                    <div
                        style={{
                            position: 'absolute',
                            left: deviceX,
                            top: deviceY,
                            width: scaledDeviceWidth,
                            height: scaledDeviceHeight,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* Bezel */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: getBezelColor(),
                                borderRadius: device.cornerRadius * deviceScale,
                                padding: device.bezelWidth * deviceScale,
                                display: 'flex',
                                boxShadow: getShadowStyle(),
                            }}
                        >
                            {/* Screen */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: (device.cornerRadius - device.bezelWidth) * deviceScale,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    position: 'relative',
                                }}
                            >
                                {/* Screenshot */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={screenshotBase64}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />

                                {/* Dynamic Island */}
                                {device.dynamicIsland && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 12 * deviceScale,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 120 * deviceScale,
                                            height: 36 * deviceScale,
                                            backgroundColor: '#000',
                                            borderRadius: 20 * deviceScale,
                                        }}
                                    />
                                )}

                                {/* Home Indicator */}
                                {device.homeIndicator && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 8 * deviceScale,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 140 * deviceScale,
                                            height: 5 * deviceScale,
                                            backgroundColor: 'rgba(255,255,255,0.5)',
                                            borderRadius: 3 * deviceScale,
                                        }}
                                    />
                                )}

                                {/* Overlay text */}
                                {textStyle.isOverlay && config.headline && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            [template.textPosition === 'overlay-top' ? 'top' : 'bottom']:
                                                template.textPosition === 'overlay-top'
                                                    ? (device.screenInset.top + 40) * deviceScale
                                                    : (device.screenInset.bottom + 40) * deviceScale,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '0 20px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                padding: '20px 32px',
                                                borderRadius: 20,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 28 * deviceScale,
                                                    fontWeight: 700,
                                                    color: config.textColor,
                                                }}
                                            >
                                                {config.headline}
                                            </span>
                                            {config.subtext && (
                                                <span
                                                    style={{
                                                        fontSize: 16 * deviceScale,
                                                        color: config.textColor,
                                                        opacity: 0.9,
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    {config.subtext}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Text - Bottom position */}
                    {(template.textPosition === 'bottom' && config.headline) && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 80,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '0 60px',
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: 72,
                                    fontWeight: 700,
                                    color: config.textColor,
                                    margin: 0,
                                    lineHeight: 1.2,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                }}
                            >
                                {config.headline}
                            </h1>
                            {config.subtext && (
                                <p
                                    style={{
                                        fontSize: 36,
                                        color: config.textColor,
                                        opacity: 0.9,
                                        marginTop: 16,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    {config.subtext}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ),
            {
                width: device.width,
                height: device.height,
            }
        )
    } catch (error) {
        console.error('Preview generation error:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to generate preview' }),
            { status: 500 }
        )
    }
}
