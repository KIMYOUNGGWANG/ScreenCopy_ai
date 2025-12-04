
export interface DesignConfig {
    accent_color: string
    suggested_layout: 'bento' | 'device' | 'viral'
}

export interface WeeklyThread {
    day: 'Monday' | 'Wednesday' | 'Friday'
    theme: string
    hook: string
    thread: string[]
}

export interface GhostwriterOutput {
    design_config: DesignConfig
    weekly_batch: WeeklyThread[]
}
