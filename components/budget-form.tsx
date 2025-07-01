"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calculator, ChevronLeft, ChevronRight, User, Package, FileText, Search } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export interface BudgetItem {
  id: string
  equipmentName: string
  quantity: number
  dailyRate: number
  days: number
  total: number
}

export interface Budget {
  id: string
  number: string
  clientId: string
  clientName: string
  createdAt: string
  startDate: string
  endDate: string
  installationTime?: string
  removalTime?: string
  installationLocation?: string // NOVO CAMPO
  items: BudgetItem[]
  subtotal: number
  discount: number
  totalValue: number
  status: "Pendente" | "Aprovado" | "Rejeitado"
  observations: string
}

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: Budget
  onSave: (budget: Omit<Budget, "id" | "number" | "createdAt"> & { id?: string }) => void
}

// Dados mockados de clientes
const mockClients = [
  { id: "1", name: "Maria Silva Santos" },
  { id: "2", name: "João Pedro Oliveira" },
  { id: "3", name: "Eventos & Cia Ltda" },
  { id: "4", name: "Ana Costa Ferreira" },
  { id: "5", name: "Tech Solutions Corp" },
]

// Dados mockados de equipamentos
const mockEquipments = [
  { id: "1", name: "Mesa de Som Yamaha MG16XU", dailyRate: 150, category: "Áudio" },
  { id: "2", name: "Projetor Epson 5000 Lumens", dailyRate: 200, category: "Vídeo" },
  { id: "3", name: "Kit Iluminação LED RGB", dailyRate: 300, category: "Iluminação" },
  { id: "4", name: "Tenda 10x10m", dailyRate: 250, category: "Estrutura" },
  { id: "5", name: "Caixa de Som JBL SRX815P", dailyRate: 120, category: "Áudio" },
  { id: "6", name: "Telão 3x2m", dailyRate: 100, category: "Vídeo" },
  { id: "7", name: "Moving Head LED", dailyRate: 180, category: "Iluminação" },
  { id: "8", name: "Microfone Sem Fio", dailyRate: 50, category: "Áudio" },
  { id: "9", name: "Arranjo Floral Premium", dailyRate: 80, category: "Decoração" },
  { id: "10", name: "Cadeira Tiffany", dailyRate: 8, category: "Estrutura" },
]

const steps = [
  { id: 1, title: "Dados Básicos", icon: User, description: "Cliente e período" },
  { id: 2, title: "Equipamentos", icon: Package, description: "Selecionar itens" },
  { id: 3, title: "Finalização", icon: FileText, description: "Resumo e observações" },
]

export function BudgetForm({ open, onOpenChange, budget, onSave }: BudgetFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    startDate: "",
    endDate: "",
    installationTime: "",
    removalTime: "",
    installationLocation: "", // NOVO CAMPO
    items: [] as BudgetItem[],
    discount: 0,
    observations: "",
  })

  const [selectedEquipment, setSelectedEquipment] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [equipmentSearch, setEquipmentSearch] = useState("")

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && !budget) {
      setCurrentStep(1)
      setFormData({
        clientId: "",
        clientName: "",
        startDate: "",
        endDate: "",
        installationTime: "",
        removalTime: "",
        installationLocation: "", // ADICIONAR AQUI
        items: [],
        discount: 0,
        observations: "",
      })
      setSelectedEquipment("")
      setQuantity(1)
      setEquipmentSearch("")
    } else if (open && budget) {
      setCurrentStep(1)
      setFormData({
        clientId: budget.clientId,
        clientName: budget.clientName,
        startDate: budget.startDate,
        endDate: budget.endDate,
        installationTime: budget.installationTime || "",
        removalTime: budget.removalTime || "",
        installationLocation: budget.installationLocation || "",
        items: budget.items,
        discount: budget.discount,
        observations: budget.observations,
      })
      setEquipmentSearch("")
    }
  }, [open, budget])

  // Calcular dias automaticamente
  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 1
  }

  // Filtrar equipamentos baseado na busca
  const filteredEquipments = mockEquipments.filter(
    (equipment) =>
      equipment.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      equipment.category?.toLowerCase().includes(equipmentSearch.toLowerCase()),
  )

  const days = calculateDays()

  // Calcular valores
  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
  const totalValue = subtotal - formData.discount

  // Atualizar totais dos itens quando as datas mudarem
  useEffect(() => {
    if (formData.items.length > 0) {
      const updatedItems = formData.items.map((item) => ({
        ...item,
        days,
        total: item.quantity * item.dailyRate * days,
      }))
      setFormData((prev) => ({ ...prev, items: updatedItems }))
    }
  }, [formData.startDate, formData.endDate])

  const handleClientChange = (clientId: string) => {
    const client = mockClients.find((c) => c.id === clientId)
    setFormData({
      ...formData,
      clientId,
      clientName: client?.name || "",
    })
  }

  const addEquipment = () => {
    if (selectedEquipment && quantity > 0) {
      const equipment = mockEquipments.find((e) => e.name === selectedEquipment)
      if (equipment) {
        const total = quantity * equipment.dailyRate * days
        const newItem: BudgetItem = {
          id: Date.now().toString(),
          equipmentName: equipment.name,
          quantity,
          dailyRate: equipment.dailyRate,
          days,
          total,
        }

        setFormData({
          ...formData,
          items: [...formData.items, newItem],
        })

        // Reset selection
        setSelectedEquipment("")
        setQuantity(1)
      }
    }
  }

  const removeItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    })
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.dailyRate * days,
            }
          : item,
      ),
    })
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return formData.clientId && formData.startDate && formData.endDate
    }
    if (currentStep === 2) {
      return formData.items.length > 0
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Validação final
    if (formData.items.length === 0) {
      alert("Adicione pelo menos um equipamento ao orçamento")
      return
    }

    if (!formData.clientId) {
      alert("Selecione um cliente")
      setCurrentStep(1)
      return
    }

    onSave({
      ...formData,
      subtotal,
      totalValue,
      status: "Pendente",
      ...(budget && { id: budget.id }),
    })

    onOpenChange(false)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id
                ? "bg-primary border-primary text-primary-foreground"
                : "border-gray-300 text-gray-400"
            }`}
          >
            <step.icon className="h-5 w-5" />
          </div>
          <div className="ml-3 mr-6">
            <p className={`text-sm font-medium ${currentStep >= step.id ? "text-primary" : "text-gray-400"}`}>
              {step.title}
            </p>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${currentStep > step.id ? "bg-primary" : "bg-gray-300"} mr-6`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="installationLocation">Local de Instalação (Opcional)</Label>
            <Input
              id="installationLocation"
              value={formData.installationLocation}
              onChange={(e) => setFormData({ ...formData, installationLocation: e.target.value })}
              placeholder="Ex: Salão de Festas Villa Real, Rua das Flores, 123"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Período da Locação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Data de Término *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="bg-primary/10 text-primary p-3 rounded-lg text-center">
              <strong>{days} dia(s)</strong> de locação
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horários (Opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="installationTime">Instalação</Label>
              <Input
                id="installationTime"
                type="time"
                value={formData.installationTime}
                onChange={(e) => setFormData({ ...formData, installationTime: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="removalTime">Retirada</Label>
              <Input
                id="removalTime"
                type="time"
                value={formData.removalTime}
                onChange={(e) => setFormData({ ...formData, removalTime: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Equipamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Buscar Equipamento</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Digite o nome do equipamento ou categoria..."
                  value={equipmentSearch}
                  onChange={(e) => setEquipmentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 grid gap-2">
                <Label>Equipamento</Label>
                <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEquipments.length > 0 ? (
                      filteredEquipments.map((equipment) => (
                        <SelectItem key={equipment.id} value={equipment.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{equipment.name}</span>
                            <span className="text-sm text-gray-500 ml-2">R$ {equipment.dailyRate.toFixed(2)}/dia</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-results" disabled>
                        Nenhum equipamento encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {equipmentSearch && (
                  <p className="text-sm text-gray-600">{filteredEquipments.length} equipamento(s) encontrado(s)</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {selectedEquipment && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Total do item:</span>
                  <span className="font-semibold">
                    R${" "}
                    {(
                      quantity *
                      (mockEquipments.find((e) => e.name === selectedEquipment)?.dailyRate || 0) *
                      days
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {(() => {
                const equipment = mockEquipments.find((e) => e.name === selectedEquipment)
                return equipment ? (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">{equipment.name}</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Categoria: {equipment.category || "Não especificada"} • R$ {equipment.dailyRate.toFixed(2)} por
                      dia
                    </p>
                  </div>
                ) : null
              })()}
            </div>
          )}

          <Button
            type="button"
            onClick={addEquipment}
            disabled={!selectedEquipment || selectedEquipment === "no-results"}
            className="w-full bg-transparent"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Equipamento
          </Button>
        </CardContent>
      </Card>

      {formData.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipamentos Selecionados ({formData.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formData.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.equipmentName}</p>
                    <p className="text-sm text-gray-600">
                      R$ {item.dailyRate.toFixed(2)}/dia • {item.days} dia(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Qtd:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-16 h-8"
                      />
                    </div>
                    <div className="text-right min-w-0">
                      <p className="font-semibold">R$ {item.total.toFixed(2)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Cliente:</span>
              <span>{formData.clientName}</span>
            </div>
            {formData.installationLocation && (
              <div className="flex justify-between">
                <span className="font-medium">Local:</span>
                <span className="text-right max-w-xs">{formData.installationLocation}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Período:</span>
              <span>
                {formData.startDate && formData.endDate
                  ? `${new Date(formData.startDate).toLocaleDateString("pt-BR")} - ${new Date(formData.endDate).toLocaleDateString("pt-BR")}`
                  : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Duração:</span>
              <span>{days} dia(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Equipamentos:</span>
              <span>{formData.items.length} item(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max={subtotal}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-xl">
              <span>Total Final:</span>
              <span className="text-primary">R$ {totalValue.toFixed(2)}</span>
            </div>

            {formData.discount > 0 && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                Economia: R$ {formData.discount.toFixed(2)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            placeholder="Informações adicionais sobre o orçamento..."
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-black flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {budget ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
          <DialogDescription>
            {budget ? "Faça as alterações necessárias no orçamento." : "Crie um novo orçamento seguindo as etapas."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {renderStepIndicator()}

          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNextStep()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-primary hover:bg-primary/90"
                  disabled={formData.items.length === 0}
                >
                  {budget ? "Salvar Alterações" : "Criar Orçamento"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
