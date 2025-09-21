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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discos ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for discos (public read access)
CREATE POLICY "Anyone can view active discos" ON discos
  FOR SELECT USING (is_active = true);

-- Create RLS policies for smart_meters
CREATE POLICY "Users can view own smart meters" ON smart_meters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own smart meters" ON smart_meters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smart meters" ON smart_meters
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for consumption_records
CREATE POLICY "Users can view own consumption records" ON consumption_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM smart_meters 
      WHERE smart_meters.id = consumption_records.meter_id 
      AND smart_meters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own consumption records" ON consumption_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM smart_meters 
      WHERE smart_meters.id = consumption_records.meter_id 
      AND smart_meters.user_id = auth.uid()
    )
  );

-- Create RLS policies for meter_alerts
CREATE POLICY "Users can view own meter alerts" ON meter_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meter alerts" ON meter_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meter alerts" ON meter_alerts
  FOR UPDATE USING (auth.uid() = user_id);

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

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
