import React from 'react'

export const BentoGridTemplate = ({
    title,
    subtitle,
    items,
    accentColor = '#3B82F6',
}: {
    title: string
    subtitle: string
    items: string[]
    accentColor?: string
}) => {
    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', // Richer dark background
                color: 'white',
                fontFamily: 'sans-serif',
                padding: '60px',
                position: 'relative',
            }}
        >
            {/* Background Glow */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    background: accentColor,
                    filter: 'blur(200px)',
                    opacity: 0.15,
                    borderRadius: '50%',
                }}
            />

            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '60px',
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '100px',
                        padding: '8px 20px',
                        marginBottom: '20px',
                    }}
                >
                    <span style={{ fontSize: '16px', color: accentColor, fontWeight: 600, letterSpacing: '1px' }}>
                        WEEKLY STRATEGY
                    </span>
                </div>
                <h1
                    style={{
                        fontSize: '72px',
                        fontWeight: 900,
                        margin: 0,
                        background: `linear-gradient(to bottom right, #ffffff 30%, ${accentColor})`,
                        backgroundClip: 'text',
                        color: 'transparent',
                        textAlign: 'center',
                        lineHeight: 1.1,
                        letterSpacing: '-2px',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                >
                    {title}
                </h1>
                <p
                    style={{
                        fontSize: '28px',
                        color: '#94a3b8',
                        marginTop: '16px',
                        textAlign: 'center',
                        maxWidth: '800px',
                        lineHeight: 1.5,
                    }}
                >
                    {subtitle}
                </p>
            </div>

            {/* Grid */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '24px',
                    width: '100%',
                    zIndex: 10,
                }}
            >
                {items.slice(0, 4).map((item, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(30, 41, 59, 0.4)', // More transparent
                            padding: '32px',
                            borderRadius: '24px',
                            width: '45%',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: accentColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginRight: '12px',
                                    boxShadow: `0 0 20px ${accentColor}66`, // Glow effect
                                }}
                            >
                                {i + 1}
                            </div>
                            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
                        </div>
                        <span
                            style={{
                                fontSize: '22px',
                                fontWeight: 500,
                                lineHeight: 1.5,
                                color: '#e2e8f0',
                            }}
                        >
                            {item}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: 0.6,
            }}>
                <div style={{ width: '20px', height: '20px', background: accentColor, borderRadius: '4px' }} />
                <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 500 }}>
                    Generated by ScreenCopy.ai
                </span>
            </div>
        </div>
    )
}
