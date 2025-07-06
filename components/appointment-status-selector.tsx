"use client"

import { useState } from "react"
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
import { CheckCircle, Clock, XCircle, AlertCircle, ChevronDown } from "lucide-react"

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed"

interface AppointmentStatusSelectorProps {
  appointmentId: string
  currentStatus: AppointmentStatus
  onStatusChange: (newStatus: AppointmentStatus) => void
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 hover:bg-yellow-100",
    borderColor: "border-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100",
    borderColor: "border-red-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
  },
}

export function AppointmentStatusSelector({
  appointmentId,
  currentStatus,
  onStatusChange,
}: AppointmentStatusSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const currentConfig = statusConfig[currentStatus]
  const CurrentIcon = currentConfig.icon

  const handleStatusSelect = (newStatus: AppointmentStatus) => {
    setDropdownOpen(false)

    if (newStatus === currentStatus) return

    // Show confirmation for destructive actions
    if (newStatus === "cancelled" || newStatus === "completed") {
      setPendingStatus(newStatus)
      setConfirmDialogOpen(true)
    } else {
      updateStatus(newStatus)
    }
  }

  const updateStatus = async (newStatus: AppointmentStatus) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/barber/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Call the parent callback to update the UI optimistically
      onStatusChange(newStatus)

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${statusConfig[newStatus].label.toLowerCase()}.`,
      })
    } catch (error) {
      console.error("Failed to update appointment status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setConfirmDialogOpen(false)
      setPendingStatus(null)
    }
  }

  const handleConfirm = () => {
    if (pendingStatus) {
      updateStatus(pendingStatus)
    }
  }

  const getConfirmationMessage = (status: AppointmentStatus) => {
    switch (status) {
      case "cancelled":
        return {
          title: "Cancel Appointment",
          description: "Are you sure you want to cancel this appointment? This action cannot be undone.",
        }
      case "completed":
        return {
          title: "Mark as Completed",
          description:
            "Are you sure you want to mark this appointment as completed? This will count towards your revenue.",
        }
      default:
        return {
          title: "Update Status",
          description: "Are you sure you want to update this appointment status?",
        }
    }
  }

  const confirmationMessage = pendingStatus ? getConfirmationMessage(pendingStatus) : null

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-auto p-2 ${currentConfig.bgColor} ${currentConfig.borderColor} border transition-colors`}
            disabled={isUpdating}
          >
            <div className="flex items-center gap-2">
              <CurrentIcon className={`h-4 w-4 ${currentConfig.color}`} />
              <span className={`text-sm font-medium ${currentConfig.color}`}>{currentConfig.label}</span>
              <ChevronDown
                className={`h-3 w-3 ${currentConfig.color} transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {(Object.entries(statusConfig) as [AppointmentStatus, (typeof statusConfig)[AppointmentStatus]][]).map(
            ([status, config]) => {
              const Icon = config.icon
              const isCurrentStatus = status === currentStatus

              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className={`flex items-center gap-2 cursor-pointer ${isCurrentStatus ? "bg-muted" : ""}`}
                  disabled={isCurrentStatus}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className={config.color}>{config.label}</span>
                  {isCurrentStatus && <CheckCircle className="h-3 w-3 ml-auto text-muted-foreground" />}
                </DropdownMenuItem>
              )
            },
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {confirmationMessage?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmationMessage?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmDialogOpen(false)
                setPendingStatus(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isUpdating}
              className={pendingStatus === "cancelled" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isUpdating ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
