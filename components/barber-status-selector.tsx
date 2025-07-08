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
import { ChevronDown, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BarberStatusSelectorProps {
  barberId: string
  currentStatus: "trial" | "active" | "expired"
  onStatusUpdate: (newStatus: "trial" | "active" | "expired") => void
}

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

export function BarberStatusSelector({ barberId, currentStatus, onStatusUpdate }: BarberStatusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"trial" | "active" | "expired" | null>(null)
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: "trial" | "active" | "expired") => {
    if (newStatus === currentStatus) return

    // Show confirmation for potentially destructive changes
    if (newStatus === "expired" || (currentStatus === "active" && newStatus === "trial")) {
      setPendingStatus(newStatus)
      setShowConfirmDialog(true)
      return
    }

    await updateStatus(newStatus)
  }

  const updateStatus = async (newStatus: "trial" | "active" | "expired") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      const data = await response.json()
      onStatusUpdate(newStatus)

      toast({
        title: "Status Updated",
        description: data.message || `Barber status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update barber status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setPendingStatus(null)
    }
  }

  const confirmStatusChange = () => {
    if (pendingStatus) {
      updateStatus(pendingStatus)
    }
  }

  const getConfirmationMessage = () => {
    if (pendingStatus === "expired") {
      return "This will block the barber from accessing their account. They won't be able to log in or manage appointments until reactivated."
    }
    if (currentStatus === "active" && pendingStatus === "trial") {
      return "This will downgrade the barber from active to trial status. They may lose access to premium features."
    }
    return "Are you sure you want to change this barber's status?"
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-0" disabled={isLoading}>
            <Badge
              variant={statusConfig[currentStatus].variant}
              className={`${statusConfig[currentStatus].className} cursor-pointer hover:opacity-80`}
            >
              {statusConfig[currentStatus].label}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(statusConfig).map(([status, config]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status as "trial" | "active" | "expired")}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{config.label}</span>
                {status === currentStatus && <Check className="h-4 w-4" />}
              </div>
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
            <AlertDialogAction onClick={confirmStatusChange}>Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
