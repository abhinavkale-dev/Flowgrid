'use client'

import { Card } from '@/components/ui/card'
import { DrawerTrigger } from '@/components/ui/drawer'

export function EmptyCanvasPrompt() {
    return (
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 z-10 pointer-events-none">
            <DrawerTrigger asChild>
                <Card
                    className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-white/50 hover:border-white/80 h-[100px] w-[100px] p-4 flex flex-col justify-center items-center pointer-events-auto"
                    style={{ backgroundColor: '#414243' }}
                >
                    <div className="rounded-full bg-white/10 p-2">
                        <svg
                            viewBox="0 0 24 24"
                            width="40px"
                            height="40px"
                            aria-hidden="true"
                            focusable="false"
                            role="img"
                            data-icon="plus"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h14m-7-7v14"
                                className="text-white/60"
                            />
                        </svg>
                    </div>
                </Card>
            </DrawerTrigger>
            <p className="text-sm text-white/70 pointer-events-auto">Add first step…</p>
        </div>
    )
}
