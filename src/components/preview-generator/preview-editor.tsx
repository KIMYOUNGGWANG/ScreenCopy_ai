'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Smartphone, Layout, Palette, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    DEVICE_FRAMES,
    LAYOUT_TEMPLATES,
    DEFAULT_PREVIEW_CONFIG,
    getDeviceById,
    getTemplateById,
    type PreviewConfig,
    type DeviceFrame,
    type LayoutTemplate
} from '@/lib/devices'
import { DeviceSelector } from './device-selector'
import { TemplateSelector } from './template-selector'
import { StyleControls } from './style-controls'
import { PreviewCanvas } from './preview-canvas'

interface PreviewEditorProps {
    isOpen: boolean
    onClose: () => void
    screenshotUrl: string
    headline: string
    subtext: string
    accentColor?: string
}

export function PreviewEditor({
    isOpen,
    onClose,
    screenshotUrl,
    headline,
    subtext,
    accentColor = '#3B82F6'
}: PreviewEditorProps) {
    const [config, setConfig] = useState<PreviewConfig>({
        ...DEFAULT_PREVIEW_CONFIG,
        headline,
        subtext,
        gradientFrom: accentColor,
        gradientTo: adjustColor(accentColor, -30),
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState('device')

    const selectedDevice = getDeviceById(config.deviceId) || DEVICE_FRAMES[0]
    const selectedTemplate = getTemplateById(config.templateId) || LAYOUT_TEMPLATES[0]

    const updateConfig = useCallback((updates: Partial<PreviewConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }))
    }, [])

    const handleDownload = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch('/api/generate-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    screenshotUrl,
                    config,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate preview')
            }

            // Get the image blob
            const blob = await response.blob()

            // Create download link
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `app-preview-${selectedDevice.id}-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success('프리뷰 이미지가 다운로드되었습니다!')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('이미지 생성에 실패했습니다')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            App Store 프리뷰 생성
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Preview Canvas */}
                    <div className="flex-1 bg-muted/50 p-6 flex items-center justify-center overflow-auto">
                        <PreviewCanvas
                            screenshotUrl={screenshotUrl}
                            config={config}
                            device={selectedDevice}
                            template={selectedTemplate}
                        />
                    </div>

                    {/* Right: Controls Panel */}
                    <div className="w-80 border-l bg-background flex flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="grid grid-cols-3 m-4 mb-2">
                                <TabsTrigger value="device" className="gap-1 text-xs">
                                    <Smartphone className="w-3 h-3" />
                                    디바이스
                                </TabsTrigger>
                                <TabsTrigger value="layout" className="gap-1 text-xs">
                                    <Layout className="w-3 h-3" />
                                    레이아웃
                                </TabsTrigger>
                                <TabsTrigger value="style" className="gap-1 text-xs">
                                    <Palette className="w-3 h-3" />
                                    스타일
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto">
                                <TabsContent value="device" className="mt-0 p-4">
                                    <DeviceSelector
                                        devices={DEVICE_FRAMES}
                                        selectedId={config.deviceId}
                                        onSelect={(id) => updateConfig({ deviceId: id })}
                                    />
                                </TabsContent>

                                <TabsContent value="layout" className="mt-0 p-4">
                                    <TemplateSelector
                                        templates={LAYOUT_TEMPLATES}
                                        selectedId={config.templateId}
                                        onSelect={(id) => updateConfig({ templateId: id })}
                                    />
                                </TabsContent>

                                <TabsContent value="style" className="mt-0 p-4">
                                    <StyleControls
                                        config={config}
                                        onUpdate={updateConfig}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Download Button */}
                        <div className="p-4 border-t">
                            <Button
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="w-full gap-2"
                                size="lg"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        생성 중...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        PNG 다운로드 ({selectedDevice.width}×{selectedDevice.height})
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center mt-2">
                                App Store 제출용 고해상도 이미지
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
