"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { href: "/", icon: Home, label: "Início" },
        { href: "/add", icon: PlusCircle, label: "Lançar" },
        // Apenas os 2 principais como pedido ou podemos ter um terceiro.
        // { href: "/settings", icon: Settings, label: "Ajustes" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
            <nav className="mx-auto max-w-sm bg-[#121417]/80 backdrop-blur-xl border border-emerald-900/40 shadow-[0_8px_32px_rgba(4,20,11,0.5)] rounded-full px-6 py-4 flex justify-between items-center pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon size={24} className={isActive ? "fill-primary/20" : ""} />
                            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
