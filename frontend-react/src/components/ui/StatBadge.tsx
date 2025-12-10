import { StatBadgeProps } from '../../types/components'

function StatBadge({ value, label, icon, color='blue', className }: StatBadgeProps) {
  
  // Color mapping function - Tailwind needs complete class names
  const getColorClasses = () => {
    switch(color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'orange':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }
  
  return (
    <div className={`p-6 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-lg ${getColorClasses()} ${className || ''}`}>
      {/* Icon at top if provided */}
      {icon && (
        <div className="flex justify-center mb-3">
          {icon}
        </div>
      )}
      
      {/* Value - big and bold */}
      <div className="text-3xl font-bold mb-1">
        {value}
      </div>
      
      {/* Label - smaller descriptive text */}
      <div className="text-sm font-medium opacity-80">
        {label}
      </div>
    </div>
  )
}

export default StatBadge
