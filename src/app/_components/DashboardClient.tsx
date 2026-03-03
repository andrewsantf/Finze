"use client"

import { useState, useTransition } from "react"
import { getDashboardSummary } from "@/actions/transaction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import { deleteTransaction } from "@/actions/transaction"

const MONTHS = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Fev" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Abr" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Ago" },
    { value: "09", label: "Set" },
    { value: "10", label: "Out" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dez" },
]

const generateYears = () => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        years.push(i.toString())
    }
    return years
}

type Transaction = {
    id: string
    amount: number
    type: string
    description: string
    date: Date
    period: string
}

type Summary = {
    income: number
    fixedExpenses: number
    variableExpenses: number
    totalExpenses: number
    balance: number
    transactions: Transaction[]
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export default function DashboardClient({
    initialSummary,
    initialPeriod
}: {
    initialSummary: Summary,
    initialPeriod: string
}) {
    const isTotal = initialPeriod === "ALL"
    const currentMonth = isTotal ? String(new Date().getMonth() + 1).padStart(2, '0') : initialPeriod.split("-")[1]
    const currentYear = isTotal ? new Date().getFullYear().toString() : initialPeriod.split("-")[0]

    const [month, setMonth] = useState(currentMonth)
    const [year, setYear] = useState(currentYear)
    const [filterType, setFilterType] = useState<"MONTH" | "ALL">(isTotal ? "ALL" : "MONTH")
    const availableYears = useState(generateYears)[0]

    const [summary, setSummary] = useState<Summary>(initialSummary)
    const [isPending, startTransition] = useTransition()

    const applyFilter = (newFilterType: "MONTH" | "ALL", newMonth: string, newYear: string) => {
        setFilterType(newFilterType)
        setMonth(newMonth)
        setYear(newYear)

        startTransition(async () => {
            const p = newFilterType === "ALL" ? undefined : `${newYear}-${newMonth}`
            const newSummary = await getDashboardSummary(p)
            setSummary(newSummary)
        })
    }

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja deletar?")) {
            await deleteTransaction(id)
            const p = filterType === "ALL" ? undefined : `${year}-${month}`
            const newSummary = await getDashboardSummary(p)
            setSummary(newSummary)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4 pt-12 max-w-md mx-auto relative">
            <header className="flex flex-col gap-4 mb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Finze</h1>
                        <p className="text-muted-foreground text-sm">Visão Geral</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select
                        value={filterType}
                        onValueChange={(val: "MONTH" | "ALL") => applyFilter(val, month, year)}
                        disabled={isPending}
                    >
                        <SelectTrigger className="w-[140px] bg-card/50 backdrop-blur-md text-foreground text-xs font-semibold rounded-full px-4 py-2 border border-border/50 shadow-sm outline-none ring-primary focus:ring-1 cursor-pointer">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MONTH">Por Mês</SelectItem>
                            <SelectItem value="ALL">Total de Tudo</SelectItem>
                        </SelectContent>
                    </Select>

                    {filterType === "MONTH" && (
                        <>
                            <Select
                                value={month}
                                onValueChange={(val) => applyFilter("MONTH", val, year)}
                                disabled={isPending}
                            >
                                <SelectTrigger className="w-[100px] bg-card/50 backdrop-blur-md text-foreground text-xs font-semibold rounded-full px-4 py-2 border border-border/50 shadow-sm outline-none ring-primary focus:ring-1 cursor-pointer">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={year}
                                onValueChange={(val) => applyFilter("MONTH", month, val)}
                                disabled={isPending}
                            >
                                <SelectTrigger className="w-[90px] bg-card/50 backdrop-blur-md text-foreground text-xs font-semibold rounded-full px-4 py-2 border border-border/50 shadow-sm outline-none ring-primary focus:ring-1 cursor-pointer">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableYears.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                </div>
            </header>

            <div className="flex flex-col gap-4">
                {/* 1. Entradas (O que entrou) */}
                <Card className="bg-emerald-950/20 backdrop-blur-md border border-emerald-900/30 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-10">
                        <TrendingUp size={48} className="-mr-2 -mt-2 text-emerald-500" />
                    </div>
                    <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-xs text-emerald-500 uppercase tracking-widest font-semibold flex items-center gap-2">
                            <TrendingUp size={14} /> Entrou (Receitas)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-emerald-50 tracking-tight">{formatCurrency(summary.income)}</div>
                    </CardContent>
                </Card>

                {/* 2. Saídas (O que saiu) */}
                <Card className="bg-rose-950/20 backdrop-blur-md border border-rose-900/30 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-10">
                        <TrendingDown size={48} className="-mr-2 -mt-2 text-rose-500" />
                    </div>
                    <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-xs text-rose-500 uppercase tracking-widest font-semibold flex items-center gap-2">
                            <TrendingDown size={14} /> Saiu (Despesas)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-rose-50 tracking-tight mb-2">{formatCurrency(summary.totalExpenses)}</div>
                        <div className="flex gap-3 text-[11px] font-medium text-rose-200/50">
                            <div className="bg-rose-900/20 px-2 py-0.5 rounded border border-rose-900/30">Fixas: <span className="text-rose-200/80">{formatCurrency(summary.fixedExpenses)}</span></div>
                            <div className="bg-rose-900/20 px-2 py-0.5 rounded border border-rose-900/30">Variáveis: <span className="text-rose-200/80">{formatCurrency(summary.variableExpenses)}</span></div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Saldo (O que sobrou) */}
                <Card className="bg-gradient-to-br from-[#0c2e1b] via-[#101412] to-[#0A0C10] border border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-white items-center overflow-hidden relative mt-2">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={80} className="-mr-2 -mt-4 text-primary" />
                    </div>
                    <div className="absolute -left-10 -top-10 w-24 h-24 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                    <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-white/70 text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
                            <Wallet size={14} className="text-primary" /> Sobrou (Saldo)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 leading-tight">
                            {formatCurrency(summary.balance)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recentes */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Lançamentos</h2>
                    <span className="text-xs text-muted-foreground">{summary.transactions.length} Registros</span>
                </div>

                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 pb-4 scrollbar-thin">
                    {isPending ? (
                        <div className="text-center text-sm text-muted-foreground py-8 animate-pulse">Carregando...</div>
                    ) : summary.transactions.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">Nenhum lançamento encontrado.</div>
                    ) : (
                        summary.transactions.map(t => (
                            <Card key={t.id} className="p-4 flex items-center justify-between bg-card/30 backdrop-blur-xl border-border/40 hover:bg-card/50 transition-colors">
                                <div>
                                    <p className="font-medium text-sm text-foreground/90">{t.description}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(t.date).toLocaleDateString('pt-BR')} • {
                                            t.type === "INCOME" ? "Entrada" :
                                                t.type === "FIXED_EXPENSE" ? "Fixa" : "Variável"
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-semibold text-sm tracking-wide ${t.type === "INCOME" ? "text-primary" : "text-destructive"}`}>
                                        {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                                    </span>
                                    <button onClick={() => handleDelete(t.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

        </div>
    )
}
