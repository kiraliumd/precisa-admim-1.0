import { supabase } from "../supabase"

export interface DashboardMetrics {
  pendingBudgets: number
  activeRentals: number
  monthlyRevenue: number
  scheduledEvents: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Orçamentos pendentes
    const { count: pendingBudgets } = await supabase
      .from("budgets")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pendente")

    // Locações ativas
    const { count: activeRentals } = await supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .in("status", ["Instalação Pendente", "Instalado", "Em Andamento"])

    // Faturamento do mês atual
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const { data: monthlyData } = await supabase
      .from("rentals")
      .select("total_value")
      .gte("created_at", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
      .lt("created_at", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)

    const monthlyRevenue = monthlyData?.reduce((sum, rental) => sum + (rental.total_value || 0), 0) || 0

    // Eventos agendados (próximos 30 dias)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { count: scheduledEvents } = await supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .gte("event_date", new Date().toISOString().split("T")[0])
      .lte("event_date", thirtyDaysFromNow.toISOString().split("T")[0])

    return {
      pendingBudgets: pendingBudgets || 0,
      activeRentals: activeRentals || 0,
      monthlyRevenue,
      scheduledEvents: scheduledEvents || 0,
    }
  } catch (error) {
    console.error("Erro ao buscar métricas do dashboard:", error)
    return {
      pendingBudgets: 0,
      activeRentals: 0,
      monthlyRevenue: 0,
      scheduledEvents: 0,
    }
  }
}
