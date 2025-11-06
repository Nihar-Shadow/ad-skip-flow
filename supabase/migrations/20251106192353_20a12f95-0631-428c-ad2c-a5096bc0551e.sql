-- Create enum for roles (MUST be separate from users table for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'developer', 'user');

-- Create profiles table for basic user info
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create users_data table for user content
CREATE TABLE public.users_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ads_uploaded jsonb DEFAULT '[]'::jsonb,
  downloads jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add user_id to short_links table for ownership tracking
ALTER TABLE public.short_links 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_short_links_user_id ON public.short_links(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_users_data_user_id ON public.users_data(user_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_data ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create users_data entry
  INSERT INTO public.users_data (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Developers can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'developer'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Developers can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'developer'));

-- RLS Policies for users_data
CREATE POLICY "Users can view own data"
  ON public.users_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON public.users_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user data"
  ON public.users_data FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all user data"
  ON public.users_data FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user data"
  ON public.users_data FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Developers can view all user data"
  ON public.users_data FOR SELECT
  USING (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers can update user data"
  ON public.users_data FOR UPDATE
  USING (public.has_role(auth.uid(), 'developer'));

-- Update short_links RLS policies
DROP POLICY IF EXISTS "Anyone can create short links" ON public.short_links;
DROP POLICY IF EXISTS "Anyone can delete short links" ON public.short_links;
DROP POLICY IF EXISTS "Anyone can update short links" ON public.short_links;
DROP POLICY IF EXISTS "Anyone can view short links" ON public.short_links;

CREATE POLICY "Authenticated users can create short links"
  ON public.short_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own short links"
  ON public.short_links FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own short links"
  ON public.short_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own short links"
  ON public.short_links FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all short links"
  ON public.short_links FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all short links"
  ON public.short_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Developers can view all short links"
  ON public.short_links FOR SELECT
  USING (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers can update short links"
  ON public.short_links FOR UPDATE
  USING (public.has_role(auth.uid(), 'developer'));

-- Allow public to view short links for redirect functionality
CREATE POLICY "Public can view short links for redirect"
  ON public.short_links FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_users_data
  BEFORE UPDATE ON public.users_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();