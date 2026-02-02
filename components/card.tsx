// components/common/Card.tsx
import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export default function Card({ title, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-surface rounded-lg border p-6 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
