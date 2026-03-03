"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type TransactionInput = {
    amount: number
    type: "INCOME" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE"
    description: string
    period: string
}

export async function createTransaction(data: TransactionInput) {
    try {
        const transaction = await prisma.transaction.create({
            data: {
                amount: data.amount,
                type: data.type,
                description: data.description,
                period: data.period, // Ex: "2026-03"
            },
        })
        revalidatePath("/")
        return { success: true, data: transaction }
    } catch (error: any) {
        const urlStr = process.env.DATABASE_URL || "VAZIO"
        const isQuoted = urlStr.startsWith('"') || urlStr.startsWith("'")
        console.error(`=> CREATE DIAGNOSTICO: URL Carregada: ${urlStr.substring(0, 15)}... Aspas?: ${isQuoted}`)
        const errMsg = error?.message ? error.message.replace(/\n/g, ' | ') : String(error)
        console.error("Failed to create transaction: ", errMsg)
        return { success: false, error: "Falha ao criar transação." }
    }
}

export async function getTransactions(period?: string) {
    try {
        const where = period ? { period } : {}
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: "desc" },
        })
        return transactions
    } catch (error: any) {
        const urlStr = process.env.DATABASE_URL || "VAZIO"
        const isQuoted = urlStr.startsWith('"') || urlStr.startsWith("'")
        console.error(`=> DIAGNOSTICO: URL Carregada: ${urlStr.substring(0, 15)}... Aspas?: ${isQuoted}`)
        const errMsg = error?.message ? error.message.replace(/\n/g, ' | ') : String(error)
        console.error("Failed to get transactions: ", errMsg)
        return []
    }
}

export async function deleteTransaction(id: string) {
    try {
        await prisma.transaction.delete({
            where: { id },
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete transaction", error)
        return { success: false, error: "Falha ao deletar transação." }
    }
}

export async function getDashboardSummary(period?: string) {
    try {
        const transactions = await getTransactions(period)

        let income = 0
        let fixedExpenses = 0
        let variableExpenses = 0

        transactions.forEach((t: any) => {
            if (t.type === "INCOME") income += t.amount
            else if (t.type === "FIXED_EXPENSE") fixedExpenses += t.amount
            else if (t.type === "VARIABLE_EXPENSE") variableExpenses += t.amount
        })

        const totalExpenses = fixedExpenses + variableExpenses
        const balance = income - totalExpenses

        return { income, fixedExpenses, variableExpenses, totalExpenses, balance, transactions }
    } catch (error) {
        console.error("Failed to compute summary", error)
        return { income: 0, fixedExpenses: 0, variableExpenses: 0, totalExpenses: 0, balance: 0, transactions: [] }
    }
}
