"use client"

import { useRef, useState } from "react"
import { ImagePlus, Link2, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"

type ImageUrlDropzoneProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onFileUpload?: (file: File) => Promise<string> | string
  placeholder?: string
  helperText?: string
  className?: string
  previewClassName?: string
  accept?: "image" | "media"
}

type ImageGalleryDropzoneProps = {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  className?: string
}

function firstDroppedUrl(event: React.DragEvent) {
  const uriList = event.dataTransfer.getData("text/uri-list")
  const plainText = event.dataTransfer.getData("text/plain")
  return (uriList || plainText || "").split("\n").find(Boolean)?.trim() || ""
}

function droppedAssetFile(event: React.DragEvent, accept: "image" | "media") {
  return Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/") || (accept === "media" && item.type.startsWith("video/")))
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(reader.error || new Error("Could not read image"))
    reader.readAsDataURL(file)
  })
}

export function ImageUrlDropzone({
  label,
  value,
  onChange,
  onFileUpload,
  placeholder = "https://example.com/image.jpg",
  className,
  previewClassName,
  accept = "image",
}: ImageUrlDropzoneProps) {
  const { language } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(value)
  const previewUrl = apiAssetUrl(value)
  const uploadLabel =
    accept === "media"
      ? language === "ar"
        ? "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0623\u0648 \u0641\u064a\u062f\u064a\u0648"
        : "Upload media"
      : language === "ar"
        ? "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629"
        : "Upload image"
  const clearLabel =
    accept === "media"
      ? language === "ar"
        ? "\u0645\u0633\u062d \u0627\u0644\u0645\u064a\u062f\u064a\u0627"
        : "Clear media"
      : language === "ar"
        ? "\u0645\u0633\u062d \u0627\u0644\u0635\u0648\u0631\u0629"
        : "Clear image"

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = droppedAssetFile(event, accept)
    if (file) {
      await handleFileUpload(file)
      return
    }
    const nextValue = firstDroppedUrl(event)
    if (nextValue) onChange(nextValue)
  }

  const handleFileUpload = async (file?: File) => {
    if (!file || (!file.type.startsWith("image/") && !(accept === "media" && file.type.startsWith("video/")))) return
    setUploading(true)
    try {
      const uploadedUrl = onFileUpload
        ? await onFileUpload(file)
        : (await platformApi.uploadPlatformAsset({ fileName: file.name, dataUrl: await fileToDataUrl(file) }))?.url
      if (uploadedUrl) onChange(uploadedUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <input ref={inputRef} type="file" accept={accept === "media" ? "image/*,video/mp4,video/webm,video/ogg" : "image/*"} className="hidden" onChange={(event) => handleFileUpload(event.target.files?.[0])} />
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-3 transition",
          dragActive && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]"
        )}
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
          <div className="grid min-w-0 gap-2">
            <div className="flex min-w-0 gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                <Link2 className="h-4 w-4" />
              </div>
              <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={uploading}
                className="h-10 min-w-0 rounded-2xl border-slate-200 bg-white text-sm font-bold"
              />
            </div>
            <div className="pl-0 sm:pl-12">
              <TooltipProvider delayDuration={120}>
                <div className="flex flex-wrap gap-2">
                  <IconAction label={uploadLabel} onClick={() => inputRef.current?.click()} icon={<UploadCloud className="h-4 w-4" />} />
                  <IconAction label={clearLabel} onClick={() => onChange("")} icon={<X className="h-4 w-4" />} tone="danger" disabled={!value} />
                </div>
              </TooltipProvider>
            </div>
          </div>

          <div className={cn("relative h-[84px] w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 sm:h-[92px]", previewClassName)}>
            {value && previewUrl && isVideo ? (
              <video src={previewUrl} className="h-full w-full object-cover" muted playsInline controls />
            ) : value && previewUrl ? (
              <img src={previewUrl} alt={`${label} preview`} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-300">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px] font-extrabold">{adminT(language, "common.preview")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImageGalleryDropzone({ label, value, onChange, className }: ImageGalleryDropzoneProps) {
  const { language } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const images = value.split("\n").map((item) => item.trim()).filter(Boolean)

  const appendImage = (nextValue: string) => {
    if (!nextValue) return
    const existing = new Set(images)
    if (existing.has(nextValue)) return
    onChange([...images, nextValue].join("\n"))
  }

  const uploadGalleryFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (!imageFiles.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        imageFiles.map(async (file) => {
          const result = await platformApi.uploadPlatformAsset({ fileName: file.name, dataUrl: await fileToDataUrl(file) })
          return result?.url || ""
        })
      )
      onChange([...images, ...uploaded.filter(Boolean)].join("\n"))
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const files = Array.from(event.dataTransfer.files).filter((item) => item.type.startsWith("image/"))
    if (files.length) {
      await uploadGalleryFiles(files)
      return
    }
    appendImage(firstDroppedUrl(event))
  }

  const handleFileUpload = async (files?: FileList | null) => {
    if (!files) return
    await uploadGalleryFiles(Array.from(files))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleFileUpload(event.target.files)} />
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-3 transition",
          dragActive && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]"
        )}
      >
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={"https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg"}
          className="min-h-[118px] rounded-2xl border-slate-200 bg-white font-semibold leading-6"
        />
        <TooltipProvider delayDuration={120}>
          <div className="mt-3 flex flex-wrap gap-2">
            <IconAction label={uploading ? adminT(language, "common.uploading") : adminT(language, "common.uploadImages")} onClick={() => inputRef.current?.click()} icon={<UploadCloud className="h-4 w-4" />} disabled={uploading} />
            <IconAction label={adminT(language, "common.clearGallery")} onClick={() => onChange("")} icon={<X className="h-4 w-4" />} tone="danger" disabled={images.length === 0} />
          </div>
        </TooltipProvider>
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {images.slice(0, 10).map((image) => (
              <div key={image} className="aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
                <img src={apiAssetUrl(image)} alt={adminT(language, "common.imagePreview")} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function IconAction({
  label,
  icon,
  onClick,
  tone = "primary",
  disabled = false,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  tone?: "primary" | "danger"
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          className={cn(
            "h-10 w-10 rounded-2xl bg-white shadow-sm",
            tone === "primary" && "text-[hsl(var(--primary))]",
            tone === "danger" && "text-red-600"
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="rounded-xl text-xs font-bold">{label}</TooltipContent>
    </Tooltip>
  )
}
