import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import {
  ButtonActionIcon,
  type ButtonAction,
} from "@/components/ui/button-action-icon"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "border-destructive bg-destructive text-white hover:bg-white hover:text-destructive focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-md px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-md in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  action,
  alwaysShowActionIcon = false,
  asChild = false,
  render,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    action?: ButtonAction
    alwaysShowActionIcon?: boolean
  }) {
  const [hovered, setHovered] = React.useState(false)
  const child = asChild ? React.Children.only(children) : null
  const resolvedRender =
    render ?? (React.isValidElement(child) ? child : undefined)
  const resolvedChildren = React.isValidElement<{ children?: React.ReactNode }>(
    child,
  )
    ? child.props.children
    : children

  const usesCustomRender = Boolean(resolvedRender)
  const nativeButton =
    !usesCustomRender ||
    (React.isValidElement(resolvedRender) &&
      typeof resolvedRender.type === 'string' &&
      resolvedRender.type === 'button')

  const resolvedAction =
    action ?? (variant === "destructive" ? "delete" : undefined)
  const isIconSize = typeof size === "string" && size.startsWith("icon")
  const isJoinAction = resolvedAction === "join"
  const showActionIcon =
    Boolean(resolvedAction) && (!usesCustomRender || isJoinAction)
  const actionIconAtEnd = isJoinAction

  const actionIcon = showActionIcon && resolvedAction ? (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-visible transition-all duration-300 ease-out",
        isJoinAction || alwaysShowActionIcon
          ? "size-4 opacity-100"
          : isIconSize
            ? "w-4 opacity-100"
            : hovered
              ? "w-4 opacity-100"
              : "w-0 opacity-0",
      )}
      aria-hidden
    >
      <ButtonActionIcon
        action={resolvedAction}
        animate={hovered}
        size={isIconSize ? 14 : 16}
      />
    </span>
  ) : null

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton}
      className={cn(
        buttonVariants({ variant, size, className }),
        showActionIcon && "[&>svg]:hidden",
      )}
      render={resolvedRender}
      onMouseEnter={(event) => {
        setHovered(true)
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setHovered(false)
        onMouseLeave?.(event)
      }}
      {...props}
    >
      {!actionIconAtEnd ? actionIcon : null}
      {isIconSize && showActionIcon ? null : resolvedChildren}
      {actionIconAtEnd ? actionIcon : null}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export type { ButtonAction }
