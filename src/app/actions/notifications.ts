"use server";

import { fetchParticipants } from "./participants";
import { sendEmail } from "@/utils/email";
import { getCourseNotificationTemplate } from "@/utils/email-templates";

export type NotificationStats = {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
};

/**
 * Sends a notification email to all participants in batches.
 * Batch size and delay are configured to respect cPanel SMTP limits.
 */
export async function sendBatchNotification({
  subject,
  message,
  ctaLink,
  ctaText,
}: {
  subject: string;
  message: string;
  ctaLink?: string;
  ctaText?: string;
}) {
  const participants = await fetchParticipants();
  const students = participants.filter(p => !p.is_admin);

  const stats: NotificationStats = {
    total: students.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const BATCH_SIZE = 50;
  const DELAY_MS = 2000; // 2 seconds between batches

  // Process in batches
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.allSettled(
      batch.map(async (p) => {
        if (!p.email) throw new Error(`Missing email for participant: ${p.name}`);
        
        const html = getCourseNotificationTemplate({
          name: p.name || "Student",
          subject,
          message,
          ctaLink,
          ctaText,
        });

        return sendEmail({
          to: p.email,
          subject,
          html,
        });
      })
    );

    results.forEach((res, index) => {
      if (res.status === "fulfilled") {
        stats.sent++;
      } else {
        stats.failed++;
        stats.errors.push(`Failed for ${batch[index].email}: ${res.reason?.message || "Unknown error"}`);
      }
    });

    // Wait before next batch if there are more to send
    if (i + BATCH_SIZE < students.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return stats;
}

/**
 * Sends a single test email.
 */
export async function sendTestNotification({
  to,
  subject,
  message,
  ctaLink,
  ctaText,
}: {
  to: string;
  subject: string;
  message: string;
  ctaLink?: string;
  ctaText?: string;
}) {
  try {
    // Force production URL for the test button if it's currently localhost
    const prodCtaLink = ctaLink?.replace('http://localhost:3000', 'https://svadhyay.ieeevbitsb.in');

    // Try to find the actual name of the person we are sending the test to
    const participants = await fetchParticipants();
    const recipient = participants.find(p => p.email.toLowerCase() === to.toLowerCase());
    const recipientName = recipient?.name || "Student";

    const html = getCourseNotificationTemplate({
      name: recipientName, // Showing you the REAL name associated with this email
      subject,
      message,
      ctaLink: prodCtaLink || ctaLink,
      ctaText,
    });

    await sendEmail({
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to send test email" };
  }
}

