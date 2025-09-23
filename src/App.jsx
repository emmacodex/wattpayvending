import React, { useState, useEffect } from 'react';
import { Phone, Mail, Eye, EyeOff, ArrowLeft, Zap, CreditCard, Clock, Receipt, MessageCircle, User, Home, History, Settings, Search, Download, Star } from 'lucide-react';
import { useAuth } from './contexts/AuthContext.jsx';
import { useTransactions } from './hooks/useTransactions.js';
import { useSmartMeter } from './hooks/useSmartMeter.js';
import { useAIPredictions } from './hooks/useAIPredictions.js';
import { useWallet } from './hooks/useWallet.js';
import { useAdmin, useAdminTransactions, useAdminComplaints } from './hooks/useAdmin.js';
import { useCustomerComplaints } from './hooks/useCustomerComplaints.js';
import { supabase, discos } from './lib/supabase.js';
import SmartMeterDashboard from './components/SmartMeterDashboard.jsx';
import SmartNotifications from './components/SmartNotifications.jsx';
import AIAnalyticsDashboard from './components/AIAnalyticsDashboard.jsx';
import WalletTopUp from './components/WalletTopUp.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import CustomerComplaintForm from './components/CustomerComplaintForm.jsx';

const PowerVendingApp = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDisco, setSelectedDisco] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discoList, setDiscoList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [showSmartMeter, setShowSmartMeter] = useState(false);
  const [showAIAnalytics, setShowAIAnalytics] = useState(false);
  const [showWalletTopUp, setShowWalletTopUp] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState('');
  
  // Demo meter data for testing
  const demoMeterData = {
    currentBalance: 245.67,
    dailyAverage: 12.5,
    daysRemaining: 19,
    status: 'good',
    consumption: {
      today: 8.5,
      thisWeek: 87.3,
      thisMonth: 375.2,
    }
  };

  const { user, profile, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { transactions, loading: transactionsLoading, createTransaction, searchTransactions } = useTransactions(user?.id);
  const { meterData, loading: meterLoading, fetchMeterData } = useSmartMeter(selectedMeter, selectedDisco);
  const { 
    predictions, 
    anomalies, 
    recommendations, 
    modelMetrics, 
    loading: aiLoading, 
    generateAllInsights 
  } = useAIPredictions(user?.id, meterData || demoMeterData);
  const { balance, loading: walletLoading, addFunds } = useWallet(user?.id);
  const { isAdmin, adminRole } = useAdmin(user?.id);
  const { 
    transactions: adminTransactions, 
    stats: transactionStats, 
    loading: adminTransactionsLoading, 
    fetchAllTransactions, 
    updateTransactionStatus 
  } = useAdminTransactions(user?.id);
  const { 
    complaints: adminComplaints, 
    stats: complaintStats, 
    loading: adminComplaintsLoading, 
    fetchAllComplaints, 
    updateComplaintStatus, 
    assignComplaint 
  } = useAdminComplaints(user?.id);
  const { submitComplaint } = useCustomerComplaints(user?.id);

  // Fetch DISCOs from database
  useEffect(() => {
    const fetchDiscos = async () => {
      try {
        const { data, error } = await discos.getAll();
        if (error) {
          console.error('Error fetching DISCOs:', error);
        } else if (data) {
          setDiscoList(data);
          console.log('DISCOs loaded:', data.length);
        }
      } catch (err) {
        console.error('Failed to fetch DISCOs:', err);
      }
    };
    fetchDiscos();
  }, []);

  const quickAmounts = ['₦1,000', '₦2,500', '₦5,000', '₦10,000'];

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen(user ? 'dashboard' : 'auth');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const result = await signIn(email, password);
    if (result.success) {
      setCurrentScreen('dashboard');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const password = formData.get('password');
    
    const result = await signUp(email, password, {
      full_name: fullName,
      phone: phone
    });
    
    if (result.success) {
      setCurrentScreen('dashboard');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    
    const selectedDiscoData = discoList.find(d => d.name === selectedDisco);
    if (!selectedDiscoData) return;
    
    const transactionData = {
      disco_id: selectedDiscoData.id,
      disco_name: selectedDiscoData.name,
      meter_number: meterNumber,
      amount: parseFloat(amount),
      payment_method: paymentMethod
    };
    
    const result = await createTransaction(transactionData);
    if (result.success) {
      setCurrentScreen('success');
    }
  };

  // Bottom Navigation Component
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 sm:px-4 py-2 shadow-lg z-50">
      <div className="flex justify-around">
        <button 
          className={`flex flex-col items-center p-2 sm:p-3 min-h-[60px] sm:min-h-[56px] ${currentScreen === 'dashboard' ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
          onClick={() => setCurrentScreen('dashboard')}
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 sm:p-3 min-h-[60px] sm:min-h-[56px] ${currentScreen === 'history' ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
          onClick={() => setCurrentScreen('history')}
        >
          <History className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 font-medium">History</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 sm:p-3 min-h-[60px] sm:min-h-[56px] ${currentScreen === 'support' ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
          onClick={() => setCurrentScreen('support')}
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 font-medium">Support</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 sm:p-3 min-h-[60px] sm:min-h-[56px] ${currentScreen === 'profile' ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
          onClick={() => setCurrentScreen('profile')}
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 font-medium">Profile</span>
        </button>
        {isAdmin && (
          <button 
            className={`flex flex-col items-center p-2 sm:p-3 min-h-[60px] sm:min-h-[56px] ${currentScreen === 'admin' ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
            onClick={() => setCurrentScreen('admin')}
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs mt-1 font-medium">Admin</span>
          </button>
        )}
      </div>
    </div>
  );

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="bg-white rounded-full p-6 mb-6 mx-auto w-24 h-24 flex items-center justify-center shadow-2xl">
            <Zap className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PowerVend</h1>
          <p className="text-blue-100 text-lg">Instant Electricity Tokens</p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
          <p className="text-blue-200 text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication Screen
  if (currentScreen === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">PowerVend</h1>
        </div>
        
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="card">
              <div className="flex mb-6">
                <button 
                  className={`flex-1 py-2 text-center font-semibold ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button 
                  className={`flex-1 py-2 text-center font-semibold ${authMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setAuthMode('register')}
                >
                  Sign Up
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input type="email" name="email" className="input-field pl-10" placeholder="Enter your email" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        className="input-field pr-10" 
                        placeholder="Enter password" 
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-3 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={authLoading}>
                    {authLoading ? 'Signing in...' : 'Login'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="fullName" className="input-field" placeholder="Enter full name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input type="tel" name="phone" className="input-field pl-10" placeholder="+234 801 234 5678" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input type="email" name="email" className="input-field pl-10" placeholder="Enter email" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        className="input-field pr-10" 
                        placeholder="Create password" 
                        required
                        minLength="6"
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-3 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={authLoading}>
                    {authLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Welcome back!</h1>
              <p className="text-blue-100">{profile?.full_name || user?.email}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Buy Electricity Token</h2>
            <button 
              className="btn-primary w-full text-lg py-4"
              onClick={() => setCurrentScreen('purchase')}
            >
              <Zap className="w-6 h-6 inline mr-2" />
              Purchase Now
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-all min-h-[120px] flex flex-col items-center justify-center"
              onClick={() => {
                if (transactions.length > 0) {
                  // Repeat last transaction
                  const lastTransaction = transactions[0];
                  setSelectedDisco(lastTransaction.disco_name);
                  setMeterNumber(lastTransaction.meter_number);
                  setAmount(lastTransaction.amount.toString());
                  setCurrentScreen('purchase');
                } else {
                  alert('No previous transactions to repeat');
                }
              }}
            >
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Quick Buy</h3>
              <p className="text-sm text-gray-600">Repeat last purchase</p>
            </button>
            <button 
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-all min-h-[120px] flex flex-col items-center justify-center"
              onClick={() => setCurrentScreen('history')}
            >
              <Receipt className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Recent</h3>
              <p className="text-sm text-gray-600">View transactions</p>
            </button>
          </div>

          {/* AI Analytics Card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-2">🤖 AI Analytics</h2>
                <p className="text-purple-100 text-sm mb-4">Get intelligent insights and predictions</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span>Model Trained</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span>{predictions.length} Predictions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span>{recommendations.length} Tips</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAIAnalytics(true);
                  // Generate insights when opening the dashboard
                  if (predictions.length === 0) {
                    generateAllInsights();
                  }
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base min-h-[44px] flex items-center justify-center"
              >
                <span className="hidden sm:inline">View Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Wallet Balance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {walletLoading ? (
                    <div className="animate-pulse">₦---</div>
                  ) : (
                    `₦${balance.toLocaleString()}`
                  )}
                </p>
                <p className="text-sm text-gray-600">Available balance</p>
              </div>
              <button 
                className="btn-primary"
                onClick={() => {
                  console.log('TOP UP BUTTON CLICKED!');
                  console.log('Current showWalletTopUp state:', showWalletTopUp);
                  console.log('Setting showWalletTopUp to true');
                  setShowWalletTopUp(true);
                  console.log('showWalletTopUp should now be true');
                  
                  // Force a re-render test
                  setTimeout(() => {
                    console.log('After 100ms, showWalletTopUp state:', showWalletTopUp);
                  }, 100);
                }}
                disabled={walletLoading}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Top Up</span>
                <span className="sm:hidden">Top Up</span>
              </button>
            </div>
          </div>

          {/* Smart Meter Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Smart Meter</h2>
              <button 
                onClick={() => {
                  if (meterData) {
                    setShowSmartMeter(true);
                  } else {
                    // Show demo data for testing
                    setShowSmartMeter(true);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium min-h-[44px] px-2 py-1 rounded-md hover:bg-blue-50 transition-all"
              >
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">Details</span>
              </button>
            </div>
            
            {meterData || selectedMeter ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{(meterData || demoMeterData).currentBalance} units</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (meterData || demoMeterData).status === 'low' ? 'bg-red-100 text-red-800' :
                    (meterData || demoMeterData).status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(meterData || demoMeterData).status.toUpperCase()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{(meterData || demoMeterData).daysRemaining}</p>
                    <p className="text-xs text-gray-600">Days Remaining</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{(meterData || demoMeterData).dailyAverage}</p>
                    <p className="text-xs text-gray-600">Daily Average</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Today's Consumption</p>
                  <p className="text-lg font-semibold text-gray-900">{(meterData || demoMeterData).consumption.today} units</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No meter connected</p>
                <button 
                  onClick={() => {
                    // Set demo meter data for testing
                    setSelectedMeter('12345678901');
                    setSelectedDisco('Eko Electricity Distribution Company');
                    setShowSmartMeter(true);
                  }}
                  className="btn-primary text-sm w-full sm:w-auto"
                >
                  Connect Meter
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-800">{transaction.disco_name}</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₦{transaction.amount.toLocaleString()}</p>
                    <p className="text-xs text-green-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
        
        {/* Smart Notifications */}
        <SmartNotifications meterData={meterData || demoMeterData} />
      </div>
    );
  }

  // Purchase Screen
  if (currentScreen === 'purchase') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center">
            <button onClick={() => setCurrentScreen('dashboard')} className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Buy Electricity</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handlePurchase} className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Select Distribution Company</h2>
              <select 
                value={selectedDisco} 
                onChange={(e) => setSelectedDisco(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose your DISCO</option>
                {discoList.map((disco) => (
                  <option key={disco.id} value={disco.name}>{disco.name}</option>
                ))}
              </select>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Meter Number</h2>
              <input 
                type="text" 
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                className="input-field"
                placeholder="Enter meter number"
                required
              />
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Amount</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {quickAmounts.map((quickAmount) => (
                  <button 
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.replace('₦', ''))}
                    className="p-3 border-2 border-gray-200 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder="Enter custom amount"
                min="500"
                required
              />
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {['Card Payment', 'Bank Transfer', 'USSD', 'Wallet'].map((method) => (
                  <label key={method} className={`flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    method === 'Wallet' && balance < parseFloat(amount) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      disabled={method === 'Wallet' && balance < parseFloat(amount)}
                      required
                    />
                    <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <span className="font-medium">{method}</span>
                      {method === 'Wallet' && (
                        <p className="text-sm text-gray-600">
                          Balance: ₦{balance.toLocaleString()}
                          {balance < parseFloat(amount) && (
                            <span className="text-red-600 ml-2">(Insufficient funds)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full text-lg py-4"
              disabled={!selectedDisco || !meterNumber || !amount || !paymentMethod}
            >
              Continue to Payment
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Success Screen
  if (currentScreen === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
        <div className="card text-center max-w-md w-full">
          <div className="bg-green-100 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-6">
            <Zap className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Purchase Successful!</h1>
          <p className="text-gray-600 mb-6">Your electricity token has been generated</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Token</p>
            <p className="text-xl font-mono font-bold text-blue-600">{transactions[0]?.token}</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>DISCO:</span>
              <span>{transactions[0]?.disco_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>₦{transactions[0]?.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Meter:</span>
              <span>{transactions[0]?.meter_number}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="btn-primary w-full"
            >
              Back to Home
            </button>
            <button className="btn-secondary w-full">
              <Download className="w-4 h-4 inline mr-2" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Transaction History Screen
  if (currentScreen === 'history') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-xl font-bold">Transaction History</h1>
        </div>

        <div className="p-6">
          <div className="card mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchTransactions(e.target.value);
                }}
                className="input-field pl-10"
                placeholder="Search transactions..."
              />
            </div>
          </div>

          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{transaction.disco_name}</h3>
                    <p className="text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₦{transaction.amount.toLocaleString()}</p>
                    <p className="text-xs text-green-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Token</p>
                  <p className="font-mono text-sm font-semibold">{transaction.token}</p>
                </div>
                <button className="btn-secondary w-full text-sm py-2">
                  <Download className="w-4 h-4 inline mr-1" />
                  Download Receipt
                </button>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Support Screen
  if (currentScreen === 'support') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-xl font-bold">Customer Support</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Get Help</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setShowComplaintForm(true)}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <MessageCircle className="w-6 h-6 text-blue-600 mr-4" />
                <div className="text-left">
                  <p className="font-semibold">Submit Complaint</p>
                  <p className="text-sm text-gray-600">Report an issue or problem</p>
                </div>
              </button>
              <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Phone className="w-6 h-6 text-green-600 mr-4" />
                <div className="text-left">
                  <p className="font-semibold">WhatsApp Support</p>
                  <p className="text-sm text-gray-600">Message us on WhatsApp</p>
                </div>
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                'How do I purchase electricity tokens?',
                'What if my token is not working?',
                'How to check my transaction history?',
                'Which payment methods are supported?',
                'How to contact customer support?'
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-800">{faq}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Rate Our Service</h2>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
            </div>
            <textarea 
              className="input-field"
              rows="3"
              placeholder="Tell us about your experience..."
            ></textarea>
            <button className="btn-primary w-full mt-3">
              Submit Feedback
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="card text-center">
            <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{profile?.full_name || 'User'}</h2>
            <p className="text-gray-600">{profile?.phone || user?.email}</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Settings</h3>
            <div className="space-y-4">
              {[
                { icon: User, label: 'Edit Profile', color: 'text-blue-600' },
                { icon: Settings, label: 'App Preferences', color: 'text-gray-600' },
                { icon: CreditCard, label: 'Payment Methods', color: 'text-green-600' },
                { icon: Receipt, label: 'Billing History', color: 'text-purple-600' }
              ].map((item, index) => (
                <button key={index} className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <item.icon className={`w-6 h-6 ${item.color} mr-4`} />
                  <span className="font-medium text-gray-800">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                <p className="text-sm text-gray-600">Total Purchases</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₦{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Referral Program</h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium">Your Referral Code</p>
              <p className="text-xl font-bold text-blue-600">POWER2025</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">Share your code and earn ₦100 for every friend who signs up!</p>
            <button className="btn-primary w-full">
              Share Referral Code
            </button>
          </div>

          <button 
            onClick={async () => {
              console.log('Logout button clicked');
              try {
                const result = await signOut();
                console.log('SignOut result:', result);
                if (result.success) {
                  setCurrentScreen('auth');
                  console.log('Redirected to auth screen');
                } else {
                  console.error('Logout failed:', result.error);
                }
              } catch (error) {
                console.error('Logout error:', error);
              }
            }}
            className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold border border-red-200 hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Admin Screen
  if (currentScreen === 'admin' && isAdmin) {
    return (
      <AdminDashboard
        transactions={adminTransactions}
        complaints={adminComplaints}
        transactionStats={transactionStats}
        complaintStats={complaintStats}
        loading={adminTransactionsLoading || adminComplaintsLoading}
        onRefreshTransactions={fetchAllTransactions}
        onRefreshComplaints={fetchAllComplaints}
        onUpdateTransactionStatus={updateTransactionStatus}
        onUpdateComplaintStatus={updateComplaintStatus}
        onAssignComplaint={assignComplaint}
      />
    );
  }

  return (
    <>
      {showSmartMeter && (
        <SmartMeterDashboard
          meterNumber={selectedMeter || meterNumber}
          discoCode={selectedDisco}
          onClose={() => setShowSmartMeter(false)}
        />
      )}
      
      {showAIAnalytics && (
        <AIAnalyticsDashboard
          predictions={predictions}
          anomalies={anomalies}
          recommendations={recommendations}
          modelMetrics={modelMetrics}
          loading={aiLoading}
          onRefresh={generateAllInsights}
          onClose={() => {
            setShowAIAnalytics(false);
          }}
        />
      )}
      
      {/* Debug info - always visible */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 99999,
        fontSize: '16px',
        fontWeight: 'bold',
        border: '3px solid yellow'
      }}>
        CHANGES APPLIED <br/>
        showWalletTopUp: {showWalletTopUp ? 'TRUE' : 'FALSE'}
      </div>

      {/* Admin Setup Button */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'blue',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        zIndex: 99999,
        fontSize: '14px'
      }}>
        <button 
          onClick={async () => {
            console.log('Creating admin user...');
            const result = await adminSetup.createDemoAdmin('admin@powervend.com', 'admin123', 'admin');
            if (result.success) {
              alert('✅ Admin user created! Email: admin@powervend.com, Password: admin123');
            } else {
              alert('❌ Error: ' + result.error);
            }
          }}
          style={{
            backgroundColor: 'white',
            color: 'blue',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'block',
            width: '100%'
          }}
        >
          Create Admin User
        </button>
        
        <button 
          onClick={async () => {
            console.log('Test logout clicked');
            try {
              console.log('Calling signOut...');
              const result = await signOut();
              console.log('Test logout result:', result);
              if (result && result.success) {
                console.log('Logout successful, redirecting...');
                setCurrentScreen('auth');
                alert('✅ Logout successful!');
              } else {
                console.log('Logout failed:', result);
                alert('❌ Logout failed: ' + (result?.error || 'Unknown error'));
              }
            } catch (error) {
              console.error('Test logout error:', error);
              alert('❌ Logout error: ' + error.message);
            }
          }}
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%',
            marginBottom: '10px'
          }}
        >
          Test Logout
        </button>
        
        <button 
          onClick={async () => {
            console.log('Direct Supabase logout clicked');
            try {
              console.log('Calling supabase.auth.signOut() directly...');
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Direct logout error:', error);
                alert('❌ Direct logout failed: ' + error.message);
              } else {
                console.log('Direct logout successful, redirecting...');
                setCurrentScreen('auth');
                alert('✅ Direct logout successful!');
              }
            } catch (error) {
              console.error('Direct logout error:', error);
              alert('❌ Direct logout error: ' + error.message);
            }
          }}
          style={{
            backgroundColor: 'orange',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          Direct Logout
        </button>
      </div>

      {/* Force show modal for testing */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 255, 0, 0.8)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          border: '5px solid red'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🧪 TEST MODAL - ALWAYS VISIBLE</h2>
          <p>This modal should always be visible to test if modals work at all.</p>
          <button 
            onClick={() => setShowWalletTopUp(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Close Test Modal
          </button>
        </div>
      </div>

      {showWalletTopUp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.9)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '3px solid blue'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '24px' }}>💰 Top Up Wallet</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>Amount (₦):</label>
              <input 
                type="number" 
                placeholder="Enter amount (e.g., 5000)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '18px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>Payment Method:</label>
              <select style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ccc',
                borderRadius: '8px',
                fontSize: '18px',
                boxSizing: 'border-box'
              }}>
                <option value="">Select payment method</option>
                <option value="card">💳 Card Payment</option>
                <option value="bank">🏦 Bank Transfer</option>
                <option value="ussd">📱 USSD (*737#, *966#)</option>
                <option value="mobile">📲 Mobile Money</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => {
                  console.log('Cancel clicked');
                  setShowWalletTopUp(false);
                }}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                ❌ Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('Proceed to Pay clicked');
                  alert('🎉 Payment simulation - Wallet topped up successfully!');
                  setShowWalletTopUp(false);
                }}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                ✅ Proceed to Pay
              </button>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                <strong>Note:</strong> This is a demo. In a real app, you would be redirected to a secure payment gateway.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showComplaintForm && (
        <CustomerComplaintForm
          onClose={() => setShowComplaintForm(false)}
          onSubmit={submitComplaint}
          userTransactions={transactions}
        />
      )}
    </>
  );
};

export default PowerVendingApp;
