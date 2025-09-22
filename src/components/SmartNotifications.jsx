import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  Battery, 
  TrendingUp, 
  X,
  CheckCircle,
  Info
} from 'lucide-react'

const SmartNotifications = ({ meterData, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (meterData) {
      generateNotifications(meterData)
    }
  }, [meterData])

  const generateNotifications = (data) => {
    const newNotifications = []

    // Low balance alert
    if (data.currentBalance < 50) {
      newNotifications.push({
        id: 'low_balance',
        type: 'warning',
        title: 'Low Balance Alert',
        message: `Your meter balance is running low (${data.currentBalance} units remaining)`,
        action: 'Purchase more units',
        icon: Battery,
        color: 'text-red-600 bg-red-100'
      })
    }

    // High consumption alert
    if (data.consumption.today > 15) {
      newNotifications.push({
        id: 'high_consumption',
        type: 'info',
        title: 'High Consumption Detected',
        message: `Today's usage: ${data.consumption.today} units (above normal)`,
        action: 'Check for power leaks',
        icon: TrendingUp,
        color: 'text-yellow-600 bg-yellow-100'
      })
    }

    // Unusual pattern alert
    if (data.consumption.today > data.dailyAverage * 1.5) {
      newNotifications.push({
        id: 'unusual_pattern',
        type: 'info',
        title: 'Unusual Consumption Pattern',
        message: `Your usage pattern has changed significantly`,
        action: 'Review consumption habits',
        icon: AlertTriangle,
        color: 'text-blue-600 bg-blue-100'
      })
    }

    // Good status notification
    if (data.status === 'good' && data.currentBalance > 100) {
      newNotifications.push({
        id: 'good_status',
        type: 'success',
        title: 'Meter Status: Good',
        message: `Your meter is operating normally with ${data.currentBalance} units remaining`,
        action: 'Continue monitoring',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-100'
      })
    }

    setNotifications(newNotifications)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'info': return <Info className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 animate-slide-in"
        >
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${notification.color} mr-3`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                {notification.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-blue-600 font-medium">
                  {notification.action}
                </span>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SmartNotifications
