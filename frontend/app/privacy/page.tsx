"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export default function PrivacyPage() {
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
              {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>

            <div className="space-y-8 text-slate-600 leading-relaxed text-lg">
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "1. جمع المعلومات" : "1. Information Collection"}</h2>
                <p>
                  {isRtl 
                    ? "نحن نجمع المعلومات التي تزودنا بها عند ملء نموذج الحجز، مثل الاسم، البريد الإلكتروني، ورقم الهاتف، لتسهيل عملية تنظيم فعاليتك."
                    : "We collect information you provide when filling out the booking form, such as name, email, and phone number, to facilitate the organization of your event."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "2. استخدام المعلومات" : "2. Use of Information"}</h2>
                <p>
                  {isRtl 
                    ? "تستخدم معلوماتك فقط لغرض تأكيد الحجز، التواصل معك بشأن الفعالية، وتحسين تجربة المستخدم الخاصة بك."
                    : "Your information is used only for confirming bookings, communicating with you about the event, and improving your user experience."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "3. حماية البيانات" : "3. Data Protection"}</h2>
                <p>
                  {isRtl 
                    ? "نحن نستخدم بروتوكولات أمان متقدمة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الكشف عنها."
                    : "We use advanced security protocols to protect your personal data from unauthorized access or disclosure."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "4. مشاركة المعلومات" : "4. Sharing Information"}</h2>
                <p>
                  {isRtl 
                    ? "نحن لا نبيع أو نؤجر معلوماتك لأطراف خارجية. قد نشارك بعض البيانات مع شركائنا (مثل الفنادق) فقط لإتمام خدمات الحجز الخاصة بك."
                    : "We do not sell or rent your information to third parties. We may share some data with our partners (e.g., hotels) only to complete your booking services."}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isRtl ? "5. حقوقك" : "5. Your Rights"}</h2>
                <p>
                  {isRtl 
                    ? "لديك الحق في طلب الوصول إلى بياناتك الشخصية التي نحتفظ بها، أو طلب تصحيحها أو حذفها في أي وقت عبر التواصل معنا."
                    : "You have the right to request access to your personal data we hold, or request its correction or deletion at any time by contacting us."}
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
