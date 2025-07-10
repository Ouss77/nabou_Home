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
import { ChevronDown, Clock, UserCheck, UserX } from "lucide-react"
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
      icon: Clock,
    },
    active: {
      label: "Active",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
      icon: UserCheck,
    },
    expired: {
      label: "Expired",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-200",
      icon: UserX,
    },
  }

  const handleStatusSelect = (newStatus: "trial" | "active" | "expired") => {
    if (newStatus === currentStatus) return

    setPendingStatus(newStatus)
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/barbers/${barberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: pendingStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      onStatusChange(pendingStatus)
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" disabled={isLoading}>
            <Badge className={`${statusConfig[currentStatus].className} cursor-pointer`}>
              <CurrentIcon className="h-3 w-3 mr-1" />
              {statusConfig[currentStatus].label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusSelect(status as "trial" | "active" | "expired")}
                className={currentStatus === status ? "bg-muted" : ""}
              >
                <Icon className="h-4 w-4 mr-2" />
                {config.label}
                {currentStatus === status && <span className="ml-auto text-xs">(Current)</span>}
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
              Are you sure you want to change this barber's status from{" "}
              <strong>{statusConfig[currentStatus].label}</strong> to{" "}
              <strong>{pendingStatus ? statusConfig[pendingStatus].label : ""}</strong>?
              {pendingStatus === "expired" && (
                <span className="block mt-2 text-red-600">
                  This will prevent the barber from logging in until their status is changed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={isLoading}>
              {isLoading ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
