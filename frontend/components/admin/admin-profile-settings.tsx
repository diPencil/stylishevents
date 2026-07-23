"use client"

import { useEffect, useState } from "react"
import { Camera, LockKeyhole, Save, ShieldCheck, User, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"

const profileStorageKey = "stylish-events-admin-profile"

function readStoredProfile() {
  if (typeof window === "undefined") return null
  try {
    const saved = window.localStorage.getItem(profileStorageKey)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function normalizeProfile(user: any) {
  return {
    id: user?.id,
    name: user?.name || "Super Admin",
    email: user?.email || "admin@stylish-events.com",
    phone: user?.phone || "+20 100 000 0000",
    username: user?.username || "superadmin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: apiAssetUrl(user?.avatarUrl || user?.avatar_url || ""),
  }
}

export function AdminProfileSettings({ section = "profile" }: { section?: "profile" | "security" | "avatar" }) {
  const { language } = useLanguage()
  const [profile, setProfile] = useState({
    id: undefined as number | undefined,
    name: "Super Admin",
    email: "admin@stylish-events.com",
    phone: "+20 100 000 0000",
    username: "superadmin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = readStoredProfile()
    if (stored) setProfile((current) => ({ ...current, ...normalizeProfile(stored) }))

    const token =
      window.localStorage.getItem("stylish-events-admin-token") ||
      window.localStorage.getItem("stylish-events-auth-token") ||
      window.localStorage.getItem("stylish-events-token")
    if (!token) return

    platformApi.me(token)
      .then((user) => {
        const normalized = normalizeProfile(user)
        setProfile((current) => ({ ...current, ...normalized }))
        window.localStorage.setItem(profileStorageKey, JSON.stringify(normalized))
        window.dispatchEvent(new CustomEvent("stylish-events-admin-profile-updated", { detail: normalized }))
      })
      .catch(() => undefined)
  }, [])

  async function uploadAvatar(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    try {
      const uploaded = await platformApi.uploadUserAvatar({ fileName: file.name, dataUrl })
      const url = apiAssetUrl(uploaded.url)
      toast.success(language === "ar" ? "تم رفع الصورة" : "Avatar uploaded", { description: language === "ar" ? "رابط الصورة جاهز. احفظ التغييرات لتطبيقها." : "Image URL is ready. Save changes to apply it." })
      return url
    } catch (error) {
      toast.error(language === "ar" ? "فشل رفع الصورة" : "Avatar upload failed", { description: error instanceof Error ? error.message : language === "ar" ? "تعذر رفع الصورة." : "Image could not be uploaded." })
      return ""
    }
  }

  async function saveProfile() {
    if (section === "security") {
      if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
        toast.error(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match", { description: language === "ar" ? "تأكيد كلمة المرور يجب أن يطابق كلمة المرور الجديدة." : "Confirm password must match the new password." })
        return
      }
      try {
        await platformApi.updateMyPassword({
          currentPassword: profile.currentPassword,
          newPassword: profile.newPassword,
        })
        setProfile((current) => ({ ...current, currentPassword: "", newPassword: "", confirmPassword: "" }))
        toast.success(language === "ar" ? "تم تحديث كلمة المرور" : "Password updated", { description: language === "ar" ? "كلمة المرور الجديدة أصبحت فعالة الآن." : "Your new password is active now." })
      } catch (error) {
        toast.error(language === "ar" ? "فشل تحديث كلمة المرور" : "Password update failed", { description: error instanceof Error ? error.message : language === "ar" ? "تعذر تحديث كلمة المرور." : "Could not update password." })
      }
      return
    }

    setSaving(true)
    const payload = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      username: profile.username,
      avatarUrl: profile.avatarUrl || null,
    }

    try {
      const saved = await platformApi.updateMe(payload)
      const normalized = normalizeProfile(saved)
      setProfile((current) => ({ ...current, ...normalized }))
      window.localStorage.setItem(profileStorageKey, JSON.stringify(normalized))
      window.dispatchEvent(new CustomEvent("stylish-events-admin-profile-updated", { detail: normalized }))
      toast.success(language === "ar" ? "تم حفظ الحساب" : "Profile saved", { description: language === "ar" ? "تم تحديث صورة وبيانات الحساب في الداشبورد." : "Dashboard avatar and account details were updated." })
    } catch (error) {
      toast.error(language === "ar" ? "فشل حفظ الحساب" : "Profile save failed", { description: error instanceof Error ? error.message : language === "ar" ? "تعذر تحديث الحساب." : "Could not update profile." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">{adminT(language, "profile.badge")}</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">
          {section === "security" ? adminT(language, "common.security") : section === "avatar" ? adminT(language, "profile.avatarTitle") : adminT(language, "profile.title")}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">{adminT(language, "profile.subtitle")}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-extrabold">
              {section === "security" ? <LockKeyhole className="h-5 w-5 text-[hsl(var(--primary))]" /> : section === "avatar" ? <Camera className="h-5 w-5 text-[hsl(var(--primary))]" /> : <User className="h-5 w-5 text-[hsl(var(--primary))]" />}
              {section === "security" ? (language === "ar" ? "بيانات الدخول" : "Login credentials") : section === "avatar" ? adminT(language, "profile.avatarSettings") : (language === "ar" ? "البيانات الشخصية" : "Personal information")}
            </CardTitle>
            <CardDescription>{adminT(language, "profile.settingsCopy")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {section === "profile" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{adminT(language, "profile.name")}</Label>
                    <Input className="h-11 rounded-xl" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{adminT(language, "profile.username")}</Label>
                    <Input className="h-11 rounded-xl" value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{adminT(language, "profile.email")}</Label>
                    <Input className="h-11 rounded-xl" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{adminT(language, "profile.phone")}</Label>
                    <Input className="h-11 rounded-xl" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                  </div>
                </div>
              </>
            )}

            {section === "security" && (
              <>
                <div className="space-y-2">
                  <Label>{adminT(language, "profile.currentPassword")}</Label>
                  <Input type="password" className="h-11 rounded-xl" value={profile.currentPassword} onChange={(event) => setProfile({ ...profile, currentPassword: event.target.value })} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{adminT(language, "profile.newPassword")}</Label>
                    <Input type="password" className="h-11 rounded-xl" value={profile.newPassword} onChange={(event) => setProfile({ ...profile, newPassword: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{adminT(language, "profile.confirmPassword")}</Label>
                    <Input type="password" className="h-11 rounded-xl" value={profile.confirmPassword} onChange={(event) => setProfile({ ...profile, confirmPassword: event.target.value })} />
                  </div>
                </div>
              </>
            )}

            {section === "avatar" && (
              <ImageUrlDropzone
                label={adminT(language, "profile.avatarUrl")}
                value={profile.avatarUrl}
                onChange={(value) => setProfile({ ...profile, avatarUrl: value })}
                onFileUpload={uploadAvatar}
                placeholder="/avatar.png"
              />
            )}

            <ConfirmAction title={language === "ar" ? "حفظ تغييرات الحساب؟" : "Save account changes?"} description={language === "ar" ? "سيتم تطبيق تغييرات الحساب على ملف الداشبورد." : "These admin account changes will be applied to the dashboard profile."} confirmLabel={language === "ar" ? "حفظ التغييرات" : "Save changes"} tone="success" onConfirm={saveProfile}>
              <Button disabled={saving} className="h-11 rounded-xl bg-[hsl(var(--primary))] px-5 font-extrabold text-white">
                <Save className="h-4 w-4" />
                {saving ? adminT(language, "common.loading") : (language === "ar" ? "حفظ التغييرات" : "Save changes")}
              </Button>
            </ConfirmAction>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold">{adminT(language, "profile.profilePreview")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" /> : <Users className="h-7 w-7" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#17172f]">{profile.name}</p>
                <p className="truncate text-xs font-bold text-slate-400">{profile.email}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#17172f]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--primary))]" />
                {adminT(language, "profile.adminPermissions")}
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{adminT(language, "profile.fullAccess")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

