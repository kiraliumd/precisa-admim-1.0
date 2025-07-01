"use client"

import { useState, useEffect } from "react"
import { Edit, Eye, Plus, Search, Trash2, Clock, Calendar } from "lucide-react"
import { AppSidebar } from "../../components/app-sidebar"
import { RentalForm, type Rental } from "../../components/rental-form"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRentals, createRental, updateRental, deleteRental, searchRentals } from "../../lib/database/rentals"
import { transformRentalFromDB } from "../../lib/utils/data-transformers"

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRental, setEditingRental] = useState<Rental | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rentalToDelete, setRentalToDelete] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingRental, setViewingRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const statuses = ["Todos", "Instalação Pendente", "Ativo", "Concluído"]

  // Carregar locações do Supabase
  const loadRentals = async () => {
    try {
      setLoading(true)
      const data = await getRentals()
      const transformedRentals = data.map(transformRentalFromDB)
      setRentals(transformedRentals)
      setFilteredRentals(transformedRentals)
    } catch (error) {
      console.error("Erro ao carregar locações:", error)
      alert("Erro ao carregar locações. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados na inicialização
  useEffect(() => {
    loadRentals()
  }, [])

  // Aplicar filtros
  const applyFilters = async () => {
    try {
      const data = await searchRentals(searchTerm, statusFilter)
      const transformedRentals = data.map(transformRentalFromDB)
      setFilteredRentals(transformedRentals)
    } catch (error) {
      console.error("Erro ao filtrar locações:", error)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
  }

  // Aplicar filtros sempre que os valores mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const handleSaveRental = async (rentalData: Omit<Rental, "id"> & { id?: string }) => {
    try {
      setSaving(true)

      // Preparar dados para o banco
      const rentalForDB = {
        client_id: rentalData.clientId,
        client_name: rentalData.clientName,
        start_date: rentalData.startDate,
        end_date: rentalData.endDate,
        installation_time: rentalData.installationTime,
        removal_time: rentalData.removalTime,
        installation_location: rentalData.installationLocation || null,
        total_value: rentalData.totalValue,
        discount: rentalData.discount,
        final_value: rentalData.finalValue,
        status: rentalData.status,
        observations: rentalData.observations || null,
        budget_id: rentalData.budgetId || null,
      }

      const itemsForDB = rentalData.items.map((item) => ({
        equipment_name: item.equipmentName,
        quantity: item.quantity,
        daily_rate: item.dailyRate,
        days: item.days,
        total: item.total,
      }))

      if (rentalData.id) {
        // Editar locação existente
        await updateRental(rentalData.id, rentalForDB, itemsForDB)
        alert("Locação atualizada com sucesso!")
      } else {
        // Criar nova locação
        await createRental(rentalForDB, itemsForDB)
        alert("Locação criada com sucesso!")
      }

      // Recarregar dados
      await loadRentals()
      setEditingRental(undefined)
    } catch (error) {
      console.error("Erro ao salvar locação:", error)
      alert("Erro ao salvar locação. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleEditRental = (rental: Rental) => {
    setEditingRental(rental)
    setIsFormOpen(true)
  }

  const handleDeleteRental = (id: string) => {
    setRentalToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (rentalToDelete) {
      try {
        await deleteRental(rentalToDelete)
        alert("Locação excluída com sucesso!")
        await loadRentals()
      } catch (error) {
        console.error("Erro ao excluir locação:", error)
        alert("Erro ao excluir locação. Tente novamente.")
      }
    }
    setDeleteDialogOpen(false)
    setRentalToDelete(null)
  }

  const getStatusBadge = (status: Rental["status"]) => {
    const styles = {
      "Instalação Pendente": "bg-accent/10 text-accent",
      Ativo: "bg-primary/10 text-primary",
      Concluído: "bg-blue-100 text-blue-700",
    }
    return styles[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const handleViewRental = (rental: Rental) => {
    setViewingRental(rental)
    setViewDialogOpen(true)
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
              <h1 className="text-lg font-semibold text-black">Locações</h1>
              <p className="text-sm text-gray-600">Gerencie contratos de locação e equipamentos</p>
            </div>
            <Button
              onClick={() => {
                setEditingRental(undefined)
                setIsFormOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6 bg-gray-50">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Filtros</CardTitle>
              <CardDescription>Use os filtros para encontrar contratos específicos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar contratos..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center text-sm text-gray-600">
                  {filteredRentals.length} contrato(s) encontrado(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Locações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Lista de Contratos</CardTitle>
              <CardDescription>Todos os contratos de locação cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Período</TableHead>
                      <TableHead className="font-semibold">Horários</TableHead>
                      <TableHead className="font-semibold">Valor Total</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando locações...
                        </TableCell>
                      </TableRow>
                    ) : filteredRentals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhum contrato encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRentals.map((rental) => (
                        <TableRow key={rental.id}>
                          <TableCell>
                            <div className="font-medium text-black">{rental.clientName}</div>
                            <div className="text-sm text-gray-600">{rental.items.length} item(s)</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span>Inst: {formatTime(rental.installationTime)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-red-600" />
                                <span>Ret: {formatTime(rental.removalTime)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">R$ {rental.finalValue.toFixed(2).replace(".", ",")}</div>
                              {rental.discount > 0 && (
                                <div className="text-sm text-gray-600">
                                  Desc: R$ {rental.discount.toFixed(2).replace(".", ",")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(rental.status)}`}
                            >
                              {rental.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRental(rental)}
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRental(rental)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRental(rental.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Formulário de Contrato */}
        <RentalForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          rental={editingRental}
          onSave={handleSaveRental}
          saving={saving}
        />

        {/* Dialog de Visualização */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-black">Detalhes do Contrato</DialogTitle>
              <DialogDescription>{viewingRental?.clientName}</DialogDescription>
            </DialogHeader>
            {viewingRental && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Período:</span>
                    <p>
                      {formatDate(viewingRental.startDate)} - {formatDate(viewingRental.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewingRental.status)}`}
                      >
                        {viewingRental.status}
                      </span>
                    </p>
                  </div>
                  {viewingRental.installationLocation && (
                    <div>
                      <span className="font-medium">Local:</span>
                      <p>{viewingRental.installationLocation}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Instalação:</span>
                    <p>{formatTime(viewingRental.installationTime)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Retirada:</span>
                    <p>{formatTime(viewingRental.removalTime)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Itens:</h4>
                  <div className="space-y-2">
                    {viewingRental.items.map((item) => (
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

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>R$ {viewingRental.totalValue.toFixed(2)}</span>
                  </div>
                  {viewingRental.discount > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Desconto:</span>
                      <span>- R$ {viewingRental.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                    <span>Total Final:</span>
                    <span className="text-primary">R$ {viewingRental.finalValue.toFixed(2)}</span>
                  </div>
                </div>

                {viewingRental.observations && (
                  <div>
                    <h4 className="font-medium mb-2">Observações:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{viewingRental.observations}</p>
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
                Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
