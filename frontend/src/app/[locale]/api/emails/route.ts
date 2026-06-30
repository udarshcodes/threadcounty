import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ReportReadyEmail } from '@/emails/ReportReady';

// Initialize Resend with API key from env
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set in environment variables.");
}

const resend = new Resend(resendApiKey || 'dummy_to_prevent_crash_but_will_fail');

export async function POST(request: Request) {
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
  }
  try {
    const { email, userName, fileName, reportId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'ThreadCounty <notifications@threadcounty.com>',
      to: [email],
      subject: 'Your ThreadCounty AI Analysis is Complete',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      react: ReportReadyEmail({ userName, fileName, reportId }) as any,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
