-- Setup staging database with current production schema
-- Run this in your NEW staging Supabase project

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.scraps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create scraps table with CURRENT schema (before migration)
CREATE TABLE IF NOT EXISTS public.scraps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'image')),
    title TEXT, -- Currently nullable
    content TEXT, -- Will be migrated to observations
    source TEXT, -- Will be removed
    creator TEXT, -- Already in use in UI
    medium TEXT, -- Already in use in UI
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scrap_id UUID REFERENCES public.scraps(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, scrap_id)
);

-- RLS Policies for scraps
CREATE POLICY "Users can view their own scraps" ON public.scraps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraps" ON public.scraps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraps" ON public.scraps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraps" ON public.scraps
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_history
CREATE POLICY "Users can view their own chat history" ON public.chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history" ON public.chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history" ON public.chat_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history" ON public.chat_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('scrap-images', 'scrap-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for scrap images
CREATE POLICY "Users can view scrap images" ON storage.objects
    FOR SELECT USING (bucket_id = 'scrap-images');

CREATE POLICY "Users can upload scrap images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'scrap-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their scrap images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'scrap-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their scrap images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'scrap-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Sample data removed due to foreign key constraints
-- You can add sample data through the application after user authentication is set up

-- Success message
SELECT 'Staging database setup complete!' as status; 