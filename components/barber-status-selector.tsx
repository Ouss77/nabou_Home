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
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock,
    },
    active: {
      label: "Active",
      color: "bg-green-100 text-green-800 border-green-300",
      icon: UserCheck,
    },
    expired: {
      label: "Expired",
      color: "bg-red-100 text-red-800 border-red-300",
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: pendingStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      const result = await response.json()

      onStatusChange(pendingStatus)
      toast({
        title: "Status Updated",
        description: result.message || `Barber status updated to ${pendingStatus}`,
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
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
            <Badge
              variant="outline"
              className={`${statusConfig[currentStatus].color} cursor-pointer hover:opacity-80 transition-opacity`}
            >
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
              Are you sure you want to change this barber's status to{" "}
              <strong>{pendingStatus && statusConfig[pendingStatus].label}</strong>?
              {pendingStatus === "expired" && (
                <span className="block mt-2 text-red-600">
                  This will prevent the barber from accessing their account.
                </span>
              )}
              {pendingStatus === "active" && (
                <span className="block mt-2 text-green-600">
                  This will give the barber full access to all features.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={isLoading}>
              {isLoading ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
