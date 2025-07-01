"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { AppSidebar } from "../../components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

// Atualizar os dados mockados para refletir o fluxo correto:
const mockEvents = [
  {
    id: "1",
    date: "2024-12-15",
    clientName: "Maria Silva Santos",
    eventType: "Instalação",
    location: "Salão de Festas Villa Real",
    installationTime: "08:00",
    removalTime: "22:00",
    status: "Instalação Pendente",
    totalValue: 1500,
    items: ["Mesa de Som Yamaha MG16XU", "Kit Iluminação LED RGB"],
    rentalId: "1",
  },
  {
    id: "2",
    date: "2024-12-16",
    clientName: "Maria Silva Santos",
    eventType: "Retirada",
    location: "Salão de Festas Villa Real",
    installationTime: "08:00",
    removalTime: "22:00",
    status: "Retirar Locação",
    totalValue: 1500,
    items: ["Mesa de Som Yamaha MG16XU", "Kit Iluminação LED RGB"],
    rentalId: "1",
  },
  {
    id: "3",
    date: "2024-12-15",
    clientName: "João Pedro Oliveira",
    eventType: "Instalação",
    location: "Residência do Cliente",
    installationTime: "14:00",
    removalTime: "23:00",
    status: "Instalação Pendente",
    totalValue: 800,
    items: ["Caixa de Som JBL SRX815P", "Microfone Sem Fio"],
    rentalId: "2",
  },
  {
    id: "4",
    date: "2024-12-15",
    clientName: "João Pedro Oliveira",
    eventType: "Retirada",
    location: "Residência do Cliente",
    installationTime: "14:00",
    removalTime: "23:00",
    status: "Retirar Locação",
    totalValue: 800,
    items: ["Caixa de Som JBL SRX815P", "Microfone Sem Fio"],
    rentalId: "2",
  },
  {
    id: "5",
    date: "2024-12-20",
    clientName: "Ana Costa Ferreira",
    eventType: "Instalação",
    location: "Salão Cristal",
    installationTime: "19:00",
    removalTime: "02:00",
    status: "Instalação Pendente",
    totalValue: 3200,
    items: ["Kit Iluminação LED RGB", "Caixa de Som JBL SRX815P", "Moving Head LED"],
    rentalId: "3",
  },
  {
    id: "6",
    date: "2024-12-21",
    clientName: "Ana Costa Ferreira",
    eventType: "Retirada",
    location: "Salão Cristal",
    installationTime: "19:00",
    removalTime: "02:00",
    status: "Retirar Locação",
    totalValue: 3200,
    items: ["Kit Iluminação LED RGB", "Caixa de Som JBL SRX815P", "Moving Head LED"],
    rentalId: "3",
  },
  {
    id: "7",
    date: "2024-12-22",
    clientName: "Tech Solutions Corp",
    eventType: "Instalação",
    location: "Espaço de Eventos Golden",
    installationTime: "18:00",
    removalTime: "01:00",
    status: "Instalação Pendente",
    totalValue: 2800,
    items: ["Mesa de Som Yamaha MG16XU", "Projetor Epson 5000 Lumens", "Telão 3x2m"],
    rentalId: "4",
  },
  {
    id: "8",
    date: "2024-12-23",
    clientName: "Tech Solutions Corp",
    eventType: "Retirada",
    location: "Espaço de Eventos Golden",
    installationTime: "18:00",
    removalTime: "01:00",
    status: "Retirar Locação",
    totalValue: 2800,
    items: ["Mesa de Som Yamaha MG16XU", "Projetor Epson 5000 Lumens", "Telão 3x2m"],
    rentalId: "4",
  },
]

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)) // Dezembro 2024

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getEventsForDate = (dateKey: string) => {
    return mockEvents.filter((event) => event.date === dateKey)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  // Atualizar a função getStatusColor para usar as cores corretas:
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Instalação Pendente":
        return "bg-accent/20 text-accent"
      case "Retirar Locação":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
      const events = getEventsForDate(dateKey)
      const today = new Date()
      const isToday = dateKey === today.toISOString().split("T")[0]

      days.push(
        <Link
          key={day}
          href={`/agenda/${dateKey}`}
          className={`h-32 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
            isToday ? "bg-primary/10 border-primary ring-2 ring-primary/20" : "bg-white"
          }`}
        >
          <div className="p-2 h-full flex flex-col">
            <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-gray-900"}`}>
              {day}
              {isToday && <span className="ml-1 text-xs">(Hoje)</span>}
            </div>
            <div className="flex-1 space-y-1 overflow-hidden">
              {events.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate ${getStatusColor(event.status)}`}
                  title={`${event.clientName} - ${event.eventType}`}
                >
                  <div className="font-medium truncate">{event.clientName}</div>
                  <div className="truncate">
                    {event.installationTime} - {event.eventType}
                  </div>
                </div>
              ))}
              {events.length > 3 && <div className="text-xs text-gray-500 font-medium">+{events.length - 3} mais</div>}
            </div>
          </div>
        </Link>,
      )
    }

    return days
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
              <h1 className="text-lg font-semibold text-black">Agenda</h1>
              <p className="text-sm text-gray-600">Visualize todos os eventos agendados</p>
            </div>
            <Button onClick={goToToday} variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoje
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6 bg-gray-50">
          {/* Calendário */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <CardDescription>Clique em uma data para ver os detalhes dos eventos</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Cabeçalho dos dias da semana */}
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="bg-gray-100 border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-700"
                  >
                    {day}
                  </div>
                ))}

                {/* Dias do calendário */}
                {renderCalendar()}
              </div>

              {/* Legenda */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent/20 border border-accent/40"></div>
                  <span>Instalação Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
                  <span>Retirar Locação</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
