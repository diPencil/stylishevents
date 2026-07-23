"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { adminT, adminStatusT } from "@/lib/admin-translations"
import { format } from "date-fns"

function formatDate(value?: string) {
  if (!value) return { date: "-", time: "" }
  try {
    const d = new Date(value)
    return { date: format(d, "MMM d, yyyy,"), time: format(d, "hh:mm a") }
  } catch {
    return { date: "-", time: "" }
  }
}

export default function RegistrationsPage() {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const perPage = 20
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    platformApi
      .listRegistrations({ limit: perPage, offset: (page - 1) * perPage, includeMeta: true })
      .then((res) => {
        if (!active) return
        if (res && res.data) {
          setRegistrations(res.data || [])
          setTotal(res.pagination?.total || 0)
        } else {
          setRegistrations(res || [])
          setTotal(0)
        }
      })
      .catch(() => {
        if (!active) return
        setRegistrations([])
        setTotal(0)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [page])

  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{language === 'ar' ? 'التسجيلات' : 'Registrations'}</h1>
          <p className="mt-1 text-sm text-slate-500">{language === 'ar' ? 'عرض وإدارة التسجيلات عبر جميع الفعاليات.' : 'View and manage registrations across all events.'}</p>
        </div>
        <div>
          <Button asChild>
            <Link href="/admin/registrations/create">{adminT(language, 'overview.createFirstEvent') || (language === 'ar' ? 'إنشاء تسجيل' : 'New registration')}</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-extrabold">{adminT(language, 'overview.recentRegistrations')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">{adminT(language, 'common.loading')}</p>
          ) : registrations.length === 0 ? (
            <p className="text-sm text-slate-400">{adminT(language, 'overview.noRegistrations')}</p>
          ) : (
            <div className="space-y-3">
              {registrations.map((r) => {
                const created = formatDate(r.created_at)
                return (
                  <div key={r.id} className="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_160px] md:items-center">
                    <div>
                      <p className="text-sm font-extrabold">{r.registration_number || r.order_number || '-'}</p>
                      <p className="text-xs text-slate-500">{r.doctor_name || r.customer_name || adminT(language, 'common.customer')}</p>
                      <p className="text-xs text-slate-400">{language === 'ar' ? r.event_title_ar || r.event_title_en : r.event_title_en || r.event_title_ar}</p>
                    </div>
                    <div className="text-end">
                      <div className="flex items-center justify-end gap-3">
                        <Badge className="rounded-xl">{r.payment_status || r.registration_status}</Badge>
                        <div className="text-xs text-slate-400">{created.date} {created.time}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{total} {adminT(language, 'overview.registrations')}</div>
        <div className="flex items-center gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <div className="text-sm">{page} / {pages}</div>
          <Button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
        </div>
      </div>
    </section>
  )
}
