import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const MIN_FORM_TIME = 3000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  honeypot?: string;
  verified?: boolean;
  timeOnForm?: number;
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= MAX_EMAIL_LENGTH;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateContactForm(data: ContactFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.length > MAX_NAME_LENGTH) {
    errors.push(`Name must be ${MAX_NAME_LENGTH} characters or less`);
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (data.phone && data.phone.length > MAX_PHONE_LENGTH) {
    errors.push(`Phone must be ${MAX_PHONE_LENGTH} characters or less`);
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (data.subject.length > MAX_SUBJECT_LENGTH) {
    errors.push(`Subject must be ${MAX_SUBJECT_LENGTH} characters or less`);
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  } else if (data.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return `${ip}-${userAgent.substring(0, 50)}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const body: ContactFormData = await request.json();

    if (body.honeypot) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    if (!body.verified) {
      return NextResponse.json(
        { error: 'Please confirm you are not a robot' },
        { status: 400 }
      );
    }

    if (body.timeOnForm && body.timeOnForm < MIN_FORM_TIME) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    const validation = validateContactForm(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const identifier = getClientIdentifier(request);

    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_contact_rate_limit', {
        p_identifier: identifier,
        p_max_attempts: 3,
        p_window_hours: 1
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return NextResponse.json(
        { error: 'Unable to process request' },
        { status: 500 }
      );
    }

    if (!rateLimitData.allowed) {
      const retryAfter = Math.ceil(rateLimitData.retry_after || 3600);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many submissions. Please try again later.',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: sanitizeInput(body.name),
          email: sanitizeInput(body.email),
          phone: body.phone ? sanitizeInput(body.phone) : null,
          subject: sanitizeInput(body.subject),
          message: sanitizeInput(body.message)
        }
      ]);

    if (insertError) {
      console.error('Error inserting contact submission:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit form' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been received. We\'ll get back to you soon!',
        rateLimit: {
          remaining: rateLimitData.remaining,
          resetAt: rateLimitData.reset_at
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
