import React, { useState } from 'react'
import { AlertTriangle, X, Send, FileText } from 'lucide-react'

const CustomerComplaintForm = ({ onClose, onSubmit, userTransactions = [] }) => {
  const [formData, setFormData] = useState({
    complaint_type: '',
    subject: '',
    description: '',
    transaction_id: ''
  })
  const [loading, setLoading] = useState(false)

  const complaintTypes = [
    { value: 'payment_issue', label: 'Payment Issue', description: 'Problems with payment processing' },
    { value: 'token_not_working', label: 'Token Not Working', description: 'Generated token is not working' },
    { value: 'wrong_amount', label: 'Wrong Amount', description: 'Incorrect amount charged or credited' },
    { value: 'service_issue', label: 'Service Issue', description: 'General service problems' },
    { value: 'other', label: 'Other', description: 'Other issues not listed above' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.complaint_type || !formData.subject || !formData.description) {
      return
    }

    setLoading(true)
    
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting complaint:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 sm:p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Submit Complaint</h2>
                <p className="text-orange-100 text-sm">We'll help resolve your issue quickly</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of issue are you experiencing? *
            </label>
            <div className="space-y-3">
              {complaintTypes.map((type) => (
                <label 
                  key={type.value}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.complaint_type === type.value 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="complaint_type" 
                    value={type.value}
                    onChange={(e) => handleInputChange('complaint_type', e.target.value)}
                    className="mt-1 mr-3"
                    required
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{type.label}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Related Transaction (Optional) */}
          {userTransactions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Transaction (Optional)
              </label>
              <select 
                value={formData.transaction_id}
                onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                className="input-field"
              >
                <option value="">Select a transaction (optional)</option>
                {userTransactions.map((transaction) => (
                  <option key={transaction.id} value={transaction.id}>
                    {transaction.disco_name} - ₦{transaction.amount} - {new Date(transaction.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input 
              type="text" 
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="input-field"
              placeholder="Brief description of your issue"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.subject.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea 
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-field"
              rows="5"
              placeholder="Please provide as much detail as possible about your issue. Include any relevant information that might help us resolve it quickly."
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tips for faster resolution:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include your meter number if relevant</li>
              <li>• Mention the exact amount if it's a payment issue</li>
              <li>• Provide the token number if it's not working</li>
              <li>• Include screenshots if you have any</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              type="submit"
              disabled={!formData.complaint_type || !formData.subject || !formData.description || loading}
              className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Complaint
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerComplaintForm
