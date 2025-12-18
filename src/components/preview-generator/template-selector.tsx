'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { LayoutTemplate } from '@/lib/devices'

interface TemplateSelectorProps {
    templates: LayoutTemplate[]
    selectedId: string
    onSelect: (id: string) => void
}

export function TemplateSelector({ templates, selectedId, onSelect }: TemplateSelectorProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium">레이아웃 선택</h4>

            <div className="space-y-2">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template.id)}
                        className={cn(
                            "w-full relative p-3 rounded-lg border text-left transition-all",
                            "hover:border-primary/50 hover:bg-muted/50",
                            "flex items-center gap-3",
                            selectedId === template.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border"
                        )}
                    >
                        {/* Thumbnail Preview */}
                        <div className="shrink-0">
                            <LayoutThumbnail template={template} isSelected={selectedId === template.id} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{template.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                        </div>

                        {/* Check */}
                        {selectedId === template.id && (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

// Mini thumbnail showing layout structure
function LayoutThumbnail({ template, isSelected }: { template: LayoutTemplate; isSelected: boolean }) {
    const baseClass = cn(
        "w-10 h-16 rounded border flex flex-col items-center justify-center gap-0.5 p-1",
        isSelected ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-muted/50"
    )

    const textBlockClass = cn(
        "w-full h-1 rounded-full",
        isSelected ? "bg-primary" : "bg-muted-foreground/50"
    )

    const deviceBlockClass = cn(
        "w-5 h-8 rounded-sm border",
        isSelected ? "border-primary/50 bg-primary/20" : "border-muted-foreground/30"
    )

    switch (template.textPosition) {
        case 'top':
            return (
                <div className={baseClass}>
                    <div className="w-full space-y-0.5 mb-1">
                        <div className={textBlockClass} />
                        <div className={cn(textBlockClass, "w-3/4")} />
                    </div>
                    <div className={deviceBlockClass} />
                </div>
            )
        case 'bottom':
            return (
                <div className={baseClass}>
                    <div className={deviceBlockClass} />
                    <div className="w-full space-y-0.5 mt-1">
                        <div className={textBlockClass} />
                        <div className={cn(textBlockClass, "w-3/4")} />
                    </div>
                </div>
            )
        case 'overlay-top':
        case 'overlay-bottom':
            return (
                <div className={cn(baseClass, "relative")}>
                    <div className={cn(deviceBlockClass, "w-6 h-10")} />
                    <div className={cn(
                        "absolute inset-x-1 space-y-0.5",
                        template.textPosition === 'overlay-top' ? "top-1" : "bottom-1"
                    )}>
                        <div className={cn(textBlockClass, "opacity-70")} />
                    </div>
                </div>
            )
        default:
            return (
                <div className={baseClass}>
                    <div className={deviceBlockClass} />
                </div>
            )
    }
}
