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
import { useToast } from "@/hooks/use-toast"
import { ChevronDown, Check, Clock, X, CheckCircle, Loader2 } from "lucide-react"

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed"

interface AppointmentStatusSelectorProps {
  appointmentId: string
  currentStatus: AppointmentStatus
  onStatusChange: (newStatus: AppointmentStatus) => void
  disabled?: boolean
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    variant: "default" as const,
    icon: Check,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  completed: {
    label: "Completed",
    variant: "outline" as const,
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
}

export function AppointmentStatusSelector({
  appointmentId,
  currentStatus,
  onStatusChange,
  disabled = false,
}: AppointmentStatusSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null)
  const { toast } = useToast()

  const handleStatusSelect = (newStatus: AppointmentStatus) => {
    if (newStatus === currentStatus) return

    setPendingStatus(newStatus)
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return

    setIsUpdating(true)
    setShowConfirmDialog(false)

    try {
      const response = await fetch(`/api/barber/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: pendingStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      const data = await response.json()

      // Update the status optimistically
      onStatusChange(pendingStatus)

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${statusConfig[pendingStatus].label}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setPendingStatus(null)
    }
  }

  const cancelStatusChange = () => {
    setShowConfirmDialog(false)
    setPendingStatus(null)
  }

  const currentConfig = statusConfig[currentStatus]
  const CurrentIcon = currentConfig.icon

  if (disabled) {
    return (
      <Badge variant={currentConfig.variant} className="cursor-not-allowed opacity-60">
        <CurrentIcon className="h-3 w-3 mr-1" />
        {currentConfig.label}
      </Badge>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-auto p-1 hover:bg-transparent ${isUpdating ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={isUpdating}
          >
            <Badge
              variant={currentConfig.variant}
              className={`${currentConfig.bgColor} ${currentConfig.color} hover:opacity-80 transition-opacity`}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CurrentIcon className="h-3 w-3 mr-1" />
              )}
              {currentConfig.label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            const isSelected = status === currentStatus

            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusSelect(status as AppointmentStatus)}
                className={`cursor-pointer ${isSelected ? "bg-accent" : ""}`}
              >
                <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                <span className={isSelected ? "font-medium" : ""}>{config.label}</span>
                {isSelected && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the appointment status from{" "}
              <span className="font-medium">{statusConfig[currentStatus].label}</span> to{" "}
              <span className="font-medium">{pendingStatus ? statusConfig[pendingStatus].label : ""}</span>?
              {pendingStatus === "cancelled" && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  <strong>Note:</strong> Cancelling this appointment will free up the time slot for other bookings.
                </div>
              )}
              {pendingStatus === "completed" && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  <strong>Note:</strong> Marking as completed will finalize this appointment.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
