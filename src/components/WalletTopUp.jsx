import React, { useState } from 'react'
import { ArrowLeft, CreditCard, Smartphone, Banknote, Wifi, CheckCircle } from 'lucide-react'

const WalletTopUp = ({ onClose, onSuccess, loading, addFunds }) => {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const quickAmounts = ['₦5,000', '₦10,000', '₦20,000', '₦50,000']

  const paymentMethods = [
    {
      id: 'card',
      name: 'Card Payment',
      icon: CreditCard,
      description: 'Visa, Mastercard, Verve'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Banknote,
      description: 'Direct bank transfer'
    },
    {
      id: 'ussd',
      name: 'USSD',
      icon: Smartphone,
      description: '*737#, *966#, etc.'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Wifi,
      description: 'MTN, Airtel, 9mobile'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || !paymentMethod) {
      return
    }

    setIsProcessing(true)
    
    try {
      const numericAmount = parseFloat(amount.replace(/[₦,]/g, ''))
      const result = await addFunds(numericAmount, paymentMethod)
      
      if (result.success) {
        onSuccess(result)
      }
    } catch (error) {
      console.error('Top-up error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 sm:p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={onClose}
                className="mr-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Top Up Wallet</h2>
                <p className="text-green-100 text-sm">Add funds to your wallet</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Amount</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {quickAmounts.map((quickAmount) => (
                <button 
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount)}
                  className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                    amount === quickAmount 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 text-gray-700 hover:border-green-300'
                  }`}
                >
                  {quickAmount}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="Enter custom amount (₦1,000 minimum)"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label 
                  key={method.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === method.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                    required
                  />
                  <method.icon className="w-6 h-6 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{method.name}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          {amount && paymentMethod && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Transaction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">
                    {paymentMethods.find(m => m.id === paymentMethod)?.name}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">{amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              type="submit"
              disabled={!amount || !paymentMethod || isProcessing || loading}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing || loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Add ${amount || '₦0'} to Wallet`
              )}
            </button>
            
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WalletTopUp
