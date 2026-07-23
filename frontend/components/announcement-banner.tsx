"use client"

import { motion } from "framer-motion"
import { Rocket } from "lucide-react"
import Link from "next/link" // Assuming Link is from next/link based on href and usage

import { useLanguage } from "@/contexts/language-context"

export function AnnouncementBanner() {
    const { isRtl } = useLanguage()
    return (
        <div className="bg-brand-blue text-white py-1.5 z-50 overflow-hidden border-b border-[#ffffff10]">
            <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-[12px] font-bold tracking-wide">
                <Rocket className="w-3.5 h-3.5" />
                <span>{isRtl ? "ميزة جديدة: تأكيد فوري لحجز الفنادق -" : "New Feature: Instant Hotel Booking Confirmation –"}</span>
                <Link href="#booking-form" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                    {isRtl ? "احجز الآن" : "Book Now"}
                </Link>
            </div>
        </div>
    )
}
