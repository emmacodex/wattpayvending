import React, { useState } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3,
  Calendar,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Download
} from 'lucide-react'

const AIAnalyticsDashboard = ({ 
  predictions = [], 
  anomalies = [], 
  recommendations = [], 
  modelMetrics = null,
  loading = false,
  onRefresh,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('predictions')


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'efficiency': return <Zap className="w-5 h-5" />
      case 'timing': return <Calendar className="w-5 h-5" />
      case 'seasonal': return <Target className="w-5 h-5" />
      default: return <Lightbulb className="w-5 h-5" />
    }
  }

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'high_consumption': return <TrendingUp className="w-5 h-5" />
      case 'low_consumption': return <TrendingDown className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto ai-dashboard">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 rounded-t-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">AI Analytics Dashboard</span>
                <span className="sm:hidden">AI Analytics</span>
              </h2>
              <p className="text-purple-100 text-sm sm:text-base">Powered by Machine Learning</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={onRefresh}
                disabled={loading}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all touch-target"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="text-white hover:text-purple-200 touch-target"
                title="Close"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Model Status */}
        {modelMetrics && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Model Status: {modelMetrics.isTrained ? 'Trained' : 'Not Trained'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Accuracy: {Math.round(modelMetrics.accuracy * 100)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Data Points: {modelMetrics.dataPoints}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Last Updated: {new Date(modelMetrics.lastTrained).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto space-x-2 sm:space-x-8 px-3 sm:px-6">
            {[
              { id: 'predictions', label: 'Predictions', shortLabel: 'Predict', icon: TrendingUp, count: predictions.length },
              { id: 'anomalies', label: 'Anomalies', shortLabel: 'Anomalies', icon: AlertTriangle, count: anomalies.length },
              { id: 'recommendations', label: 'Recommendations', shortLabel: 'Tips', icon: Lightbulb, count: recommendations.length },
              { id: 'insights', label: 'Insights', shortLabel: 'Insights', icon: BarChart3, count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.count > 0 && (
                  <span className="ml-1 sm:ml-2 bg-purple-100 text-purple-600 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          {activeTab === 'predictions' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">7-Day Consumption Predictions</h3>
                <button className="btn-secondary text-xs sm:text-sm w-full sm:w-auto">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Export Data
                </button>
              </div>

              {predictions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">
                            {new Date(prediction.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {prediction.isWeekend ? 'Weekend' : 'Weekday'}
                          </p>
                        </div>
                        <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          prediction.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                          prediction.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(prediction.confidence * 100)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                          {prediction.predictedConsumption}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">units predicted</p>
                      </div>

                      <div className="mt-2 sm:mt-3 space-y-1">
                        {prediction.factors.weekend && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            Weekend pattern
                          </div>
                        )}
                        {prediction.factors.seasonal && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Target className="w-3 h-3 mr-1" />
                            Seasonal factor
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No predictions available</p>
                  <p className="text-sm text-gray-500">Generate predictions to see future consumption forecasts</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Consumption Anomalies</h3>

              {anomalies.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-start flex-1">
                          <div className={`p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 ${getSeverityColor(anomaly.severity)}`}>
                            {getAnomalyIcon(anomaly.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {anomaly.type === 'high_consumption' ? 'High Consumption' : 'Low Consumption'}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Date: {new Date(anomaly.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Actual: {anomaly.consumption} units | Expected: {anomaly.expectedConsumption} units
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Deviation: {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation} units
                            </p>
                          </div>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getSeverityColor(anomaly.severity)} self-start sm:self-auto`}>
                          {anomaly.severity.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">No anomalies detected</p>
                  <p className="text-sm text-gray-500">Your consumption patterns are normal</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>

              {recommendations.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start">
                        <div className={`p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 ${getPriorityColor(recommendation.priority)}`}>
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 space-y-2 sm:space-y-0">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{recommendation.title}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)} self-start sm:self-auto`}>
                              {recommendation.priority.toUpperCase()}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3 text-sm sm:text-base">{recommendation.message}</p>
                          {recommendation.estimatedSavings && (
                            <p className="text-xs sm:text-sm text-green-600 font-medium mb-3">
                              💰 {recommendation.estimatedSavings}
                            </p>
                          )}
                          <button className="btn-primary text-xs sm:text-sm w-full sm:w-auto">
                            {recommendation.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recommendations available</p>
                  <p className="text-sm text-gray-500">Connect a meter to get personalized recommendations</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">AI Insights & Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Consumption Trends</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Average Daily Usage:</span>
                      <span className="font-semibold">8.5 units</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Peak Usage Day:</span>
                      <span className="font-semibold">Saturday</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Lowest Usage Day:</span>
                      <span className="font-semibold">Tuesday</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Monthly Trend:</span>
                      <span className="font-semibold text-green-600">↓ Decreasing</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Efficiency Score</h4>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">87%</div>
                    <p className="text-xs sm:text-sm text-gray-600">Energy Efficiency Rating</p>
                    <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Usage Optimization:</span>
                        <span className="text-green-600">Good</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Peak Hour Usage:</span>
                        <span className="text-yellow-600">Moderate</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Seasonal Adaptation:</span>
                        <span className="text-green-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Predictive Analytics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">19 days</div>
                    <p className="text-xs sm:text-sm text-gray-600">Estimated days remaining</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">₦2,850</div>
                    <p className="text-xs sm:text-sm text-gray-600">Estimated monthly cost</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">15%</div>
                    <p className="text-xs sm:text-sm text-gray-600">Potential savings</p>
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

export default AIAnalyticsDashboard
