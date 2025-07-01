// Utilitários para transformar dados entre o formato do frontend e backend

import type { Client as DBClient, Equipment as DBEquipment } from "../supabase"

// Definir tipos do frontend que estão faltando
export interface Client {
  id: string
  name: string
  phone: string
  email: string
  documentType: "CPF" | "CNPJ"
  documentNumber: string
  observations: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  description: string
  dailyRate: number
  status: "Disponível" | "Alugado" | "Manutenção"
}

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
  installationLocation?: string
  items: BudgetItem[]
  subtotal: number
  discount: number
  totalValue: number
  status: "Pendente" | "Aprovado" | "Rejeitado"
  observations: string
}

export interface Rental {
  id: string
  clientId: string
  clientName: string
  startDate: string
  endDate: string
  installationTime: string
  removalTime: string
  installationLocation: string
  items: Array<{
    id: string
    equipmentName: string
    quantity: number
    dailyRate: number
    days: number
    total: number
  }>
  totalValue: number
  discount: number
  finalValue: number
  status: "Instalação Pendente" | "Ativo" | "Concluído"
  observations: string
  budgetId?: string
}

// Transformar cliente do banco para o frontend
export function transformClientFromDB(dbClient: DBClient): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    phone: dbClient.phone,
    email: dbClient.email,
    documentType: dbClient.document_type,
    documentNumber: dbClient.document_number,
    observations: dbClient.observations || "",
  }
}

// Transformar cliente do frontend para o banco
export function transformClientToDB(
  client: Omit<Client, "id"> & { id?: string },
): Omit<DBClient, "id" | "created_at" | "updated_at"> {
  return {
    name: client.name,
    phone: client.phone,
    email: client.email,
    document_type: client.documentType,
    document_number: client.documentNumber,
    observations: client.observations || null,
  }
}

// Transformar equipamento do banco para o frontend
export function transformEquipmentFromDB(dbEquipment: DBEquipment): Equipment {
  return {
    id: dbEquipment.id,
    name: dbEquipment.name,
    category: dbEquipment.category,
    description: dbEquipment.description || "",
    dailyRate: dbEquipment.daily_rate,
    status: dbEquipment.status,
  }
}

// Transformar equipamento do frontend para o banco
export function transformEquipmentToDB(
  equipment: Omit<Equipment, "id"> & { id?: string },
): Omit<DBEquipment, "id" | "created_at" | "updated_at"> {
  return {
    name: equipment.name,
    category: equipment.category,
    description: equipment.description || null,
    daily_rate: equipment.dailyRate,
    status: equipment.status,
  }
}

// Transformar orçamento do banco para o frontend
export function transformBudgetFromDB(dbBudget: any): Budget {
  return {
    id: dbBudget.id,
    number: dbBudget.number,
    clientId: dbBudget.client_id,
    clientName: dbBudget.client_name,
    createdAt: dbBudget.created_at.split("T")[0],
    startDate: dbBudget.start_date,
    endDate: dbBudget.end_date,
    installationTime: dbBudget.installation_time || "",
    removalTime: dbBudget.removal_time || "",
    installationLocation: dbBudget.installation_location || "",
    items:
      dbBudget.budget_items?.map((item: any) => ({
        id: item.id,
        equipmentName: item.equipment_name,
        quantity: item.quantity,
        dailyRate: item.daily_rate,
        days: item.days,
        total: item.total,
      })) || [],
    subtotal: dbBudget.subtotal,
    discount: dbBudget.discount,
    totalValue: dbBudget.total_value,
    status: dbBudget.status,
    observations: dbBudget.observations || "",
  }
}

// Transformar orçamento do frontend para o banco
export function transformBudgetToDB(
  budget: Omit<Budget, "id" | "number" | "createdAt"> & { id?: string; number?: string },
): any {
  return {
    number: budget.number || "",
    client_id: budget.clientId,
    client_name: budget.clientName,
    start_date: budget.startDate,
    end_date: budget.endDate,
    installation_time: budget.installationTime || null,
    removal_time: budget.removalTime || null,
    installation_location: budget.installationLocation || null,
    subtotal: budget.subtotal,
    discount: budget.discount,
    total_value: budget.totalValue,
    status: budget.status,
    observations: budget.observations || null,
  }
}

// Transformar locação do banco para o frontend
export function transformRentalFromDB(dbRental: any): Rental {
  return {
    id: dbRental.id,
    clientId: dbRental.client_id,
    clientName: dbRental.client_name,
    startDate: dbRental.start_date,
    endDate: dbRental.end_date,
    installationTime: dbRental.installation_time,
    removalTime: dbRental.removal_time,
    installationLocation: dbRental.installation_location || "",
    items:
      dbRental.rental_items?.map((item: any) => ({
        id: item.id,
        equipmentName: item.equipment_name,
        quantity: item.quantity,
        dailyRate: item.daily_rate,
        days: item.days,
        total: item.total,
      })) || [],
    totalValue: dbRental.total_value,
    discount: dbRental.discount,
    finalValue: dbRental.final_value,
    status: dbRental.status,
    observations: dbRental.observations || "",
    budgetId: dbRental.budget_id,
  }
}
