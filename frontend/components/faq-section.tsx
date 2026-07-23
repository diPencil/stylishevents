"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"

export function FaqSection() {
  const { isRtl } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [siteContent, setSiteContent] = useState<any>(null)

  useEffect(() => {
    import("@/lib/platform-api").then(({ platformApi }) => {
      platformApi.getSiteContentSettings().then((data) => {
        if (data) setSiteContent(data)
      })
    })
  }, [])

  const defaultFaqs = [
    {
      id: "faq-1",
      qEn: "How do I sign up?",
      qAr: "كيف يمكنني التسجيل؟",
      aEn: "You can easily sign up by clicking the Book Now button and filling in the required information.",
      aAr: "يمكنك التسجيل بسهولة من خلال الضغط على زر اطلب حجزك وملء البيانات المطلوبة."
    },
    {
      id: "faq-2",
      qEn: "What makes us different?",
      qAr: "ما الذي يميزنا عن الآخرين؟",
      aEn: "We provide an integrated solution for event management with a focus on user experience and high professionalism.",
      aAr: "نحن نقدم حلاً متكاملاً لإدارة الفعاليات مع التركيز على تجربة المستخدم والاحترافية العالية."
    },
    {
      id: "faq-3",
      qEn: "How much does it cost?",
      qAr: "ما هي تكلفة الخدمات؟",
      aEn: "Cost varies based on the type of event and services required. You can request a custom quote.",
      aAr: "تختلف التكلفة بناءً على نوع الفعالية والخدمات المطلوبة. يمكنك طلب عرض سعر مخصص."
    },
    {
      id: "faq-4",
      qEn: "How long does it take to design a website?",
      qAr: "كم يستغرق تنظيم المعرض؟",
      aEn: "Time depends on the size and requirements of the exhibition, usually taking two weeks to a month.",
      aAr: "يعتمد الوقت على حجم المعرض ومتطلباته، وعادة ما يستغرق من أسبوعين إلى شهر."
    },
    {
      id: "faq-5",
      qEn: "What verticals/niches are supported?",
      qAr: "هل ندعم الفعاليات الدولية؟",
      aEn: "Yes, we support organizing events and conferences on both international and local levels.",
      aAr: "نعم، نحن ندعم تنظيم الفعاليات والمؤتمرات على مستوى دولي ومحلي."
    },
    {
      id: "faq-6",
      qEn: "Is it compliant and secure?",
      qAr: "هل النظام آمن ومتوافق؟",
      aEn: "Yes, we use the latest security standards to protect your data and participant data.",
      aAr: "نعم، نستخدم أحدث معايير الأمان لحماية بياناتك وبيانات المشاركين."
    },
    {
      id: "faq-7",
      qEn: "How does it work with my business?",
      qAr: "كيف يعمل النظام مع نشاطي؟",
      aEn: "Our system is flexible and can be customized to fit the needs of any business sector or event type.",
      aAr: "نظامنا مرن ويمكن تخصيصه ليتناسب مع احتياجات أي قطاع أعمال أو نوع فعالية."
    },
    {
      id: "faq-8",
      qEn: "What if my competitor is using us?",
      qAr: "ماذا لو لم يعجبني التصميم؟",
      aEn: "We work with you step-by-step to ensure your complete satisfaction with all aspects of organization and design.",
      aAr: "نعمل معك خطوة بخطوة لضمان رضاك التام عن جميع جوانب التنظيم والتصميم."
    },
    {
      id: "faq-9",
      qEn: "What if I don't like the designs or strategies?",
      qAr: "هل يمكنني اختيار استراتيجية معينة؟",
      aEn: "Certainly, our consulting team will help you choose the best strategies for your event.",
      aAr: "بالتأكيد، فريقنا الاستشاري سيساعدك في اختيار أفضل الاستراتيجيات لفعاليتك."
    },
    {
      id: "faq-10",
      qEn: "I can do this myself, why do I need you?",
      qAr: "لماذا أحتاج إلى خدماتكم؟",
      aEn: "We save you time and effort and guarantee high professionalism and tangible results for your event.",
      aAr: "نحن نوفر عليك الوقت والجهد ونضمن لك احترافية عالية ونتائج ملموسة لفعاليتك."
    },
    {
      id: "faq-11",
      qEn: "How do we start working with you?",
      qAr: "كيف نبدأ العمل معكم؟",
      aEn: "You can start by filling out the booking request form, and our team will contact you within 24 hours to discuss all details and needs.",
      aAr: "يمكنك البدء بملء نموذج طلب الحجز، وسيقوم فريقنا بالتواصل معك خلال 24 ساعة لمناقشة كافة التفاصيل والاحتياجات."
    },
  ]

  const dynamicFaqs = siteContent?.faqs?.length > 1 ? siteContent.faqs : defaultFaqs
  const faqs = dynamicFaqs.map((f: any, i: number) => ({
    q: isRtl ? f.qAr || defaultFaqs[i]?.qAr : f.qEn || defaultFaqs[i]?.qEn,
    a: isRtl ? f.aAr || defaultFaqs[i]?.aAr : f.aEn || defaultFaqs[i]?.aEn,
  }))

  return (
    <section className="py-24 bg-[#f8f9fa]">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="px-4 py-1.5 mb-6 text-[11px] font-extrabold uppercase tracking-widest rounded-full bg-white border border-slate-200 shadow-sm text-slate-500"
          >
            {isRtl ? siteContent?.homepage?.faqEyebrowAr || "الأسئلة الشائعة" : siteContent?.homepage?.faqEyebrowEn || "FAQs"}
          </motion.div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 flex flex-wrap items-center justify-center gap-3">
            {(() => {
              const titleText = isRtl ? siteContent?.homepage?.faqTitleAr || "لديك استفسار؟ لدينا الإجابة" : siteContent?.homepage?.faqTitleEn || "Have questions? We have answers"
              const splitChar = titleText.includes('؟') ? '؟' : (titleText.includes('?') ? '?' : null)
              
              const lottieIcon = (
                <div key="lottie" className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shrink-0 -mx-2 md:-mx-4 -my-6">
                  <DotLottieReact
                    src="https://lottie.host/c1c09570-9e57-4c04-8652-a830f399a2b1/Q2cjWdwW73.lottie"
                    loop
                    autoplay
                    className="w-full h-full"
                  />
                </div>
              )
              
              if (splitChar) {
                const parts = titleText.split(splitChar)
                return (
                  <>
                    <span>{parts[0]}{splitChar}</span>
                    {lottieIcon}
                    <span>{parts[1]}</span>
                  </>
                )
              }
              
              return (
                <>
                  {lottieIcon}
                  <span>{titleText}</span>
                </>
              )
            })()}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            {isRtl ? siteContent?.homepage?.faqSubtitleAr || "كل ما تحتاج معرفته عن حجز وإدارة الفعاليات عبر منصتنا." : siteContent?.homepage?.faqSubtitleEn || "Everything you need to know about booking and managing events on our platform."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto items-start">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className={`bg-white rounded-3xl border border-slate-100 transition-all cursor-pointer overflow-hidden ${openIndex === index ? 'shadow-xl shadow-slate-200/50' : 'hover:shadow-lg hover:shadow-slate-200/30'}`}
            >
              <div className="p-6 flex items-center justify-between group">
                <h3 className={`text-base font-bold transition-colors ${openIndex === index ? 'text-brand-blue' : 'text-slate-800'}`}>{faq.q}</h3>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${openIndex === index ? 'bg-brand-blue text-white rotate-45' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-500 text-sm font-medium leading-relaxed border-t border-slate-50 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] md:rounded-3xl p-6 md:p-1.5 border border-slate-100 flex flex-col md:flex-row items-center justify-between self-stretch gap-6 md:gap-0 md:pr-6"
          >
            <h3 className="text-base font-bold text-slate-400 md:pl-4 text-center md:text-start">
              {isRtl ? "لم تجد ما تبحث عنه؟" : "Couldn't find an answer?"}
            </h3>
            <div className="w-full md:w-auto">
              <AnimatedCtaButton 
                style={{ '--main-size': '0.9em' } as React.CSSProperties}
                onClick={() => window.open(`https://wa.me/${siteContent?.homepage?.faqWhatsappNumber || "201012345678"}?text=${encodeURIComponent(isRtl ? "مرحباً، أود التواصل مع فريق الدعم بخصوص تنظيم فعالية." : "Hello, I would like to contact support regarding organizing an event.")}`, "_blank")}
              >
                {isRtl ? siteContent?.homepage?.faqWhatsappTextAr || "تواصل معنا عبر واتساب" : siteContent?.homepage?.faqWhatsappTextEn || "Chat with us on WhatsApp"}
              </AnimatedCtaButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
