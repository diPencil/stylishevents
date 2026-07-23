"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export default function TermsPage() {
  const { isRtl } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-1 py-20 bg-slate-50/30">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100"
          >
            <h1 className="text-4xl font-extrabold mb-10 text-slate-900 border-b pb-6">
              {isRtl ? "الشروط والأحكام" : "Terms and Conditions"}
            </h1>

            <div className="space-y-8 text-slate-600 leading-relaxed text-lg">
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "1. قبول الشروط" : "1. Acceptance of Terms"}</h2>
                <p>
                  {isRtl 
                    ? "باستخدامك لموقع ديركت ايفنتس، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام خدماتنا."
                    : "By using Stylish Events, you agree to comply with and be bound by these terms of use. If you do not agree with any of these terms, please do not use our services."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "2. الخدمات المقدمة" : "2. Services Provided"}</h2>
                <p>
                  {isRtl 
                    ? "نحن نقدم منصة لتنظيم وحجز المعارض والمؤتمرات الدولية، بما في ذلك خدمات التسجيل، حجز الفنادق، والاستقبال."
                    : "We provide a platform for organizing and booking international exhibitions and conferences, including registration, hotel booking, and reception services."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "3. سياسة الحجز والإلغاء" : "3. Booking & Cancellation"}</h2>
                <p>
                  {isRtl 
                    ? "تخضع جميع الحجوزات للتوافر. سياسة الإلغاء تختلف بناءً على نوع الفعالية ومزودي الخدمة الطرف الثالث (مثل الفنادق)."
                    : "All bookings are subject to availability. Cancellation policies vary based on the event type and third-party service providers (e.g., hotels)."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "4. المسؤولية" : "4. Liability"}</h2>
                <p>
                  {isRtl 
                    ? "ديركت ايفنتس مسؤولة عن تنظيم الخدمات المتفق عليها، ولكننا لسنا مسؤولين عن أي تغييرات خارجة عن إرادتنا ناتجة عن القوة القاهرة."
                    : "Stylish Events is responsible for organizing the agreed services, but we are not liable for any changes beyond our control resulting from force majeure."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "5. التحديثات" : "5. Updates"}</h2>
                <p>
                  {isRtl 
                    ? "نحتفظ بالحق في تحديث هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة مباشرة."
                    : "We reserve the right to update these terms at any time. Changes will be posted on this page immediately."}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
