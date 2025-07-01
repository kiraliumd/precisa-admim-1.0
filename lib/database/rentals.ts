import { supabase } from "../supabase"
import type { Rental, RentalItem } from "../supabase"

export async function getRentals() {
  const { data, error } = await supabase
    .from("rentals")
    .select(`
      *,
      rental_items (*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar locações:", error)
    throw error
  }

  return data || []
}

export async function getRentalById(id: string) {
  const { data, error } = await supabase
    .from("rentals")
    .select(`
      *,
      rental_items (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar locação:", error)
    throw error
  }

  return data
}

export async function createRental(
  rental: Omit<Rental, "id" | "created_at" | "updated_at">,
  items: Omit<RentalItem, "id" | "rental_id" | "created_at">[],
) {
  // Criar a locação
  const { data: rentalData, error: rentalError } = await supabase.from("rentals").insert([rental]).select().single()

  if (rentalError) {
    console.error("Erro ao criar locação:", rentalError)
    throw rentalError
  }

  // Criar os itens da locação
  if (items.length > 0) {
    const rentalItems = items.map((item) => ({
      ...item,
      rental_id: rentalData.id,
    }))

    const { error: itemsError } = await supabase.from("rental_items").insert(rentalItems)

    if (itemsError) {
      console.error("Erro ao criar itens da locação:", itemsError)
      throw itemsError
    }
  }

  return rentalData
}

export async function updateRental(
  id: string,
  rental: Partial<Omit<Rental, "id" | "created_at" | "updated_at">>,
  items?: Omit<RentalItem, "id" | "rental_id" | "created_at">[],
) {
  // Atualizar a locação
  const { data: rentalData, error: rentalError } = await supabase
    .from("rentals")
    .update(rental)
    .eq("id", id)
    .select()
    .single()

  if (rentalError) {
    console.error("Erro ao atualizar locação:", rentalError)
    throw rentalError
  }

  // Se itens foram fornecidos, atualizar os itens
  if (items) {
    // Deletar itens existentes
    await supabase.from("rental_items").delete().eq("rental_id", id)

    // Inserir novos itens
    if (items.length > 0) {
      const rentalItems = items.map((item) => ({
        ...item,
        rental_id: id,
      }))

      const { error: itemsError } = await supabase.from("rental_items").insert(rentalItems)

      if (itemsError) {
        console.error("Erro ao atualizar itens da locação:", itemsError)
        throw itemsError
      }
    }
  }

  return rentalData
}

export async function deleteRental(id: string) {
  // Os itens serão deletados automaticamente devido ao CASCADE
  const { error } = await supabase.from("rentals").delete().eq("id", id)

  if (error) {
    console.error("Erro ao deletar locação:", error)
    throw error
  }

  return true
}

export async function searchRentals(searchTerm?: string, statusFilter?: string) {
  let query = supabase.from("rentals").select(`
      *,
      rental_items (*)
    `)

  if (searchTerm) {
    query = query.or(`client_name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`)
  }

  if (statusFilter && statusFilter !== "Todos") {
    query = query.eq("status", statusFilter)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar locações:", error)
    throw error
  }

  return data || []
}
