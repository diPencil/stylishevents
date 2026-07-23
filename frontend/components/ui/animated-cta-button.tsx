import * as React from "react"
import { cn } from "@/lib/utils"

export interface AnimatedCtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const AnimatedCtaButton = React.forwardRef<HTMLButtonElement, AnimatedCtaButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("uiverse-next-button group whitespace-nowrap", className)}
        {...props}
      >
        <span>{children}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 43">
          <polygon points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5" />
          <polygon points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5" />
          <polygon points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5" />
        </svg>
      </button>
    )
  }
)
AnimatedCtaButton.displayName = "AnimatedCtaButton"
