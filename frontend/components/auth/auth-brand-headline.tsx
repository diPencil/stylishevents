type AuthBrandHeadlineProps = {
  isRtl: boolean
  color: string
  size?: "hero" | "compact"
}

export function AuthBrandHeadline({ isRtl, color, size = "hero" }: AuthBrandHeadlineProps) {
  const sizeClass =
    size === "compact"
      ? "mt-1 max-w-[380px] text-[42px] sm:text-[56px] lg:text-[64px]"
      : "mt-3 max-w-[620px] text-[74px] sm:text-[104px] lg:text-[132px]"

  return (
    <h1
      className={`${sizeClass} font-bold leading-[0.82] tracking-normal`}
      style={{
        color,
        fontFamily: isRtl ? '"Qahiri", "Cairo", Tahoma, sans-serif' : '"Caveat", "Segoe Script", cursive',
        letterSpacing: "0",
      }}
    >
      {isRtl ? "ستايلش ايفينتس" : "Stylish Events"}
    </h1>
  )
}
