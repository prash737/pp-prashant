"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} ref={ref} {...props}>
      {children}
    </div>
  ),
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} ref={ref} {...props}>
      {children}
    </div>
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<React.ElementRef<"p">, React.ComponentPropsWithoutRef<"p">>(
  ({ className, children, ...props }, ref) => (
    <p className={cn("text-lg font-semibold leading-none tracking-tight", className)} ref={ref} {...props}>
      {children}
    </p>
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<React.ElementRef<"p">, React.ComponentPropsWithoutRef<"p">>(
  ({ className, children, ...props }, ref) => (
    <p className={cn("text-sm text-muted-foreground", className)} ref={ref} {...props}>
      {children}
    </p>
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("p-6 pt-0", className)} ref={ref} {...props}>
      {children}
    </div>
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("flex items-center p-6 pt-0", className)} ref={ref} {...props}>
      {children}
    </div>
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
