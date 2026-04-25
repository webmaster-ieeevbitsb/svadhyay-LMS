"use server";

import { fetchParticipants } from "./participants";
import { sendEmail } from "@/utils/email";
import { getCourseNotificationTemplate } from "@/utils/email-templates";
import { createClient } from "@/utils/supabase/server";

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
  const students = participants.filter(p => !p.is_admin && !p.last_notified_at);

  const stats: NotificationStats = {
    total: students.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  // STRICT LIMIT: Only process 45 students per click to safely stay under the 50/hour cPanel limit.
  // We do not loop through all students, because cPanel accepts the emails silently and discards them later if we exceed 50.
  const batch = students.slice(0, 45);

  const results = await Promise.allSettled(
      batch.map(async (p) => {
        if (!p.email) throw new Error(`Missing email for participant: ${p.name}`);

        const prodCtaLink = ctaLink?.replace(/https?:\/\/localhost(:\d+)?/g, 'https://svadhyay.ieeevbitsb.in');

        const html = getCourseNotificationTemplate({
          name: p.name || "Student",
          subject,
          message,
          ctaLink: prodCtaLink || ctaLink,
          ctaText,
        });

        const info = await sendEmail({
          to: p.email,
          subject,
          html,
        });

        // Update last_notified_at on success
        const supabase = await createClient();
        await supabase
          .from("participants")
          .update({ last_notified_at: new Date().toISOString() })
          .eq("email", p.email);

        return info;
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
    const prodCtaLink = ctaLink?.replace(/https?:\/\/localhost(:\d+)?/g, 'https://svadhyay.ieeevbitsb.in');

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

/**
 * Resets the notification status for all students.
 */
export async function resetNotificationStatus() {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("participants")
      .update({ last_notified_at: null })
      .eq("is_admin", false);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to reset notification status" };
  }
}

