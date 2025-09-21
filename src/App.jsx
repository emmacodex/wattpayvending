import React, { useState, useEffect } from 'react';
import { Phone, Mail, Eye, EyeOff, ArrowLeft, Zap, CreditCard, Clock, Receipt, MessageCircle, User, Home, History, Settings, Search, Download, Star } from 'lucide-react';
import { useAuth } from './contexts/AuthContext.jsx';
import { useTransactions } from './hooks/useTransactions.js';
import { supabase, discos } from './lib/supabase.js';

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
  
  const { user, profile, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { transactions, loading: transactionsLoading, createTransaction, searchTransactions } = useTransactions(user?.id);

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
      <div className="flex justify-around">
        <button 
          className={`flex flex-col items-center p-2 ${currentScreen === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setCurrentScreen('dashboard')}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${currentScreen === 'history' ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setCurrentScreen('history')}
        >
          <History className="w-5 h-5" />
          <span className="text-xs mt-1">History</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${currentScreen === 'support' ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setCurrentScreen('support')}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-1">Support</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${currentScreen === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setCurrentScreen('profile')}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
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
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Quick Buy</h3>
              <p className="text-sm text-gray-600">Repeat last purchase</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <Receipt className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Recent</h3>
              <p className="text-sm text-gray-600">View transactions</p>
            </div>
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
                  <label key={method} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      required
                    />
                    <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="font-medium">{method}</span>
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
              <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-4" />
                <div className="text-left">
                  <p className="font-semibold">Live Chat</p>
                  <p className="text-sm text-gray-600">Chat with our support team</p>
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
              await signOut();
              setCurrentScreen('auth');
            }}
            className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold border border-red-200"
          >
            Logout
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return null;
};

export default PowerVendingApp;
