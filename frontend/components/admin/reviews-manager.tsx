"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Eye, MessageSquare, MoreHorizontal, Star, ThumbsDown, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPageHeader, MetricCard, TableSearch } from "@/components/admin/admin-primitives"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { useAdminPermissions } from "@/components/admin/admin-shell"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"

type ReviewStatus = "pending" | "published" | "rejected"

type Review = {
  id: string
  customer: string
  email: string
  event: string
  rating: number
  status: ReviewStatus
  title: string
  body: string
  submittedAt: string
}

function statusClass(status: ReviewStatus) {
  if (status === "published") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "pending") return "bg-amber-50 text-amber-700 hover:bg-amber-50"
  return "bg-red-50 text-red-700 hover:bg-red-50"
}

function normalizeReview(row: any): Review {
  return {
    id: String(row.id),
    customer: row.attendee_name || row.customer_name || "Customer",
    email: row.attendee_email || row.customer_email || "",
    event: row.event_title_en || row.event_title_ar || "Event",
    rating: Number(row.rating || 0),
    status: row.status === "approved" ? "published" : row.status === "rejected" ? "rejected" : "pending",
    title: row.title || "Review",
    body: row.comment || "",
    submittedAt: row.created_at || "",
  }
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn("h-3.5 w-3.5", index < value ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
      ))}
      <span className="ml-1 text-xs font-extrabold text-slate-600">{value.toFixed(1)}</span>
    </div>
  )
}

export function ReviewsManager() {
  const { language } = useLanguage()
  const { can } = useAdminPermissions()
  const canManageReviews = can("reviews.manage")
  const [reviews, setReviews] = useState<Review[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    let active = true
    platformApi.listReviews()
      .then((rows) => {
        if (active) setReviews((rows || []).map(normalizeReview))
      })
      .catch((error) => {
        if (active) toast.error("Could not load reviews", { description: error instanceof Error ? error.message : "Check the backend connection." })
      })
    return () => {
      active = false
    }
  }, [])

  const filteredReviews = reviews.filter((review) =>
    `${review.customer} ${review.event} ${review.title}`.toLowerCase().includes(search.toLowerCase())
  )

  const totals = useMemo(() => {
    const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
    return {
      average: average.toFixed(1),
      pending: reviews.filter((review) => review.status === "pending").length,
      published: reviews.filter((review) => review.status === "published").length,
      rejected: reviews.filter((review) => review.status === "rejected").length,
    }
  }, [reviews])

  const setStatus = async (id: string, status: ReviewStatus) => {
    try {
      await platformApi.updateReviewStatus(id, status)
      setReviews((current) => current.map((review) => review.id === id ? { ...review, status } : review))
      toast.success("Review updated", { description: `Review is now ${status}.` })
    } catch (error) {
      toast.error("Review update failed", { description: error instanceof Error ? error.message : "Could not update review." })
    }
  }

  const deleteReview = async (id: string) => {
    try {
      await platformApi.deleteReview(id)
      setReviews((current) => current.filter((review) => review.id !== id))
      toast.success("Review deleted")
    } catch (error) {
      toast.error("Delete failed", { description: error instanceof Error ? error.message : "Could not delete review." })
    }
  }

  const renderTable = (items: Review[]) => (
    <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base font-extrabold">{adminT(language, "reviews.table")}</CardTitle>
          <p className="mt-1 text-sm font-medium text-slate-400">{language === "ar" ? "راجع تقييمات العملاء وحافظ على جودة تقييمات الفعاليات." : "Moderate customer feedback and keep event ratings clean."}</p>
        </div>
        <TableSearch value={search} onChange={setSearch} placeholder={language === "ar" ? "ابحث في المراجعات أو الفعاليات..." : "Search review or event..."} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead className="w-14">#</TableHead>
                <TableHead>{adminT(language, "common.customer")}</TableHead>
                <TableHead>{adminT(language, "common.event")}</TableHead>
                <TableHead>{language === "ar" ? "التقييم" : "Rating"}</TableHead>
                <TableHead>{language === "ar" ? "المراجعة" : "Review"}</TableHead>
                <TableHead>{adminT(language, "common.status")}</TableHead>
                <TableHead>{language === "ar" ? "تاريخ الإرسال" : "Submitted"}</TableHead>
                <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((review, index) => (
                <TableRow key={review.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                  <TableCell className="text-sm font-extrabold text-slate-400">{index + 1}</TableCell>
                  <TableCell>
                    <p className="text-sm font-extrabold text-[#17172f]">{review.customer}</p>
                    <p className="text-xs font-semibold text-slate-400">{review.email}</p>
                  </TableCell>
                  <TableCell className="max-w-[220px]"><p className="line-clamp-2 text-sm font-bold text-slate-600">{review.event}</p></TableCell>
                  <TableCell><Stars value={review.rating} /></TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm font-extrabold text-[#17172f]">{review.title}</p>
                    <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-400">{review.body}</p>
                  </TableCell>
                  <TableCell><Badge className={cn("rounded-xl capitalize", statusClass(review.status))}>{adminStatusT(language, review.status)}</Badge></TableCell>
                  <TableCell><TableDateTime value={review.submittedAt} /></TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-slate-50"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl border-0 p-2 shadow-xl">
                          <DropdownMenuLabel className="text-xs text-slate-400">{adminT(language, "common.actions")}</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 font-semibold">
                            <Link href={`/admin/reviews/${review.id}`}>
                              <Eye className="h-4 w-4" />
                              {adminT(language, "common.viewDetails")}
                            </Link>
                          </DropdownMenuItem>
                          {canManageReviews && (
                            <>
                              <ConfirmAction title="Publish review?" description="This customer review will become visible in event ratings." confirmLabel="Publish" tone="success" onConfirm={() => setStatus(review.id, "published")}>
                                <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700">
                                  <BadgeCheck className="h-4 w-4" />
                                  {adminT(language, "reviews.published")}
                                </DropdownMenuItem>
                              </ConfirmAction>
                              <ConfirmAction title="Reject review?" description="This review will be hidden from public event ratings." confirmLabel="Reject" tone="danger" onConfirm={() => setStatus(review.id, "rejected")}>
                                <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-red-600 focus:bg-red-50 focus:text-red-700">
                                  <ThumbsDown className="h-4 w-4" />
                                  {adminT(language, "reviews.rejected")}
                                </DropdownMenuItem>
                              </ConfirmAction>
                              <DropdownMenuSeparator />
                              <ConfirmAction title="Delete review?" description="This review will be removed from the moderation queue." confirmLabel="Delete" tone="danger" onConfirm={() => deleteReview(review.id)}>
                                <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-red-600 focus:bg-red-50 focus:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                  {adminT(language, "common.delete")}
                                </DropdownMenuItem>
                              </ConfirmAction>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow={language === "ar" ? "عمليات المراجعات" : "Reviews Operations"}
        title={adminT(language, "reviews.title")}
        description={adminT(language, "reviews.subtitle")}
      />

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: language === "ar" ? "متوسط التقييم" : "Average Rating", value: totals.average, icon: Star },
          { label: adminT(language, "reviews.pending"), value: totals.pending, icon: MessageSquare },
          { label: adminT(language, "reviews.published"), value: totals.published, icon: BadgeCheck },
          { label: adminT(language, "reviews.rejected"), value: totals.rejected, icon: ThumbsDown },
        ].map((item) => {
          const Icon = item.icon
          return <MetricCard key={item.label} label={item.label} value={item.value} icon={Icon} />
        })}
      </div>

      <Tabs defaultValue="all" className="space-y-5">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white/70 p-1 lg:w-[680px]">
          <TabsTrigger value="all" className="rounded-xl">{language === "ar" ? "كل المراجعات" : "All Reviews"}</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl">{adminT(language, "reviews.pending")}</TabsTrigger>
          <TabsTrigger value="published" className="rounded-xl">{adminT(language, "reviews.published")}</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-xl">{adminT(language, "reviews.rejected")}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderTable(filteredReviews)}</TabsContent>
        {(["pending", "published", "rejected"] as ReviewStatus[]).map((status) => (
          <TabsContent key={status} value={status}>{renderTable(filteredReviews.filter((review) => review.status === status))}</TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
