"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
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
import { CheckCircle, Clock, XCircle, ChevronDown } from "lucide-react"

interface BarberStatusSelectorProps {
  barberId: string
  currentStatus: "trial" | "active" | "expired"
  onStatusUpdate: (newStatus: "trial" | "active" | "expired") => void
}

const statusConfig = {
  trial: {
    label: "Trial",
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    icon: Clock,
  },
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800 hover:bg-green-200",
    icon: CheckCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-red-100 text-red-800 hover:bg-red-200",
    icon: XCircle,
  },
}

export function BarberStatusSelector({ barberId, currentStatus, onStatusUpdate }: BarberStatusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"trial" | "active" | "expired" | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = (newStatus: "trial" | "active" | "expired") => {
    if (newStatus === currentStatus) return

    setPendingStatus(newStatus)
    setShowConfirmDialog(true)
    setDropdownOpen(false)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: pendingStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      onStatusUpdate(pendingStatus)
      toast({
        title: "Status Updated",
        description: `Barber status changed to ${statusConfig[pendingStatus].label}`,
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

  const CurrentIcon = statusConfig[currentStatus].icon

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Badge
            className={`${statusConfig[currentStatus].color} cursor-pointer transition-colors flex items-center gap-1`}
            variant="secondary"
          >
            <CurrentIcon className="h-3 w-3" />
            {statusConfig[currentStatus].label}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status as "trial" | "active" | "expired")}
                className="flex items-center gap-2"
                disabled={status === currentStatus}
              >
                <Icon className="h-4 w-4" />
                {config.label}
                {status === currentStatus && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
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
              Are you sure you want to change this barber's status to{" "}
              <strong>{pendingStatus && statusConfig[pendingStatus].label}</strong>?
              {pendingStatus === "expired" && (
                <span className="block mt-2 text-red-600">
                  This will prevent the barber from logging in until their status is changed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isLoading}
              className={pendingStatus === "expired" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoading ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
