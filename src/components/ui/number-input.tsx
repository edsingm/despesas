import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | string
  onValueChange: (value: number | undefined) => void
  min?: number
  max?: number
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onValueChange, min, max, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      
      if (val === "") {
        onValueChange(undefined)
        return
      }
      
      const num = parseInt(val, 10)
      if (!isNaN(num)) {
        if (min !== undefined && num < min) return
        if (max !== undefined && num > max) return
        onValueChange(num)
      }
    }

    return (
      <Input
        type="number"
        className={cn(className)}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        ref={ref}
        {...props}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
