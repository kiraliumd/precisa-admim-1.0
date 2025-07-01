"use client"

import { useState, useEffect } from "react"
import { Calendar, DollarSign, FileText, TrendingUp, Users, Package } from "lucide-react"
import { AppSidebar } from "../../components/app-sidebar"
import { MetricCard } from "../../components/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

// Dados mockados para relatórios
const mockRentals = [
  {
    id: "1",
    clientId: "1",
    clientName: "Maria Silva Santos",
    startDate: "2024-12-01",
    endDate: "2024-12-02",
    finalValue: 1500,
    status: "Concluído",
    items: [
      { equipmentName: "Mesa de Som Yamaha MG16XU", quantity: 1 },
      { equipmentName: "Kit Iluminação LED RGB", quantity: 2 },
    ],
  },
  {
    id: "2",
    clientId: "3",
    clientName: "Eventos & Cia Ltda",
    startDate: "2024-12-05",
    endDate: "2024-12-07",
    finalValue: 1215,
    status: "Concluído",
    items: [
      { equipmentName: "Projetor Epson 5000 Lumens", quantity: 1 },
      { equipmentName: "Tenda 10x10m", quantity: 1 },
    ],
  },
  {
    id: "3",
    clientId: "2",
    clientName: "João Pedro Oliveira",
    startDate: "2024-12-08",
    endDate: "2024-12-08",
    finalValue: 480,
    status: "Concluído",
    items: [{ equipmentName: "Caixa de Som JBL SRX815P", quantity: 4 }],
  },
  {
    id: "4",
    clientId: "4",
    clientName: "Ana Costa Ferreira",
    startDate: "2024-12-10",
    endDate: "2024-12-11",
    finalValue: 3200,
    status: "Concluído",
    items: [
      { equipmentName: "Kit Iluminação LED RGB", quantity: 3 },
      { equipmentName: "Moving Head LED", quantity: 2 },
      { equipmentName: "Caixa de Som JBL SRX815P", quantity: 2 },
    ],
  },
  {
    id: "5",
    clientId: "1",
    clientName: "Maria Silva Santos",
    startDate: "2024-12-12",
    endDate: "2024-12-13",
    finalValue: 2800,
    status: "Concluído",
    items: [
      { equipmentName: "Mesa de Som Yamaha MG16XU", quantity: 1 },
      { equipmentName: "Projetor Epson 5000 Lumens", quantity: 1 },
      { equipmentName: "Telão 3x2m", quantity: 1 },
    ],
  },
  {
    id: "6",
    clientId: "5",
    clientName: "Tech Solutions Corp",
    startDate: "2024-12-14",
    endDate: "2024-12-15",
    finalValue: 1800,
    status: "Concluído",
    items: [
      { equipmentName: "Projetor Epson 5000 Lumens", quantity: 2 },
      { equipmentName: "Microfone Sem Fio", quantity: 4 },
    ],
  },
  {
    id: "7",
    clientId: "3",
    clientName: "Eventos & Cia Ltda",
    startDate: "2024-12-16",
    endDate: "2024-12-17",
    finalValue: 2400,
    status: "Concluído",
    items: [
      { equipmentName: "Kit Iluminação LED RGB", quantity: 2 },
      { equipmentName: "Tenda 10x10m", quantity: 2 },
    ],
  },
  {
    id: "8",
    clientId: "2",
    clientName: "João Pedro Oliveira",
    startDate: "2024-12-18",
    endDate: "2024-12-19",
    finalValue: 950,
    status: "Concluído",
    items: [
      { equipmentName: "Caixa de Som JBL SRX815P", quantity: 2 },
      { equipmentName: "Microfone Sem Fio", quantity: 2 },
    ],
  },
]

const mockBudgets = [
  {
    id: "1",
    clientName: "Carlos Eduardo Lima",
    createdAt: "2024-12-02",
    totalValue: 1200,
    status: "Aprovado",
  },
  {
    id: "2",
    clientName: "Fernanda Santos",
    createdAt: "2024-12-05",
    totalValue: 2500,
    status: "Aprovado",
  },
  {
    id: "3",
    clientName: "Roberto Silva",
    createdAt: "2024-12-08",
    totalValue: 1800,
    status: "Aprovado",
  },
  {
    id: "4",
    clientName: "Lucia Oliveira",
    createdAt: "2024-12-12",
    totalValue: 3200,
    status: "Aprovado",
  },
  {
    id: "5",
    clientName: "Pedro Costa",
    createdAt: "2024-12-15",
    totalValue: 1500,
    status: "Aprovado",
  },
  {
    id: "6",
    clientName: "Amanda Ferreira",
    createdAt: "2024-12-18",
    totalValue: 2200,
    status: "Aprovado",
  },
]

const periodOptions = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "custom", label: "Período personalizado" },
]

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filteredRentals, setFilteredRentals] = useState(mockRentals)
  const [filteredBudgets, setFilteredBudgets] = useState(mockBudgets)

  // Calcular datas baseado no período selecionado
  const calculateDateRange = () => {
    const today = new Date()
    let start: Date
    let end: Date = today

    if (selectedPeriod === "custom") {
      if (startDate && endDate) {
        start = new Date(startDate)
        end = new Date(endDate)
      } else {
        return { start: null, end: null }
      }
    } else {
      const days = Number.parseInt(selectedPeriod)
      start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
    }

    return { start, end }
  }

  // Aplicar filtros
  const applyFilters = () => {
    const { start, end } = calculateDateRange()

    if (!start || !end) {
      setFilteredRentals([])
      setFilteredBudgets([])
      return
    }

    // Filtrar locações
    const filteredRentalData = mockRentals.filter((rental) => {
      const rentalDate = new Date(rental.startDate)
      return rentalDate >= start && rentalDate <= end && rental.status === "Concluído"
    })

    // Filtrar orçamentos
    const filteredBudgetData = mockBudgets.filter((budget) => {
      const budgetDate = new Date(budget.createdAt)
      return budgetDate >= start && budgetDate <= end && budget.status === "Aprovado"
    })

    setFilteredRentals(filteredRentalData)
    setFilteredBudgets(filteredBudgetData)
  }

  // Aplicar filtros quando período mudar
  useEffect(() => {
    applyFilters()
  }, [selectedPeriod, startDate, endDate])

  // Calcular métricas
  const totalRevenue = filteredRentals.reduce((sum, rental) => sum + rental.finalValue, 0)
  const contractsCount = filteredRentals.length
  const budgetsCount = filteredBudgets.length
  const averageTicket = contractsCount > 0 ? totalRevenue / contractsCount : 0

  // Top 3 clientes
  const getTopClients = () => {
    const clientStats = filteredRentals.reduce(
      (acc, rental) => {
        if (!acc[rental.clientName]) {
          acc[rental.clientName] = {
            name: rental.clientName,
            contracts: 0,
            totalValue: 0,
          }
        }
        acc[rental.clientName].contracts += 1
        acc[rental.clientName].totalValue += rental.finalValue
        return acc
      },
      {} as Record<string, { name: string; contracts: number; totalValue: number }>,
    )

    return Object.values(clientStats)
      .sort((a, b) => b.contracts - a.contracts)
      .slice(0, 3)
  }

  // Equipamentos mais alugados
  const getTopEquipments = () => {
    const equipmentStats = filteredRentals.reduce(
      (acc, rental) => {
        rental.items.forEach((item) => {
          if (!acc[item.equipmentName]) {
            acc[item.equipmentName] = {
              name: item.equipmentName,
              quantity: 0,
              rentals: 0,
            }
          }
          acc[item.equipmentName].quantity += item.quantity
          acc[item.equipmentName].rentals += 1
        })
        return acc
      },
      {} as Record<string, { name: string; quantity: number; rentals: number }>,
    )

    return Object.values(equipmentStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }

  const topClients = getTopClients()
  const topEquipments = getTopEquipments()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-black">Relatórios</h1>
              <p className="text-sm text-gray-600">Análise de desempenho e métricas do negócio</p>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6 bg-gray-50">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Filtros de Período</CardTitle>
              <CardDescription>Selecione o período para análise dos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 items-end">
                <div className="grid gap-2">
                  <Label htmlFor="period">Período</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPeriod === "custom" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Data Inicial</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">Data Final</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cards de Métricas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Contratos Fechados"
              value={contractsCount}
              icon={FileText}
              description="No período selecionado"
              variant="default"
            />
            <MetricCard
              title="Orçamentos Aprovados"
              value={budgetsCount}
              icon={TrendingUp}
              description="No período selecionado"
              variant="accent"
            />
            <MetricCard
              title="Receita Total"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
              description="Valor total faturado"
              variant="accent"
            />
            <MetricCard
              title="Ticket Médio"
              value={formatCurrency(averageTicket)}
              icon={Calendar}
              description="Valor médio por contrato"
              variant="default"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top 3 Clientes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Top 3 Clientes</CardTitle>
                <CardDescription>Clientes com maior número de contratos no período</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topClients.length > 0 ? (
                  topClients.map((client, index) => (
                    <div
                      key={client.name}
                      className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-black">{client.name}</p>
                          <p className="text-xs text-gray-600">{formatCurrency(client.totalValue)} em receita</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">{client.contracts} contratos</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Nenhum dado encontrado para o período selecionado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipamentos Mais Alugados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Equipamentos Mais Alugados</CardTitle>
                <CardDescription>Top 5 equipamentos por quantidade no período</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topEquipments.length > 0 ? (
                  topEquipments.map((equipment, index) => (
                    <div
                      key={equipment.name}
                      className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-black">{equipment.name}</p>
                          <p className="text-xs text-gray-600">{equipment.rentals} locações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">{equipment.quantity} unidades</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Nenhum dado encontrado para o período selecionado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo Detalhado */}
          {(filteredRentals.length > 0 || filteredBudgets.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contratos Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Contratos Fechados Recentes</CardTitle>
                  <CardDescription>Últimos contratos concluídos no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {filteredRentals.slice(0, 5).map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-black">{rental.clientName}</p>
                          <p className="text-sm text-gray-600">{formatDate(rental.startDate)}</p>
                        </div>
                        <span className="font-medium text-primary">{formatCurrency(rental.finalValue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Orçamentos Aprovados Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Orçamentos Aprovados Recentes</CardTitle>
                  <CardDescription>Últimos orçamentos aprovados no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {filteredBudgets.slice(0, 5).map((budget) => (
                      <div key={budget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-black">{budget.clientName}</p>
                          <p className="text-sm text-gray-600">{formatDate(budget.createdAt)}</p>
                        </div>
                        <span className="font-medium text-accent">{formatCurrency(budget.totalValue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
