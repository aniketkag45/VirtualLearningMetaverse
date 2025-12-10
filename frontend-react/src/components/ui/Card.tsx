import { CardProps } from '../../types/components'

function Card({ title, description, variant='default', children, onClick, icon, className }: CardProps) {

    const getVariantClasses = () => {
  switch (variant) {
    case 'urgent':
      return 'border-red-500 bg-red-50'
    case 'success':
      return 'border-green-500 bg-green-50'
    case 'warning':
      return 'border-yellow-500 bg-yellow-50'
    case 'info':
      return 'border-blue-500 bg-blue-50'
    default:
      return 'border-gray-200 bg-white'
  }
}

  return (
    <div 
  className={`rounded-lg shadow-md p-6 border transition-all duration-200 hover:shadow-lg ${getVariantClasses()} ${className || ''}`}
  onClick={onClick}
>
  {/* Content will go here */}

  {/* Card Header - Shows icon and title */}
  <div className='flex items-center gap-3 mb-4'>
{icon && <div className='flex-shrink-0'>{icon}</div>}
    <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
  </div>

    {/* Card Content - Shows description or custom children */}
    <div className='text-gray-600 text-sm'>
        {description && <p>{description}</p>}
        {children}
    </div>

</div>
  )
}

export default Card
