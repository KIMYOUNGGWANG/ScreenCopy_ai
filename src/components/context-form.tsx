
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
    platform: z.enum(["app_store", "twitter", "linkedin", "instagram"]),
    appName: z.string().min(2, "App name must be at least 2 characters"),
    category: z.string().min(1, "Please select a category"),
    targetAudience: z.string().min(5, "Please describe your target audience"),
    tone: z.enum(["professional", "casual", "playful", "inspirational"]),
    description: z.string().min(10, "Please provide a brief description"),
    keywords: z.string().optional(),
    language: z.string().min(1, "Please select a language"),
})

export type ContextFormData = z.infer<typeof formSchema>

interface ContextFormProps {
    onSubmit: (data: ContextFormData) => void
    isLoading?: boolean
    initialValues?: Partial<ContextFormData>
}

export function ContextForm({ onSubmit, isLoading, initialValues }: ContextFormProps) {
    const defaultValues = {
        platform: "app_store" as const,
        appName: "",
        category: "",
        targetAudience: "",
        tone: "professional" as const,
        description: "",
        keywords: "",
        language: "English",
        ...initialValues
    }

    const form = useForm<ContextFormData>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    // Update form when initialValues change
    useEffect(() => {
        if (initialValues) {
            form.reset({
                ...defaultValues,
                ...initialValues
            })
        }
    }, [initialValues])

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* v2 Feature: Platform Selector (Disabled for v1 Launch) */}
                    {/* <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select onValueChange={(value) => form.setValue("platform", value as any)} defaultValue={defaultValues.platform}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="app_store">App Store Screenshot</SelectItem>
                                <SelectItem value="twitter">Twitter Thread</SelectItem>
                                <SelectItem value="linkedin">LinkedIn Post</SelectItem>
                                <SelectItem value="instagram">Instagram Caption</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    <div className="space-y-2">
                        <Label htmlFor="appName">App Name</Label>
                        <Input
                            id="appName"
                            placeholder="e.g. ScreenCopy.ai"
                            {...form.register("appName")}
                        />
                        {form.formState.errors.appName && (
                            <p className="text-sm text-red-500">{form.formState.errors.appName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={(value) => form.setValue("category", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="productivity">Productivity</SelectItem>
                                    <SelectItem value="game">Game</SelectItem>
                                    <SelectItem value="social">Social</SelectItem>
                                    <SelectItem value="health">Health & Fitness</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.category && (
                                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select onValueChange={(value) => form.setValue("language", value)} defaultValue="English">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Korean">Korean</SelectItem>
                                    <SelectItem value="Japanese">Japanese</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                    <SelectItem value="German">German</SelectItem>
                                    <SelectItem value="Chinese">Chinese</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.language && (
                                <p className="text-sm text-red-500">{form.formState.errors.language.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">App Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What does your app do?"
                            {...form.register("description")}
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keywords">ASO Keywords (Optional)</Label>
                        <Input
                            id="keywords"
                            placeholder="e.g. Fast, Secure, AI, Productivity (comma separated)"
                            {...form.register("keywords")}
                        />
                        <p className="text-xs text-muted-foreground">Keywords you want to include in the copy.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Input
                            id="targetAudience"
                            placeholder="e.g. Indie developers, Students"
                            {...form.register("targetAudience")}
                        />
                        {form.formState.errors.targetAudience && (
                            <p className="text-sm text-red-500">{form.formState.errors.targetAudience.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Tone of Voice</Label>
                        <RadioGroup
                            defaultValue="professional"
                            onValueChange={(value) => form.setValue("tone", value as ContextFormData['tone'])}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="professional" id="professional" className="peer sr-only" />
                                <Label
                                    htmlFor="professional"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    Professional
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="casual" id="casual" className="peer sr-only" />
                                <Label
                                    htmlFor="casual"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    Casual
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="playful" id="playful" className="peer sr-only" />
                                <Label
                                    htmlFor="playful"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    Playful
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="inspirational" id="inspirational" className="peer sr-only" />
                                <Label
                                    htmlFor="inspirational"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    Inspirational
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Generating..." : "Generate Copy"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
