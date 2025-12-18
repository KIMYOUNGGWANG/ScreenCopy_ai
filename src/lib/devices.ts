// Device frame configurations for App Store Preview Generator
// Based on Apple's official screenshot requirements

export interface DeviceFrame {
    id: string
    name: string
    displayName: string  // Korean-friendly name
    width: number        // App Store submission resolution
    height: number
    screenInset: {
        top: number
        bottom: number
        left: number
        right: number
    }
    bezelWidth: number
    cornerRadius: number
    dynamicIsland?: boolean
    notch?: boolean
    homeIndicator?: boolean
}

export const DEVICE_FRAMES: DeviceFrame[] = [
    // iPhone 15 Pro Max (6.7")
    {
        id: 'iphone-15-pro-max',
        name: 'iPhone 15 Pro Max',
        displayName: 'iPhone 15 Pro Max',
        width: 1290,
        height: 2796,
        screenInset: { top: 68, bottom: 34, left: 0, right: 0 },
        bezelWidth: 12,
        cornerRadius: 55,
        dynamicIsland: true,
        homeIndicator: true,
    },
    // iPhone 15 Pro (6.1")
    {
        id: 'iphone-15-pro',
        name: 'iPhone 15 Pro',
        displayName: 'iPhone 15 Pro',
        width: 1179,
        height: 2556,
        screenInset: { top: 59, bottom: 34, left: 0, right: 0 },
        bezelWidth: 10,
        cornerRadius: 50,
        dynamicIsland: true,
        homeIndicator: true,
    },
    // iPhone 15 (6.1")
    {
        id: 'iphone-15',
        name: 'iPhone 15',
        displayName: 'iPhone 15',
        width: 1179,
        height: 2556,
        screenInset: { top: 59, bottom: 34, left: 0, right: 0 },
        bezelWidth: 10,
        cornerRadius: 50,
        dynamicIsland: true,
        homeIndicator: true,
    },
    // iPhone SE (4.7")
    {
        id: 'iphone-se',
        name: 'iPhone SE',
        displayName: 'iPhone SE',
        width: 750,
        height: 1334,
        screenInset: { top: 20, bottom: 0, left: 0, right: 0 },
        bezelWidth: 16,
        cornerRadius: 0,
        homeIndicator: false,
    },
    // iPad Pro 12.9"
    {
        id: 'ipad-pro-12-9',
        name: 'iPad Pro 12.9"',
        displayName: 'iPad Pro 12.9"',
        width: 2048,
        height: 2732,
        screenInset: { top: 24, bottom: 20, left: 0, right: 0 },
        bezelWidth: 20,
        cornerRadius: 18,
        homeIndicator: true,
    },
]

export type LayoutTemplate = {
    id: string
    name: string
    displayName: string
    description: string
    textPosition: 'top' | 'bottom' | 'left' | 'right' | 'overlay-top' | 'overlay-bottom'
    deviceScale: number      // 0.0 - 1.0
    deviceOffsetY: number    // percentage offset
    showGradientBg: boolean
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
    {
        id: 'device-only',
        name: 'Device Only',
        displayName: '디바이스 전용',
        description: '깔끔한 디바이스 프레임만',
        textPosition: 'overlay-top',
        deviceScale: 0.85,
        deviceOffsetY: 0,
        showGradientBg: false,
    },
    {
        id: 'headline-top',
        name: 'Headline Top',
        displayName: '상단 헤드라인',
        description: '상단에 카피, 하단에 디바이스',
        textPosition: 'top',
        deviceScale: 0.7,
        deviceOffsetY: 15,
        showGradientBg: true,
    },
    {
        id: 'headline-bottom',
        name: 'Headline Bottom',
        displayName: '하단 헤드라인',
        description: '상단에 디바이스, 하단에 카피',
        textPosition: 'bottom',
        deviceScale: 0.7,
        deviceOffsetY: -10,
        showGradientBg: true,
    },
    {
        id: 'overlay-gradient',
        name: 'Overlay Gradient',
        displayName: '오버레이 그라디언트',
        description: '풀스크린 디바이스 + 그라디언트 오버레이 카피',
        textPosition: 'overlay-bottom',
        deviceScale: 0.95,
        deviceOffsetY: 0,
        showGradientBg: true,
    },
]

export interface PreviewConfig {
    // Device
    deviceId: string

    // Layout
    templateId: string

    // Background
    backgroundColor: string
    gradientFrom?: string
    gradientTo?: string
    gradientAngle?: number

    // Text
    headline: string
    subtext: string
    textColor: string
    fontFamily: 'sf-pro' | 'inter' | 'poppins'

    // Style
    shadowIntensity: 'none' | 'light' | 'medium' | 'heavy'
    deviceColor: 'black' | 'white' | 'natural'
}

export const DEFAULT_PREVIEW_CONFIG: PreviewConfig = {
    deviceId: 'iphone-15-pro-max',
    templateId: 'headline-top',
    backgroundColor: '#000000',
    gradientFrom: '#1a1a2e',
    gradientTo: '#16213e',
    gradientAngle: 135,
    headline: '',
    subtext: '',
    textColor: '#ffffff',
    fontFamily: 'inter',
    shadowIntensity: 'medium',
    deviceColor: 'black',
}

// Helper to get device by ID
export function getDeviceById(id: string): DeviceFrame | undefined {
    return DEVICE_FRAMES.find(d => d.id === id)
}

// Helper to get template by ID
export function getTemplateById(id: string): LayoutTemplate | undefined {
    return LAYOUT_TEMPLATES.find(t => t.id === id)
}
