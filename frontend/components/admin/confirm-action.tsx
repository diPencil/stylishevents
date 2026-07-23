"use client"

import { AlertTriangle, CheckCircle2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type ConfirmActionProps = {
  children: React.ReactNode
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "primary" | "danger" | "success"
  onConfirm: () => void | Promise<void>
}

export function ConfirmAction({
  children,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  onConfirm,
}: ConfirmActionProps) {
  const { language, isRtl } = useLanguage()

  const copy = {
    title: title || (language === "ar" ? "هل أنت متأكد؟" : "Are you sure?"),
    description:
      description ||
      (language === "ar"
        ? "سيتم تنفيذ هذا الإجراء فورًا. راجع البيانات قبل التأكيد."
        : "This action will run immediately. Please review before confirming."),
    confirm: confirmLabel || (language === "ar" ? "نعم، تأكيد" : "Yes, confirm"),
    cancel: cancelLabel || (language === "ar" ? "إلغاء" : "Cancel"),
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        dir={isRtl ? "rtl" : "ltr"}
        className="max-w-[92vw] overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-md"
      >
        <div className="relative">
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-1",
              tone === "danger" && "bg-red-500",
              tone === "success" && "bg-emerald-500",
              tone === "primary" && "bg-primary"
            )}
          />
          <div className="p-6">
            <AlertDialogHeader className="text-start">
              <div
                className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                  tone === "danger" && "bg-red-50 text-red-600",
                  tone === "success" && "bg-emerald-50 text-emerald-600",
                  tone === "primary" && "bg-primary/10 text-primary"
                )}
              >
                {tone === "success" ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
              </div>
              <AlertDialogTitle className="text-2xl font-extrabold tracking-tight text-slate-950">
                {copy.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium leading-6 text-slate-500">
                {copy.description}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 grid grid-cols-2 gap-3 space-x-0 sm:space-x-0">
              <AlertDialogCancel className="mt-0 h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold text-slate-700 hover:bg-slate-100">
                {copy.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className={cn(
                  "h-12 rounded-2xl font-extrabold shadow-lg transition hover:scale-[1.01]",
                  tone === "danger" && "bg-red-600 text-white hover:bg-red-700",
                  tone === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
                  tone === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {copy.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
