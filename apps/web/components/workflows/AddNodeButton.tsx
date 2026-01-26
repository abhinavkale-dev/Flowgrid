'use client'

import { DrawerTrigger } from '@/components/ui/drawer'

export function AddNodeButton() {
    return (
        <div className="absolute top-4 right-4 z-10">
            <DrawerTrigger asChild>
                <button
                    className="rounded-full bg-white/10 hover:bg-white/20 p-3 transition-colors shadow-lg border border-white/20"
                    aria-label="Add node"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="24px"
                        height="24px"
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h14m-7-7v14"
                            className="text-white"
                        />
                    </svg>
                </button>
            </DrawerTrigger>
        </div>
    )
}
