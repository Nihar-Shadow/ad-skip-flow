-- Create users_data table
CREATE TABLE public.users_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ads JSONB DEFAULT '[]'::jsonb,
  countdown INTEGER DEFAULT 30,
  short_links JSONB DEFAULT '[]'::jsonb,
  analytics JSONB DEFAULT '{"totalClicks": 0, "totalViews": 0, "popularLinks": [], "adPerformance": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user-specific access
CREATE POLICY "Users can view their own data"
ON public.users_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
ON public.users_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
ON public.users_data
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
ON public.users_data
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_users_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_data_updated_at
BEFORE UPDATE ON public.users_data
FOR EACH ROW
EXECUTE FUNCTION public.update_users_data_updated_at();

-- Create index for faster lookups by user_id
CREATE INDEX idx_users_data_user_id ON public.users_data(user_id);