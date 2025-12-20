'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { PreviewConfig } from '@/lib/devices'

interface StyleControlsProps {
    config: PreviewConfig
    onUpdate: (updates: Partial<PreviewConfig>) => void
}

export function StyleControls({ config, onUpdate }: StyleControlsProps) {
    return (
        <div className="space-y-6">
            {/* Background Colors */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">배경 색상</h4>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">시작 색상</Label>
                        <div className="flex gap-2">
                            <div
                                className="w-8 h-8 rounded border cursor-pointer"
                                style={{ backgroundColor: config.gradientFrom }}
                            />
                            <Input
                                type="text"
                                value={config.gradientFrom || '#1a1a2e'}
                                onChange={(e) => onUpdate({ gradientFrom: e.target.value })}
                                className="h-8 text-xs font-mono"
                                placeholder="#1a1a2e"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">끝 색상</Label>
                        <div className="flex gap-2">
                            <div
                                className="w-8 h-8 rounded border cursor-pointer"
                                style={{ backgroundColor: config.gradientTo }}
                            />
                            <Input
                                type="text"
                                value={config.gradientTo || '#16213e'}
                                onChange={(e) => onUpdate({ gradientTo: e.target.value })}
                                className="h-8 text-xs font-mono"
                                placeholder="#16213e"
                            />
                        </div>
                    </div>
                </div>

                {/* Preset Colors */}
                <div className="flex gap-1.5 flex-wrap">
                    {PRESET_GRADIENTS.map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => onUpdate({ gradientFrom: preset.from, gradientTo: preset.to })}
                            className="w-6 h-6 rounded-full border border-white/10 transition-transform hover:scale-110"
                            style={{
                                background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`
                            }}
                            title={preset.name}
                        />
                    ))}
                </div>
            </div>

            {/* Text Color */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">텍스트</h4>

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">텍스트 색상</Label>
                    <div className="flex gap-2">
                        <div
                            className="w-8 h-8 rounded border cursor-pointer"
                            style={{ backgroundColor: config.textColor }}
                        />
                        <Input
                            type="text"
                            value={config.textColor}
                            onChange={(e) => onUpdate({ textColor: e.target.value })}
                            className="h-8 text-xs font-mono"
                            placeholder="#ffffff"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">폰트</Label>
                    <Select
                        value={config.fontFamily}
                        onValueChange={(v) => onUpdate({ fontFamily: v as PreviewConfig['fontFamily'] })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sf-pro">SF Pro (Apple)</SelectItem>
                            <SelectItem value="inter">Inter (Modern)</SelectItem>
                            <SelectItem value="poppins">Poppins (Friendly)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Device Style */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">디바이스 스타일</h4>

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">디바이스 색상</Label>
                    <div className="flex gap-2">
                        {(['black', 'white', 'natural'] as const).map((color) => (
                            <button
                                key={color}
                                onClick={() => onUpdate({ deviceColor: color })}
                                className={`flex-1 h-8 rounded border text-xs font-medium capitalize transition-all ${config.deviceColor === color
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                {color === 'black' ? '블랙' : color === 'white' ? '화이트' : '내추럴'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">그림자 강도</Label>
                    <Select
                        value={config.shadowIntensity}
                        onValueChange={(v) => onUpdate({ shadowIntensity: v as PreviewConfig['shadowIntensity'] })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">없음</SelectItem>
                            <SelectItem value="light">약함</SelectItem>
                            <SelectItem value="medium">보통</SelectItem>
                            <SelectItem value="heavy">강함</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Edit Text */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">텍스트 편집</h4>

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">헤드라인</Label>
                    <Input
                        value={config.headline}
                        onChange={(e) => onUpdate({ headline: e.target.value })}
                        className="h-8 text-xs"
                        placeholder="헤드라인 입력..."
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">서브텍스트</Label>
                    <Input
                        value={config.subtext}
                        onChange={(e) => onUpdate({ subtext: e.target.value })}
                        className="h-8 text-xs"
                        placeholder="서브텍스트 입력..."
                    />
                </div>
            </div>
        </div>
    )
}

const PRESET_GRADIENTS = [
    { name: 'Midnight', from: '#1a1a2e', to: '#16213e' },
    { name: 'Ocean', from: '#0077b6', to: '#023e8a' },
    { name: 'Sunset', from: '#ff6b6b', to: '#feca57' },
    { name: 'Forest', from: '#2d6a4f', to: '#1b4332' },
    { name: 'Purple', from: '#7209b7', to: '#3a0ca3' },
    { name: 'Coral', from: '#ff6b6b', to: '#ee5a7f' },
    { name: 'Sky', from: '#48cae4', to: '#0096c7' },
    { name: 'Dark', from: '#0a0a0a', to: '#1a1a1a' },
]
