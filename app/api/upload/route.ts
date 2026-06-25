import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
    const isPdf = ext === 'pdf';
    const isText = ['txt', 'md', 'csv'].includes(ext);

    let fileType: 'image' | 'pdf' | 'text';
    if (isImage) fileType = 'image';
    else if (isPdf) fileType = 'pdf';
    else if (isText) fileType = 'text';
    else {
      return NextResponse.json(
        { error: 'Unsupported file type. Accepted: images, PDFs, text files' },
        { status: 400 }
      );
    }

    const filePath = `references/${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('study-files')
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    let extractedText: string | null = null;
    if (isText) {
      extractedText = await file.text();
    }

    const { data: reference, error: dbError } = await supabase
      .from('uploaded_references')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        file_path: filePath,
        file_type: fileType,
        file_name: file.name,
        file_size_bytes: file.size,
        extracted_text: extractedText,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ reference });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
