'use client'

import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={3500}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const duration = props.duration ?? 3500
        const isDestructive = variant === 'destructive'
        return (
          <Toast key={id} duration={duration} variant={variant} {...props}>
            <div className="flex min-w-0 items-start gap-2.5">
              {isDestructive ? (
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-300" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-300" />
              )}
              <div className="grid min-w-0 gap-0.5">
                {title && <ToastTitle className="text-[17px] font-semibold leading-6">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
              )}
              </div>
            </div>
            {action}
            <ToastClose />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/15">
              <div
                className="h-full w-full origin-left animate-[toast-progress_linear_forwards]"
                style={{
                  animationDuration: `${duration}ms`,
                  backgroundColor: isDestructive ? 'rgb(252 165 165 / 0.9)' : 'rgb(59 130 246 / 0.95)',
                }}
              />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
