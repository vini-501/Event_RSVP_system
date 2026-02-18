'use client'

import { ReactNode } from 'react'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConfirmVariant = 'default' | 'destructive' | 'success'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: ConfirmVariant
  isLoading?: boolean
  children?: ReactNode
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    buttonVariant: 'default' as const,
  },
  destructive: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-500/10',
    buttonVariant: 'destructive' as const,
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    buttonVariant: 'default' as const,
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4">
          <div className={`rounded-xl p-2.5 ${config.iconBg} shrink-0`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <DialogDescription className="mt-1.5">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {children && (
          <div className="py-2">{children}</div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-xl"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl shadow-md shadow-primary/20"
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
