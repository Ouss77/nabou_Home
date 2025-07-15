"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Corrected import
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, Clock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface BlockedTime {
  id: string
  store_id: string
  blocked_date: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
}

interface BlockTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  blockedTimes: BlockedTime[]
  onSuccess: () => void
}

export function BlockTimeDialog({ open, onOpenChange, storeId, blockedTimes, onSuccess }: BlockTimeDialogProps) {
  const { t } = useLanguage()
  const [blockedDate, setBlockedDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const resetForm = () => {
    setBlockedDate("")
    setStartTime("")
    setEndTime("")
    setReason("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/barber/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          blockedDate,
          startTime,
          endTime,
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to block time")
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block time")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (blockedTimeId: string) => {
    if (!confirm(t.blockTime.deleteConfirm)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/barber/blocked-times/${blockedTimeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete blocked time")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blocked time")
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.blockTime.blockTime}</DialogTitle>
          <DialogDescription>{t.blockTime.blockTimeDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Block Time Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t.blockTime.addBlockedTime}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockedDate">{t.booking.date}</Label>
                    <Input
                      id="blockedDate"
                      type="date"
                      value={blockedDate}
                      onChange={(e) => setBlockedDate(e.target.value)}
                      min={today}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">{t.blockTime.startTime}</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">{t.blockTime.endTime}</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">{t.blockTime.reason}</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.blockTime.reasonPlaceholder}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Clock className="mr-2 h-4 w-4" />
                    {t.blockTime.blockTime}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Blocked Times List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.blockTime.currentBlockedTimes}</h3>
            {blockedTimes.length === 0 ? (
              <p className="text-muted-foreground">{t.blockTime.noBlockedTimes}</p>
            ) : (
              <div className="grid gap-4">
                {blockedTimes.map((blockedTime) => (
                  <Card key={blockedTime.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(blockedTime.blocked_date).toLocaleDateString()}
                            </span>
                            <span className="text-muted-foreground">
                              {blockedTime.start_time} - {blockedTime.end_time}
                            </span>
                          </div>
                          {blockedTime.reason && <p className="text-sm text-muted-foreground">{blockedTime.reason}</p>}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(blockedTime.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
