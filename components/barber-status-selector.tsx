"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { ChevronDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BarberStatusSelectorProps {
  barberId: string
  currentStatus: "trial" | "active" | "expired"
  onStatusChange: (newStatus: "trial" | "active" | "expired") => void
}

export function BarberStatusSelector({ barberId, currentStatus, onStatusChange }: BarberStatusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"trial" | "active" | "expired" | null>(null)
  const { toast } = useToast()

  const statusConfig = {
    trial: {
      label: "Trial",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    active: {
      label: "Active",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    expired: {
      label: "Expired",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  }

  const handleStatusSelect = (newStatus: "trial" | "active" | "expired") => {
    if (newStatus === currentStatus) return

    // Show confirmation for potentially destructive changes
    if (newStatus === "expired" || (currentStatus === "active" && newStatus === "trial")) {
      setPendingStatus(newStatus)
      setShowConfirmDialog(true)
    } else {
      updateStatus(newStatus)
    }
  }

  const updateStatus = async (newStatus: "trial" | "active" | "expired") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      onStatusChange(newStatus)
      toast({
        title: "Status Updated",
        description: `Barber status changed to ${statusConfig[newStatus].label}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setPendingStatus(null)
    }
  }

  const getConfirmationMessage = () => {
    if (pendingStatus === "expired") {
      return "This will block the barber from accessing their account. They will need to upgrade to continue using the service."
    }
    if (currentStatus === "active" && pendingStatus === "trial") {
      return "This will downgrade the barber from active to trial status. They may lose access if they exceed trial limits."
    }
    return `Are you sure you want to change the status to ${pendingStatus}?`
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" disabled={isLoading}>
            <Badge
              variant={statusConfig[currentStatus].variant}
              className={`${statusConfig[currentStatus].className} cursor-pointer hover:opacity-80`}
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              {statusConfig[currentStatus].label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(statusConfig).map(([status, config]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusSelect(status as "trial" | "active" | "expired")}
              className={currentStatus === status ? "bg-muted" : ""}
            >
              <Badge variant={config.variant} className={`${config.className} mr-2`}>
                {config.label}
              </Badge>
              {currentStatus === status && "(Current)"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>{getConfirmationMessage()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingStatus && updateStatus(pendingStatus)}
              className={pendingStatus === "expired" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {pendingStatus === "expired" ? "Block Access" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
