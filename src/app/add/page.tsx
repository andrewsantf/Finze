"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createTransaction } from "@/actions/transaction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Repeat } from "lucide-react"
import Link from "next/link"

const MONTHS = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
]

const generateYears = () => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        years.push(i.toString())
    }
    return years
}

type TxType = "INCOME" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE"

export default function AddTransactionPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<TxType>("VARIABLE_EXPENSE")
    const currentD = new Date()
    const currentMonth = String(currentD.getMonth() + 1).padStart(2, '0')
    const currentYear = currentD.getFullYear().toString()

    const [month, setMonth] = useState(currentMonth)
    const [year, setYear] = useState(currentYear)
    const availableYears = useState(generateYears)[0]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !description || !month || !year) return

        const numericAmount = parseFloat(amount.replace(",", "."))
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Por favor insira um valor válido.")
            return
        }

        startTransition(async () => {
            const result = await createTransaction({
                amount: numericAmount,
                description,
                type,
                period: `${year}-${month}`
            })

            if (result.success) {
                router.push("/")
            } else {
                alert(result.error)
            }
        })
    }

    return (
        <main className="min-h-screen pb-24 bg-background">
            <div className="flex flex-col gap-6 p-4 pt-12 max-w-md mx-auto relative">
                <header className="flex items-center gap-3 mb-4">
                    <Link href="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Novo Lançamento</h1>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Valor Focus */}
                    <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/20 shadow-[inner_0_0_20px_rgba(16,185,129,0.05)] mb-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                        <label className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-2 z-10">Qual o valor?</label>
                        <div className="flex items-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 z-10">
                            <span className="text-2xl text-white/30 mr-2 font-bold tracking-tighter">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="bg-transparent border-none outline-none text-center w-full max-w-[180px] text-white placeholder:text-white/20 caret-primary"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {/* Tipo de Lançamento */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setType("INCOME")}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border backdrop-blur-md transition-all ${type === "INCOME" ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-card/30 border-border/50 text-muted-foreground hover:bg-card/50'}`}
                        >
                            <ArrowUpCircle size={20} strokeWidth={2.5} />
                            <span className="text-[10px] font-semibold tracking-wide uppercase">Entrada</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("FIXED_EXPENSE")}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border backdrop-blur-md transition-all ${type === "FIXED_EXPENSE" ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-card/30 border-border/50 text-muted-foreground hover:bg-card/50'}`}
                        >
                            <Repeat size={20} strokeWidth={2.5} />
                            <span className="text-[10px] font-semibold tracking-wide uppercase">Fixa</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("VARIABLE_EXPENSE")}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border backdrop-blur-md transition-all ${type === "VARIABLE_EXPENSE" ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-card/30 border-border/50 text-muted-foreground hover:bg-card/50'}`}
                        >
                            <ArrowDownCircle size={20} strokeWidth={2.5} />
                            <span className="text-[10px] font-semibold tracking-wide uppercase">Variável</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Nome (Descrição)</label>
                            <Input
                                placeholder="Ex: Aluguel, Supermercado..."
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Competência</label>
                            <div className="grid grid-cols-2 gap-3">
                                <Select value={month} onValueChange={setMonth} disabled={isPending}>
                                    <SelectTrigger className="w-full h-12 bg-card/10 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-sm focus:ring-1 focus:ring-primary outline-none">
                                        <SelectValue placeholder="Mês" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map(m => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={year} onValueChange={setYear} disabled={isPending}>
                                    <SelectTrigger className="w-full h-12 bg-card/10 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-sm focus:ring-1 focus:ring-primary outline-none">
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map(y => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-4 rounded-xl text-md"
                        disabled={isPending}
                    >
                        {isPending ? "Salvando..." : "Salvar Lançamento"}
                    </Button>
                </form>

            </div>
        </main>
    )
}
