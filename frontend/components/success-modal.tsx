"use client"

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { QRCodeSVG } from "qrcode.react"
import countries from "i18n-iso-countries"
import ar from "i18n-iso-countries/langs/ar.json"
import en from "i18n-iso-countries/langs/en.json"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useRef, useState } from "react"

countries.registerLocale(ar)
countries.registerLocale(en)

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    data: {
        fullName: string
        eventName: string
        eventDate: string
        country?: string
        location: string
        expectedAttendance: string
        bookingNumber: string
        services: string[]
        createdAt?: string
        eventType?: string
        specialization?: string
    }
}

export function SuccessModal({ isOpen, onClose, data }: SuccessModalProps) {
    const { t, isRtl, language } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)
    const countryName = data.country ? countries.getName(data.country, language) : ""
    const origin = typeof window !== 'undefined' ? window.location.origin : "https://stylish-events.com"
    
    // Even more compact keys
    const compactData = {
        b: data.bookingNumber,
        n: data.fullName,
        e: data.eventName,
        d: data.eventDate,
        l: `${countryName || data.country || ""}, ${data.location}`,
        a: data.expectedAttendance,
        s: data.services,
        c: data.createdAt,
        g: language,
        t: data.eventType,
        p: data.specialization
    }
    
    const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(compactData))));
    const qrUrl = `${origin}/booking-details/?d=${encodedData}`

    const serviceLabels: Record<string, string> = {
        hotel: t("booking.hotelBooking"),
        airport: t("booking.airportReception"),
        trips: t("booking.entertainmentTrips"),
    }

    const handleDownload = async () => {
        if (!contentRef.current) return
        setIsLoading(true)
        try {
            const canvas = await html2canvas(contentRef.current, { 
                scale: 1.5, 
                useCORS: true, 
                backgroundColor: "#ffffff",
                windowWidth: contentRef.current.scrollWidth + 40
            } as any)
            // Use JPEG with 0.8 quality for much smaller file size
            const imgData = canvas.toDataURL("image/jpeg", 0.8)
            const pdf = new jsPDF({ 
                orientation: "portrait", 
                unit: "px", 
                format: [canvas.width / 1.5, canvas.height / 1.5] 
            })
            pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 1.5, canvas.height / 1.5)
            pdf.save(`Booking-${data.bookingNumber}.pdf`)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePrint = async () => {
        if (!contentRef.current) return
        
        const printContent = contentRef.current.innerHTML
        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
        if (!windowPrint) return

        const isArabic = language === 'ar'
        
        windowPrint.document.write(`
            <html dir="${isArabic ? 'rtl' : 'ltr'}">
                <head>
                    <title>Booking Receipt - ${data.bookingNumber}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; background: white; margin: 0; }
                        * { box-sizing: border-box; }
                        /* Hide UI specific elements */
                        button, svg, .order-2, .sm\\:order-1 { display: none !important; }
                        .rounded-3xl { border-radius: 2rem; }
                        .text-brand-blue { color: #2563eb; }
                        .text-brand-purple { color: #7c3aed; font-weight: bold; }
                        .bg-slate-50\\/50 { background-color: #f8fafc; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                        .flex { display: flex; align-items: center; justify-content: space-between; gap: 5px; }
                        .border-t { border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 15px; }
                        .border-b { border-bottom: 1px solid #f8fafc; padding-bottom: 4px; }
                        h2 { font-size: 18px; margin-bottom: 4px; text-align: center; }
                        p { font-size: 11px; color: #64748b; margin-bottom: 8px; text-align: center; }
                        .text-center { text-align: center; }
                        span { font-size: 10px; }
                        /* Ensure QR container still visible but without buttons side */
                        .sm\\:grid-cols-2 { grid-template-columns: 1fr !important; }
                    </style>
                </head>
                <body>
                    <div style="max-width: 450px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 2rem; padding: 25px; background: white;">
                        ${printContent}
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `)
        windowPrint.document.close()
    }

    const infoItems = [
        { label: t("booking.fullName"), value: data.fullName },
        { label: t("success.eventName"), value: data.eventName },
        { label: t("booking.eventType"), value: data.eventType === 'both' ? t('booking.both') : (data.eventType === 'conference' ? t('booking.conference') : t('booking.exhibition')) },
        { label: t("success.date"), value: data.eventDate },
        { label: t("success.location"), value: `${countryName || data.country}, ${data.location}` },
        { label: t("success.attendance"), value: data.expectedAttendance },
        { label: t("booking.specialization"), value: data.specialization || "-" },
        { label: t("success.services"), value: data.services.length > 0 ? data.services.map(s => serviceLabels[s] || s).join(" - ") : "-" }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[400px] sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
                <div className="bg-white m-2 rounded-[2rem] overflow-y-auto max-h-[85vh] sm:max-h-none shadow-sm border border-slate-100" ref={contentRef}>
                    <div className="p-6 sm:p-8 space-y-5">
                        
                        {/* Title Section (Slim & Simple) */}
                        <div className="text-center space-y-1.5">
                            <h2 className="text-base md:text-lg font-normal text-slate-600">
                                {t("success.title")}
                            </h2>
                            <p className="text-[11px] md:text-xs text-slate-400 font-normal">
                                {t("success.subtitle")}
                            </p>
                            <p className="text-brand-purple font-medium text-xs md:text-sm tracking-widest pt-1">
                                #{data.bookingNumber}
                            </p>
                        </div>

                        {/* Details Grid (Two Columns) */}
                        <div className="pt-4 border-t border-slate-50">
                            <h3 className={`text-[10px] font-black text-brand-blue mb-4 uppercase ${isRtl ? "" : "tracking-[0.2em]"}`}>
                                {isRtl ? "تفاصيل الحجز المبدئي" : "PRELIMINARY DETAILS"}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                {infoItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-slate-50/50 last:border-0 md:last:border-b">
                                        <span className="text-slate-400 text-[9px] uppercase font-bold shrink-0">{item.label}</span>
                                        <span className="text-[11px] font-medium text-slate-700 text-end whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Actions Section (Split Desktop Layout) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-slate-50 items-center">
                            {/* Stacked Buttons Side */}
                            <div className="flex flex-col gap-2 order-2 sm:order-1">
                                <Button 
                                    onClick={handlePrint}
                                    variant="outline"
                                    className="h-11 text-[10px] sm:text-xs font-bold rounded-2xl border-slate-200 hover:bg-slate-50 gap-2 w-full"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    {t("success.print")}
                                </Button>
                                <Button 
                                    onClick={handleDownload}
                                    disabled={isLoading}
                                    className="h-11 text-[10px] sm:text-xs font-bold rounded-2xl bg-slate-900 hover:bg-black text-white gap-2 w-full"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    {isLoading ? t("common.loading") : t("success.download")}
                                </Button>
                            </div>

                            {/* QR Code Side */}
                            <div className="flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl p-4 border border-slate-100 order-1 sm:order-2">
                                <div className="bg-white p-2 rounded-xl shadow-sm mb-2 border border-slate-100">
                                    <QRCodeSVG value={qrUrl} size={130} level="H" />
                                </div>
                                <p className={`text-[7px] font-black text-slate-300 uppercase ${isRtl ? "" : "tracking-widest"}`}>
                                    {isRtl ? "امسح للتفاصيل" : "SCAN FOR DETAILS"}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
