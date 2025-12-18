'use client'

import { cn } from '@/lib/utils'
import { Smartphone, Tablet, Check } from 'lucide-react'
import type { DeviceFrame } from '@/lib/devices'

interface DeviceSelectorProps {
    devices: DeviceFrame[]
    selectedId: string
    onSelect: (id: string) => void
}

export function DeviceSelector({ devices, selectedId, onSelect }: DeviceSelectorProps) {
    // Group devices by type
    const iphones = devices.filter(d => d.id.includes('iphone'))
    const ipads = devices.filter(d => d.id.includes('ipad'))

    return (
        <div className="space-y-4">
            {/* iPhones */}
            <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    iPhone
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {iphones.map((device) => (
                        <button
                            key={device.id}
                            onClick={() => onSelect(device.id)}
                            className={cn(
                                "relative p-3 rounded-lg border text-left transition-all",
                                "hover:border-primary/50 hover:bg-muted/50",
                                selectedId === device.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border"
                            )}
                        >
                            {selectedId === device.id && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                            )}
                            <div className="flex items-center justify-center mb-2">
                                <DeviceIcon
                                    device={device}
                                    className={cn(
                                        "transition-colors",
                                        selectedId === device.id ? "text-primary" : "text-muted-foreground"
                                    )}
                                />
                            </div>
                            <p className="text-xs font-medium truncate">{device.displayName}</p>
                            <p className="text-[10px] text-muted-foreground">
                                {device.width}×{device.height}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* iPads */}
            {ipads.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Tablet className="w-4 h-4" />
                        iPad
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {ipads.map((device) => (
                            <button
                                key={device.id}
                                onClick={() => onSelect(device.id)}
                                className={cn(
                                    "relative p-3 rounded-lg border text-left transition-all",
                                    "hover:border-primary/50 hover:bg-muted/50",
                                    selectedId === device.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border"
                                )}
                            >
                                {selectedId === device.id && (
                                    <div className="absolute top-2 right-2">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                )}
                                <div className="flex items-center justify-center mb-2">
                                    <Tablet className={cn(
                                        "w-8 h-10 transition-colors",
                                        selectedId === device.id ? "text-primary" : "text-muted-foreground"
                                    )} />
                                </div>
                                <p className="text-xs font-medium truncate">{device.displayName}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {device.width}×{device.height}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                    💡 6.7인치 (Pro Max) 스크린샷을 제출하면 Apple이 작은 화면용으로 자동 축소합니다.
                </p>
            </div>
        </div>
    )
}

// Simple device icon based on characteristics
function DeviceIcon({ device, className }: { device: DeviceFrame; className?: string }) {
    const aspectRatio = device.height / device.width
    const height = Math.min(40, 24 * aspectRatio)

    return (
        <div
            className={cn("relative border-2 rounded-lg", className)}
            style={{
                width: 24,
                height,
                borderRadius: device.cornerRadius > 0 ? 6 : 2
            }}
        >
            {device.dynamicIsland && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-current rounded-full opacity-50" />
            )}
            {device.homeIndicator && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-current rounded-full opacity-50" />
            )}
        </div>
    )
}
