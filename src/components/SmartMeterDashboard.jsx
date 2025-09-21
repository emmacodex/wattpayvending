import React, { useState } from 'react'
import { 
  Zap, 
  Battery, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  Bell,
  Settings
} from 'lucide-react'

const SmartMeterDashboard = ({ meterNumber, discoCode, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAlerts, setShowAlerts] = useState(false)

  // Simulate meter data (in real app, this would come from the hook)
  const meterData = {
    meterNumber,
    currentBalance: 245.67,
    dailyAverage: 12.5,
    daysRemaining: 19,
    status: 'good',
    consumption: {
      today: 8.5,
      thisWeek: 87.3,
      thisMonth: 375.2,
    },
    trends: {
      daily: 'decreasing',
      weekly: 'stable',
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'good': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'low': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Battery className="w-4 h-4" />
      case 'good': return <Zap className="w-4 h-4" />
      default: return <Battery className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Smart Meter Dashboard</h2>
              <p className="text-blue-100">Meter: {meterNumber}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'consumption', label: 'Consumption', icon: TrendingUp },
              { id: 'alerts', label: 'Alerts', icon: Bell },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Balance</p>
                      <p className="text-3xl font-bold text-gray-900">{meterData.currentBalance}</p>
                      <p className="text-sm text-gray-500">units</p>
                    </div>
                    <div className={`p-3 rounded-full ${getStatusColor(meterData.status)}`}>
                      {getStatusIcon(meterData.status)}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Days Remaining</p>
                      <p className="text-3xl font-bold text-gray-900">{meterData.daysRemaining}</p>
                      <p className="text-sm text-gray-500">estimated</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Daily Average</p>
                      <p className="text-3xl font-bold text-gray-900">{meterData.dailyAverage}</p>
                      <p className="text-sm text-gray-500">units/day</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Consumption Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{meterData.consumption.today}</p>
                    <p className="text-sm text-gray-600">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{meterData.consumption.thisWeek}</p>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{meterData.consumption.thisMonth}</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="btn-primary text-sm py-2">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Buy Units
                  </button>
                  <button className="btn-secondary text-sm py-2">
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    View History
                  </button>
                  <button className="btn-secondary text-sm py-2">
                    <Bell className="w-4 h-4 inline mr-2" />
                    Set Alerts
                  </button>
                  <button className="btn-secondary text-sm py-2">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consumption' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Consumption chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Balance Alert</p>
                      <p className="text-sm text-gray-600">Notify when balance is below 50 units</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">High Consumption Alert</p>
                      <p className="text-sm text-gray-600">Notify when daily consumption exceeds 20 units</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meter Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refresh Interval
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg">
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Method
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">SMS</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Push Notification</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartMeterDashboard
