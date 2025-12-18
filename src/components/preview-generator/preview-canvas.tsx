'use client'

import { useMemo } from 'react'
import type { DeviceFrame, LayoutTemplate, PreviewConfig } from '@/lib/devices'

interface PreviewCanvasProps {
    screenshotUrl: string
    config: PreviewConfig
    device: DeviceFrame
    template: LayoutTemplate
}

export function PreviewCanvas({
    screenshotUrl,
    config,
    device,
    template
}: PreviewCanvasProps) {
    // Calculate scaled dimensions for preview (max 400px height)
    const scale = useMemo(() => {
        const maxHeight = 500
        return Math.min(1, maxHeight / device.height)
    }, [device.height])

    const previewWidth = device.width * scale
    const previewHeight = device.height * scale

    const shadowStyle = useMemo(() => {
        switch (config.shadowIntensity) {
            case 'light': return '0 10px 30px rgba(0,0,0,0.3)'
            case 'medium': return '0 20px 50px rgba(0,0,0,0.4)'
            case 'heavy': return '0 30px 80px rgba(0,0,0,0.6)'
            default: return 'none'
        }
    }, [config.shadowIntensity])

    const deviceBezelColor = useMemo(() => {
        switch (config.deviceColor) {
            case 'white': return '#f5f5f5'
            case 'natural': return '#e5c890'
            default: return '#1a1a1a'
        }
    }, [config.deviceColor])

    const fontFamily = useMemo(() => {
        switch (config.fontFamily) {
            case 'sf-pro': return '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            case 'poppins': return '"Poppins", sans-serif'
            default: return '"Inter", sans-serif'
        }
    }, [config.fontFamily])

    // Calculate text and device positions based on template
    const getTextPosition = () => {
        switch (template.textPosition) {
            case 'top':
                return { top: '8%', transform: 'translateX(-50%)', left: '50%' }
            case 'bottom':
                return { bottom: '8%', transform: 'translateX(-50%)', left: '50%' }
            case 'overlay-top':
                return { top: '15%', transform: 'translateX(-50%)', left: '50%' }
            case 'overlay-bottom':
                return { bottom: '15%', transform: 'translateX(-50%)', left: '50%' }
            default:
                return { top: '10%', transform: 'translateX(-50%)', left: '50%' }
        }
    }

    const getDevicePosition = () => {
        const yOffset = template.deviceOffsetY
        if (template.textPosition === 'top') {
            return { bottom: '5%', transform: 'translateX(-50%)', left: '50%' }
        } else if (template.textPosition === 'bottom') {
            return { top: '5%', transform: 'translateX(-50%)', left: '50%' }
        }
        return {
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% + ${yOffset}%))`
        }
    }

    const deviceScale = template.deviceScale

    return (
        <div
            className="relative overflow-hidden rounded-xl shadow-2xl"
            style={{
                width: previewWidth,
                height: previewHeight,
                background: template.showGradientBg
                    ? `linear-gradient(${config.gradientAngle || 135}deg, ${config.gradientFrom}, ${config.gradientTo})`
                    : config.backgroundColor,
            }}
        >
            {/* Text Layer */}
            {(template.textPosition !== 'overlay-top' && template.textPosition !== 'overlay-bottom') && (
                <div
                    className="absolute text-center max-w-[80%] z-10"
                    style={{
                        ...getTextPosition(),
                        fontFamily,
                        color: config.textColor,
                    }}
                >
                    <h2
                        className="font-bold leading-tight mb-2"
                        style={{
                            fontSize: `${Math.max(14, 28 * scale)}px`,
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                    >
                        {config.headline || 'Your headline here'}
                    </h2>
                    <p
                        className="opacity-90"
                        style={{
                            fontSize: `${Math.max(10, 16 * scale)}px`,
                            textShadow: '0 1px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        {config.subtext || 'Your subtext here'}
                    </p>
                </div>
            )}

            {/* Device Frame */}
            <div
                className="absolute"
                style={{
                    ...getDevicePosition(),
                    width: `${device.width * scale * deviceScale}px`,
                    height: `${device.height * scale * deviceScale}px`,
                }}
            >
                {/* Device Bezel */}
                <div
                    className="absolute inset-0 rounded-[calc(var(--radius)*3)] overflow-hidden"
                    style={{
                        backgroundColor: deviceBezelColor,
                        padding: `${device.bezelWidth * scale * deviceScale}px`,
                        borderRadius: `${device.cornerRadius * scale * deviceScale}px`,
                        boxShadow: shadowStyle,
                    }}
                >
                    {/* Screen */}
                    <div
                        className="relative w-full h-full overflow-hidden bg-black"
                        style={{
                            borderRadius: `${(device.cornerRadius - device.bezelWidth) * scale * deviceScale}px`,
                        }}
                    >
                        {/* Screenshot */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={screenshotUrl}
                            alt="App Screenshot"
                            className="w-full h-full object-cover"
                        />

                        {/* Dynamic Island */}
                        {device.dynamicIsland && (
                            <div
                                className="absolute top-2 left-1/2 -translate-x-1/2 bg-black rounded-full"
                                style={{
                                    width: `${90 * scale * deviceScale}px`,
                                    height: `${30 * scale * deviceScale}px`,
                                }}
                            />
                        )}

                        {/* Home Indicator */}
                        {device.homeIndicator && (
                            <div
                                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/50 rounded-full"
                                style={{
                                    width: `${120 * scale * deviceScale}px`,
                                    height: `${5 * scale * deviceScale}px`,
                                }}
                            />
                        )}

                        {/* Overlay Text (for overlay templates) */}
                        {(template.textPosition === 'overlay-top' || template.textPosition === 'overlay-bottom') && (
                            <div
                                className="absolute inset-x-0 text-center px-4 z-20"
                                style={{
                                    ...(template.textPosition === 'overlay-top'
                                        ? { top: `${device.screenInset.top * scale * deviceScale + 20}px` }
                                        : { bottom: `${device.screenInset.bottom * scale * deviceScale + 20}px` }
                                    ),
                                    fontFamily,
                                    color: config.textColor,
                                }}
                            >
                                <div
                                    className="inline-block px-4 py-3 rounded-xl backdrop-blur-md"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                >
                                    <h2
                                        className="font-bold leading-tight"
                                        style={{ fontSize: `${Math.max(10, 18 * scale * deviceScale)}px` }}
                                    >
                                        {config.headline || 'Your headline'}
                                    </h2>
                                    {config.subtext && (
                                        <p
                                            className="opacity-90 mt-1"
                                            style={{ fontSize: `${Math.max(8, 11 * scale * deviceScale)}px` }}
                                        >
                                            {config.subtext}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
