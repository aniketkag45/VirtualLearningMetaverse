export interface CardProps {
  title: string
  description?: string
  variant?: 'default' | 'urgent' | 'success' | 'warning' | 'info'
  children?: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

// StatBadge: Small component to display a stat with label
// Used in dashboard header to show key metrics
export interface StatBadgeProps {
  value: string | number           // The stat to display (e.g., "500+" or 500)
  label: string                     // Description (e.g., "Courses", "Students")
  icon?: React.ReactNode            // Optional icon for visual appeal
  color?: 'blue' | 'green' | 'purple' | 'orange'  // Color theme
  className?: string                // Additional custom styling
}
