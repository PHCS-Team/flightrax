"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "color-mix(in oklch, var(--success), var(--popover) 88%)",
          "--success-text": "var(--foreground)",
          "--success-border": "color-mix(in oklch, var(--success), var(--popover) 45%)",
          "--info-bg": "color-mix(in oklch, var(--tertiary), var(--popover) 88%)",
          "--info-text": "var(--foreground)",
          "--info-border": "color-mix(in oklch, var(--tertiary), var(--popover) 45%)",
          "--warning-bg": "color-mix(in oklch, var(--warning), var(--popover) 84%)",
          "--warning-text": "var(--foreground)",
          "--warning-border": "color-mix(in oklch, var(--warning), var(--popover) 35%)",
          "--error-bg": "color-mix(in oklch, var(--destructive), var(--popover) 88%)",
          "--error-text": "var(--foreground)",
          "--error-border": "color-mix(in oklch, var(--destructive), var(--popover) 42%)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast border shadow-sm",
          success: "text-foreground [&_[data-icon]]:text-success",
          info: "text-foreground [&_[data-icon]]:text-tertiary",
          warning: "text-foreground [&_[data-icon]]:text-warning",
          error: "text-foreground [&_[data-icon]]:text-destructive",
          closeButton: "border-border bg-popover text-foreground hover:bg-muted",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
