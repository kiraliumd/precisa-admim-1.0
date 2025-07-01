"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Clock, MapPin, Package, Copy, Check } from "lucide-react"
import { AppSidebar } from "../../../components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useParams } from "next/navigation"

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
    observations: "Evento corporativo - necessário entrega até 15h",
    phone: "(11) 99999-1234",
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
    observations: "Evento corporativo - necessário entrega até 15h",
    phone: "(11) 99999-1234",
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
    observations: "Festa de aniversário - som ambiente",
    phone: "(11) 98888-5678",
    rentalId: "2",
  },
  {
    id: "4",
    date: "2024-12-20",
    clientName: "Ana Costa Ferreira",
    eventType: "Instalação",
    location: "Salão Cristal",
    installationTime: "19:00",
    removalTime: "02:00",
    status: "Instalação Pendente",
    totalValue: 3200,
    items: ["Kit Iluminação LED RGB", "Caixa de Som JBL SRX815P", "Moving Head LED"],
    observations: "Especializada em casamentos",
    phone: "(11) 97777-9999",
    rentalId: "3",
  },
  {
    id: "5",
    date: "2024-12-22",
    clientName: "Tech Solutions Corp",
    eventType: "Instalação",
    location: "Espaço de Eventos Golden",
    installationTime: "18:00",
    removalTime: "01:00",
    status: "Instalação Pendente",
    totalValue: 2800,
    items: ["Mesa de Som Yamaha MG16XU", "Projetor Epson 5000 Lumens", "Telão 3x2m"],
    observations: "Eventos corporativos mensais",
    phone: "(11) 2222-3333",
    rentalId: "4",
  },
  {
    id: "6",
    date: "2024-12-25",
    clientName: "Carlos Eduardo Lima",
    eventType: "Retirada",
    location: "Chácara do Cliente",
    installationTime: "16:00",
    removalTime: "23:00",
    status: "Retirar Locação",
    totalValue: 1200,
    items: ["Arranjo Floral Premium", "Caixa de Som JBL SRX815P"],
    observations: "Cliente desde 2020",
    phone: "(11) 96666-7777",
    rentalId: "5",
  },
]

export default function AgendaDayPage() {
  const params = useParams()
  const date = params.date as string
  const [copied, setCopied] = useState(false)

  const events = mockEvents.filter((event) => event.date === date)
  const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Atualizar a função getStatusColor:
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Instalação Pendente":
        return "bg-accent/10 text-accent"
      case "Retirar Locação":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const generateWhatsAppSummary = () => {
    if (events.length === 0) {
      return `📅 *AGENDA - ${formattedDate.toUpperCase()}*\n\n❌ Nenhum evento agendado para este dia.`
    }

    const totalValue = events.reduce((sum, event) => sum + event.totalValue, 0)

    let summary = `📅 *AGENDA - ${formattedDate.toUpperCase()}*\n\n`
    summary += `📊 *RESUMO DO DIA:*\n`
    summary += `• ${events.length} evento(s) agendado(s)\n`
    summary += `• Receita total: R$ ${totalValue.toLocaleString("pt-BR")}\n\n`

    summary += `🎯 *EVENTOS:*\n\n`

    events.forEach((event, index) => {
      summary += `*${index + 1}. ${event.eventType.toUpperCase()}*\n`
      summary += `👤 Cliente: ${event.clientName}\n`
      summary += `📞 Telefone: ${event.phone}\n`
      summary += `📍 Local: ${event.location}\n`
      summary += `⏰ Horário: ${event.installationTime} às ${event.removalTime}\n`
      summary += `💰 Valor: R$ ${event.totalValue.toLocaleString("pt-BR")}\n`
      summary += `📦 Equipamentos:\n`

      event.items.forEach((item) => {
        summary += `   • ${item}\n`
      })

      if (event.observations) {
        summary += `📝 Obs: ${event.observations}\n`
      }

      summary += `🔄 Status: ${event.status}\n`

      if (index < events.length - 1) {
        summary += `\n${"─".repeat(30)}\n\n`
      }
    })

    summary += `\n\n✅ *Precisa Locações*\n`
    summary += `📱 Entre em contato para mais informações!`

    return summary
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateWhatsAppSummary())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/agenda">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-black capitalize">{formattedDate}</h1>
                <p className="text-sm text-gray-600">{events.length} evento(s) agendado(s)</p>
              </div>
            </div>
            <Button onClick={copyToClipboard} className="bg-green-600 hover:bg-green-700 text-white" disabled={copied}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Resumo do Dia
                </>
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6 bg-gray-50">
          {/* Lista de Eventos */}
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento agendado</h3>
                <p className="text-gray-600">Não há eventos programados para esta data.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-black flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          {event.eventType}
                        </CardTitle>
                        <CardDescription className="mt-1">{event.clientName}</CardDescription>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(event.status)}`}
                        >
                          {event.status}
                        </span>
                        <div className="text-lg font-bold text-primary mt-1">
                          R$ {event.totalValue.toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações do Evento */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Horário:</span>
                          <span>
                            {event.installationTime} às {event.removalTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Local:</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">📞 Telefone:</span>
                          <span>{event.phone}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Equipamentos ({event.items.length}):</span>
                        </div>
                        <div className="space-y-1">
                          {event.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="text-sm text-gray-600 pl-6">
                              • {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    {event.observations && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Observações:</span>
                        <p className="text-sm text-gray-600 mt-1">{event.observations}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
