export const dynamic = "force-dynamic"

import { getDashboardSummary, getTransactions } from "@/actions/transaction"
import DashboardClient from "./_components/DashboardClient"

export default async function Home() {
  const currentPeriod = new Date().toISOString().slice(0, 7) // ex: 2026-03

  // Pegamos todos os períodos existentes pra preencher o filtro
  const allTransactions = await getTransactions()
  const availablePeriods = (Array.from(new Set(allTransactions.map((t: { period: string }) => t.period))) as string[]).sort().reverse()

  if (!availablePeriods.includes(currentPeriod)) {
    availablePeriods.unshift(currentPeriod)
  }

  // Pegamos o sumário do mês atual inicialmente
  const initialSummary = await getDashboardSummary(currentPeriod)

  return (
    <main className="min-h-screen pb-24 bg-background">
      <DashboardClient
        initialSummary={initialSummary}
        initialPeriod={currentPeriod}
      />
    </main>
  )
}
