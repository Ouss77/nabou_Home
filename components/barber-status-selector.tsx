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
import { ChevronDown, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BarberStatusSelectorProps {
  barberId: string
  currentStatus: "trial" | "active" | "expired"
  onStatusUpdate: (newStatus: "trial" | "active" | "expired") => void
}

export function BarberStatusSelector({ barberId, currentStatus, onStatusUpdate }: BarberStatusSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"trial" | "active" | "expired" | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const statusConfig = {
    trial: {
      label: "Trial",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    active: {
      label: "Active",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    expired: {
      label: "Expired",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
  }

  const handleStatusChange = async (newStatus: "trial" | "active" | "expired") => {
    if (newStatus === currentStatus) return

    // Show confirmation for certain status changes
    if (newStatus === "expired" || (currentStatus === "active" && newStatus === "trial")) {
      setPendingStatus(newStatus)
      setShowConfirmDialog(true)
      return
    }

    await updateStatus(newStatus)
  }

  const updateStatus = async (newStatus: "trial" | "active" | "expired") => {
    setIsUpdating(true)
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

      onStatusUpdate(newStatus)
      toast({
        title: "Status Updated",
        description: `Barber status changed to ${statusConfig[newStatus].label}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update barber status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setShowConfirmDialog(false)
      setPendingStatus(null)
    }
  }

  const confirmStatusChange = () => {
    if (pendingStatus) {
      updateStatus(pendingStatus)
    }
  }

  const CurrentIcon = statusConfig[currentStatus].icon

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-0" disabled={isUpdating}>
            <Badge variant="outline" className={`${statusConfig[currentStatus].color} cursor-pointer hover:opacity-80`}>
              <CurrentIcon className="w-3 h-3 mr-1" />
              {statusConfig[currentStatus].label}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status as "trial" | "active" | "expired")}
                className={currentStatus === status ? "bg-muted" : ""}
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
                {currentStatus === status && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
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
              {pendingStatus === "expired" &&
                "This will block the barber from logging in until their status is changed back to active or trial."}
              {pendingStatus === "trial" &&
                currentStatus === "active" &&
                "This will downgrade the barber to trial status with appointment limitations."}
              Are you sure you want to continue?
            </AlertDialogDescription>
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
