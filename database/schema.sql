-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discos table
CREATE TABLE IF NOT EXISTS discos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  disco_id UUID REFERENCES discos(id) NOT NULL,
  disco_name TEXT NOT NULL,
  meter_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  token TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart_meters table
CREATE TABLE IF NOT EXISTS smart_meters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meter_number TEXT NOT NULL,
  disco_id UUID REFERENCES discos(id) NOT NULL,
  current_balance DECIMAL(10,2) DEFAULT 0,
  daily_average DECIMAL(10,2) DEFAULT 0,
  last_reading TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, meter_number)
);

-- Create consumption_records table
CREATE TABLE IF NOT EXISTS consumption_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id UUID REFERENCES smart_meters(id) ON DELETE CASCADE NOT NULL,
  consumption DECIMAL(10,2) NOT NULL,
  reading_date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meter_alerts table
CREATE TABLE IF NOT EXISTS meter_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meter_id UUID REFERENCES smart_meters(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_balance', 'high_consumption', 'unusual_pattern')),
  threshold_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meter_id UUID REFERENCES smart_meters(id) ON DELETE CASCADE NOT NULL,
  prediction_date DATE NOT NULL,
  predicted_consumption DECIMAL(10,2) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meter_id UUID REFERENCES smart_meters(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  estimated_savings TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_model_metrics table
CREATE TABLE IF NOT EXISTS ai_model_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_version TEXT NOT NULL,
  accuracy_score DECIMAL(3,2) NOT NULL,
  data_points INTEGER NOT NULL,
  last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  training_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_smart_meters_user_id ON smart_meters(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_meters_meter_number ON smart_meters(meter_number);
CREATE INDEX IF NOT EXISTS idx_consumption_records_meter_id ON consumption_records(meter_id);
CREATE INDEX IF NOT EXISTS idx_consumption_records_reading_date ON consumption_records(reading_date);
CREATE INDEX IF NOT EXISTS idx_meter_alerts_user_id ON meter_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_id ON ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_prediction_date ON ai_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_user_id ON ai_model_metrics(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discos ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for discos (public read access)
DROP POLICY IF EXISTS "Anyone can view active discos" ON discos;
CREATE POLICY "Anyone can view active discos" ON discos
  FOR SELECT USING (is_active = true);

-- Create RLS policies for smart_meters
DROP POLICY IF EXISTS "Users can view own smart meters" ON smart_meters;
CREATE POLICY "Users can view own smart meters" ON smart_meters
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own smart meters" ON smart_meters;
CREATE POLICY "Users can insert own smart meters" ON smart_meters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own smart meters" ON smart_meters;
CREATE POLICY "Users can update own smart meters" ON smart_meters
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for consumption_records
DROP POLICY IF EXISTS "Users can view own consumption records" ON consumption_records;
CREATE POLICY "Users can view own consumption records" ON consumption_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM smart_meters 
      WHERE smart_meters.id = consumption_records.meter_id 
      AND smart_meters.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own consumption records" ON consumption_records;
CREATE POLICY "Users can insert own consumption records" ON consumption_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM smart_meters 
      WHERE smart_meters.id = consumption_records.meter_id 
      AND smart_meters.user_id = auth.uid()
    )
  );

-- Create RLS policies for meter_alerts
DROP POLICY IF EXISTS "Users can view own meter alerts" ON meter_alerts;
CREATE POLICY "Users can view own meter alerts" ON meter_alerts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meter alerts" ON meter_alerts;
CREATE POLICY "Users can insert own meter alerts" ON meter_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meter alerts" ON meter_alerts;
CREATE POLICY "Users can update own meter alerts" ON meter_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_predictions
DROP POLICY IF EXISTS "Users can view own ai predictions" ON ai_predictions;
CREATE POLICY "Users can view own ai predictions" ON ai_predictions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai predictions" ON ai_predictions;
CREATE POLICY "Users can insert own ai predictions" ON ai_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for ai_recommendations
DROP POLICY IF EXISTS "Users can view own ai recommendations" ON ai_recommendations;
CREATE POLICY "Users can view own ai recommendations" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai recommendations" ON ai_recommendations;
CREATE POLICY "Users can insert own ai recommendations" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ai recommendations" ON ai_recommendations;
CREATE POLICY "Users can update own ai recommendations" ON ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_model_metrics
DROP POLICY IF EXISTS "Users can view own ai model metrics" ON ai_model_metrics;
CREATE POLICY "Users can view own ai model metrics" ON ai_model_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai model metrics" ON ai_model_metrics;
CREATE POLICY "Users can insert own ai model metrics" ON ai_model_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default DISCOs
INSERT INTO discos (name, code) VALUES
  ('Abuja Electricity Distribution Company', 'AEDC'),
  ('Benin Electricity Distribution Company', 'BEDC'),
  ('Eko Electricity Distribution Company', 'EKEDC'),
  ('Enugu Electricity Distribution Company', 'EEDC'),
  ('Ibadan Electricity Distribution Company', 'IBEDC'),
  ('Ikeja Electric', 'IE'),
  ('Jos Electricity Distribution Company', 'JEDC'),
  ('Kaduna Electricity Distribution Company', 'KEDC'),
  ('Kano Electricity Distribution Company', 'KEDCO'),
  ('Port Harcourt Electricity Distribution Company', 'PHEDC'),
  ('Yola Electricity Distribution Company', 'YEDC')
ON CONFLICT (code) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create customer_complaints table
CREATE TABLE IF NOT EXISTS customer_complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  complaint_type TEXT NOT NULL CHECK (complaint_type IN ('payment_issue', 'token_not_working', 'wrong_amount', 'service_issue', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes TEXT,
  resolution TEXT,
  assigned_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support_agent')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_customer_complaints_user_id ON customer_complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_complaints_status ON customer_complaints(status);
CREATE INDEX IF NOT EXISTS idx_customer_complaints_priority ON customer_complaints(priority);
CREATE INDEX IF NOT EXISTS idx_customer_complaints_created_at ON customer_complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

-- Enable RLS for new tables
ALTER TABLE customer_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_complaints
DROP POLICY IF EXISTS "Admins can view all complaints" ON customer_complaints;
CREATE POLICY "Admins can view all complaints" ON customer_complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can view own complaints" ON customer_complaints;
CREATE POLICY "Users can view own complaints" ON customer_complaints
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own complaints" ON customer_complaints;
CREATE POLICY "Users can insert own complaints" ON customer_complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update complaints" ON customer_complaints;
CREATE POLICY "Admins can update complaints" ON customer_complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create RLS policies for admin_users
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create RLS policies for admin_activity_log
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_log;
CREATE POLICY "Admins can view activity logs" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_complaints_updated_at ON customer_complaints;
CREATE TRIGGER update_customer_complaints_updated_at
  BEFORE UPDATE ON customer_complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
