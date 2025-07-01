"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Edit, Eye, FileText, Plus, Search, Trash2, Download } from "lucide-react"
import { AppSidebar } from "../../components/app-sidebar"
import { BudgetFormV2 as BudgetForm, type Budget } from "../../components/budget-form-v2"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { getBudgets, createBudget, updateBudget, deleteBudget, generateBudgetNumber } from "../../lib/database/budgets"
import { createRental } from "../../lib/database/rentals"
import { transformBudgetFromDB } from "../../lib/utils/data-transformers"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isApproving, setIsApproving] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const dbBudgets = await getBudgets()
      const transformedBudgets = dbBudgets.map(transformBudgetFromDB)
      setBudgets(transformedBudgets)
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error)
      alert("Erro ao carregar orçamentos. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = budgets

    if (searchTerm) {
      filtered = filtered.filter(
        (budget) =>
          budget.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          budget.status.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredBudgets(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  // Aplicar filtros sempre que searchTerm ou budgets mudarem
  useEffect(() => {
    applyFilters()
  }, [searchTerm, budgets])

  const handleSaveBudget = async (budgetData: Omit<Budget, "id" | "number" | "createdAt"> & { id?: string }) => {
    try {
      let budgetNumber = ""

      if (budgetData.id) {
        // Editando orçamento existente
        budgetNumber = budgets.find((b) => b.id === budgetData.id)?.number || ""
      } else {
        // Criando novo orçamento
        budgetNumber = await generateBudgetNumber()
      }

      const dbBudgetData = {
        number: budgetNumber,
        client_id: budgetData.clientId,
        client_name: budgetData.clientName,
        start_date: budgetData.startDate,
        end_date: budgetData.endDate,
        installation_time: budgetData.installationTime || null,
        removal_time: budgetData.removalTime || null,
        installation_location: budgetData.installationLocation || null,
        subtotal: budgetData.subtotal,
        discount: budgetData.discount,
        total_value: budgetData.totalValue,
        status: budgetData.status,
        observations: budgetData.observations || null,
      }

      const items = budgetData.items.map((item) => ({
        equipment_name: item.equipmentName,
        quantity: item.quantity,
        daily_rate: item.dailyRate,
        days: item.days,
        total: item.total,
      }))

      if (budgetData.id) {
        await updateBudget(budgetData.id, dbBudgetData, items)
      } else {
        await createBudget(dbBudgetData, items)
      }

      await loadBudgets()
      setEditingBudget(undefined)
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error)
      alert("Erro ao salvar orçamento. Tente novamente.")
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setIsFormOpen(true)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleApproveBudget = async (id: string) => {
    const budget = budgets.find((b) => b.id === id)
    if (budget) {
      try {
        setIsApproving(id)

        // Criar contrato de locação automaticamente
        const rentalData = {
          client_id: budget.clientId,
          client_name: budget.clientName,
          start_date: budget.startDate,
          end_date: budget.endDate,
          installation_time: budget.installationTime || "08:00",
          removal_time: budget.removalTime || "18:00",
          installation_location: budget.installationLocation || null,
          total_value: budget.totalValue,
          discount: budget.discount,
          final_value: budget.totalValue - budget.discount,
          status: "Instalação Pendente" as const,
          observations: budget.observations || null,
          budget_id: budget.id,
        }

        const rentalItems = budget.items.map((item) => ({
          equipment_name: item.equipmentName,
          quantity: item.quantity,
          daily_rate: item.dailyRate,
          days: item.days,
          total: item.total,
        }))

        await createRental(rentalData, rentalItems)

        // Remover o orçamento da lista (já que foi aprovado)
        await deleteBudget(id)
        await loadBudgets()

        alert(`Orçamento ${budget.number} aprovado! Contrato criado e eventos adicionados à agenda.`)

        setTimeout(() => {
          router.push("/locacoes")
        }, 1500)
      } catch (error) {
        console.error("Erro ao aprovar orçamento:", error)
        alert("Erro ao aprovar orçamento. Tente novamente.")
      } finally {
        setIsApproving(null)
      }
    }
  }

  const handleViewBudget = (budget: Budget) => {
    setViewingBudget(budget)
    setViewDialogOpen(true)
  }

  const handleGeneratePDF = (budget: Budget) => {
    // Simular geração de PDF
    alert(`PDF do orçamento ${budget.number} seria gerado aqui`)
  }

  const confirmDelete = async () => {
    if (budgetToDelete) {
      try {
        setIsDeleting(true)
        await deleteBudget(budgetToDelete)
        await loadBudgets()
      } catch (error) {
        console.error("Erro ao deletar orçamento:", error)
        alert("Erro ao deletar orçamento. Tente novamente.")
      } finally {
        setIsDeleting(false)
        setDeleteDialogOpen(false)
        setBudgetToDelete(null)
      }
    }
  }

  const getStatusBadge = (status: Budget["status"]) => {
    const styles = {
      Pendente: "bg-accent/10 text-accent",
      Aprovado: "bg-primary/10 text-primary",
      Rejeitado: "bg-red-100 text-red-800",
    }
    return styles[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-black">Orçamentos</h1>
                <p className="text-sm text-gray-600">Gerencie orçamentos pendentes de aprovação</p>
              </div>
            </div>
          </header>
          <main className="flex-1 space-y-6 p-6 bg-gray-50">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando orçamentos...</p>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
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
              <h1 className="text-lg font-semibold text-black">Orçamentos</h1>
              <p className="text-sm text-gray-600">Gerencie orçamentos pendentes de aprovação</p>
            </div>
            <Button
              onClick={() => {
                setEditingBudget(undefined)
                setIsFormOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6 bg-gray-50">
          {/* Busca */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Buscar Orçamentos</CardTitle>
              <CardDescription>Encontre orçamentos por número, cliente ou status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar orçamentos..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  {filteredBudgets.length} orçamento(s) encontrado(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Orçamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Lista de Orçamentos</CardTitle>
              <CardDescription>Todos os orçamentos cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Número</TableHead>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Valor Total</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium text-black">{budget.number}</div>
                              <div className="text-sm text-gray-600">{budget.items.length} item(s)</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-black">{budget.clientName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(budget.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">R$ {budget.totalValue.toFixed(2).replace(".", ",")}</div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(budget.status)}`}
                          >
                            {budget.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {budget.status === "Pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveBudget(budget.id)}
                                className="text-primary hover:text-primary hover:bg-primary/10"
                                title="Aprovar"
                                disabled={isApproving === budget.id}
                              >
                                {isApproving === budget.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBudget(budget)}
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePDF(budget)}
                              title="Gerar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditBudget(budget)} title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredBudgets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? "Nenhum orçamento encontrado com os termos de busca."
                      : "Nenhum orçamento cadastrado ainda."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Formulário de Orçamento */}
        <BudgetForm open={isFormOpen} onOpenChange={setIsFormOpen} budget={editingBudget} onSave={handleSaveBudget} />

        {/* Dialog de Visualização */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-black">Resumo do Orçamento</DialogTitle>
              <DialogDescription>
                {viewingBudget?.number} - {viewingBudget?.clientName}
              </DialogDescription>
            </DialogHeader>
            {viewingBudget && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Data de Criação:</span>
                    <p>{formatDate(viewingBudget.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewingBudget.status)}`}
                      >
                        {viewingBudget.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Itens:</h4>
                  <div className="space-y-2">
                    {viewingBudget.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.equipmentName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}x • {item.days} dia(s) • R$ {item.dailyRate.toFixed(2)}/dia
                          </p>
                        </div>
                        <span className="font-medium">R$ {item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t font-semibold text-lg">
                  <span>Total Geral:</span>
                  <span className="text-primary">R$ {viewingBudget.totalValue.toFixed(2)}</span>
                </div>

                {viewingBudget.observations && (
                  <div>
                    <h4 className="font-medium mb-2">Observações:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{viewingBudget.observations}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
