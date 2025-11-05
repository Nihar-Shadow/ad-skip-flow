-- Create short_links table
CREATE TABLE public.short_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (link shortener needs to be publicly accessible)
CREATE POLICY "Anyone can view short links"
ON public.short_links
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create short links"
ON public.short_links
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update short links"
ON public.short_links
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete short links"
ON public.short_links
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_short_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_short_links_updated_at
BEFORE UPDATE ON public.short_links
FOR EACH ROW
EXECUTE FUNCTION public.update_short_links_updated_at();

-- Create index for faster lookups by short_code
CREATE INDEX idx_short_links_short_code ON public.short_links(short_code);