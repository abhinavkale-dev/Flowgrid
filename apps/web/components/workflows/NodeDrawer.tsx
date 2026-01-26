'use client'

import {
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerClose
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { MousePointer, Globe, X } from 'lucide-react'

interface NodeDrawerProps {
    onAddNode: (nodeType: string, label: string) => void
}

const triggers = [
    {
        type: 'manualTrigger',
        label: 'Manual Trigger',
        description: 'Start the workflow manually',
        icon: <MousePointer className="size-5" />,
    },
    {
        type: 'googleFormTrigger',
        label: 'Google Form Trigger',
        description: 'Runs the workflow when a form submission is received',
        icon: <img alt="Google Form Trigger" width={20} height={20} src="/logo/google-form.svg" className="size-5 object-contain rounded-sm" />,
    },
    {
        type: 'stripeTrigger',
        label: 'Stripe Event',
        description: 'Runs the workflow when a Stripe event is received',
        icon: <img alt="Stripe Event" width={20} height={20} src="/logo/stripe.svg" className="size-5 object-contain rounded-sm" />,
    },
]

const actions = [
    {
        type: 'aiNode',
        label: 'AI Node',
        description: 'Analyze documents with AI',
        icon: <div className="w-5 h-5 flex items-center justify-center text-[#999] font-bold text-xs">AI</div>,
    },
    {
        type: 'httpTrigger',
        label: 'HTTP Request',
        description: 'Make an HTTP request',
        icon: <Globe className="size-5" />,
    },
    {
        type: 'geminiNode',
        label: 'Gemini',
        description: 'Make a request to the Gemini API',
        icon: <img alt="Gemini" width={20} height={20} src="/logo/gemini.svg" className="size-5 object-contain rounded-sm" />,
    },
    {
        type: 'openaiNode',
        label: 'OpenAI',
        description: 'Make a request to the OpenAI API',
        icon: <img alt="OpenAI" width={20} height={20} src="/logo/openai.svg" className="size-5 object-contain rounded-sm" />,
    },
    {
        type: 'anthropicNode',
        label: 'Anthropic',
        description: 'Make a request to the Anthropic API',
        icon: <img alt="Anthropic" width={20} height={20} src="/logo/anthropic.svg" className="size-5 object-contain rounded-sm" />,
    },
    {
        type: 'discordNode',
        label: 'Discord',
        description: 'Make a request to the Discord API',
        icon: <img alt="Discord" width={20} height={20} src="/logo/discord.svg" className="size-5 object-contain rounded-sm" />,
    },
    {
        type: 'slackNode',
        label: 'Slack',
        description: 'Make a request to the Slack API',
        icon: <img alt="Slack" width={20} height={20} src="/logo/slack.svg" className="size-5 object-contain rounded-sm" />,
    },
]

export function NodeDrawer({ onAddNode }: NodeDrawerProps) {
    return (
        <DrawerContent style={{ backgroundColor: '#2D2D2E' }}>
            <DrawerHeader className="flex flex-col gap-1.5 p-4">
                <DrawerTitle className="text-foreground font-semibold">
                    What triggers this workflow?
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground text-sm">
                    A trigger is a way to start the workflow.
                </DrawerDescription>
            </DrawerHeader>

            <div>
                {triggers.map((node) => (
                    <button
                        key={node.type}
                        type="button"
                        onClick={() => onAddNode(node.type, node.label)}
                        className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary text-left"
                        aria-label={`Add ${node.label} trigger`}
                    >
                        <div className="flex items-center gap-6 w-full overflow-hidden">
                            {node.icon}
                            <div className="flex flex-col items-start text-left">
                                <span className="font-medium text-sm">{node.label}</span>
                                <span className="text-xs text-muted-foreground">{node.description}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <Separator className="bg-border" />

            <div>
                {actions.map((node) => (
                    <button
                        key={node.type}
                        type="button"
                        onClick={() => onAddNode(node.type, node.label)}
                        className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary text-left"
                        aria-label={`Add ${node.label} action`}
                    >
                        <div className="flex items-center gap-6 w-full overflow-hidden">
                            {node.icon}
                            <div className="flex flex-col items-start text-left">
                                <span className="font-medium text-sm">{node.label}</span>
                                <span className="text-xs text-muted-foreground">{node.description}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <DrawerClose asChild>
                <button type="button" className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                </button>
            </DrawerClose>
        </DrawerContent>
    )
}
