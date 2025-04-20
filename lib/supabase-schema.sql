-- Create schema for Job Application Tracker

-- Enable Row Level Security (RLS)
ALTER DATABASE CURRENT SET "app.settings.jwt_secret" TO 'YOUR_JWT_SECRET';

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT,
    location TEXT,
    industry TEXT,
    notes TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy for companies table
CREATE POLICY "Users can only CRUD their own companies" ON companies
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    date_applied DATE NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policy for applications table
CREATE POLICY "Users can only CRUD their own applications" ON applications
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    notes TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for contacts table
CREATE POLICY "Users can only CRUD their own contacts" ON contacts
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Interviews Table
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time TIME NOT NULL,
    format TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policy for interviews table
CREATE POLICY "Users can only CRUD their own interviews" ON interviews
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_path TEXT NOT NULL,
    type TEXT NOT NULL,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    public_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for documents table
CREATE POLICY "Users can only CRUD their own documents" ON documents
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Set up Storage policies for documents bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can view their own documents" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can update their own documents" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can delete their own documents" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'documents' AND auth.uid() = (storage.foldername(name))[1]::uuid);