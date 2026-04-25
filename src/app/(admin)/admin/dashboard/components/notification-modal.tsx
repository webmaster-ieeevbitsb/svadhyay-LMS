"use client";

import { useState } from "react";
import { Mail, Loader2, Send, CheckCircle2, AlertCircle, Beaker, RefreshCw } from "lucide-react";
import { sendBatchNotification, sendTestNotification, resetNotificationStatus, NotificationStats } from "@/app/actions/notifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TacticalConfirm } from "@/components/ui/tactical-confirm";

interface Participant {
  email: string;
  name?: string;
  is_admin: boolean;
  is_completed?: boolean;
  last_notified_at?: string | null;
  created_at: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
}

export function NotificationModal({ isOpen, onClose, participants }: NotificationModalProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");

  if (!isOpen) return null;

  const totalStudents = participants.length;
  const pendingStudents = participants.filter(p => !p.last_notified_at).length;
  const notifiedStudents = totalStudents - pendingStudents;

  const handleReset = async () => {
    setIsConfirmResetOpen(false);
    setIsResetting(true);
    try {
      const res = await resetNotificationStatus();
      if (res.success) {
        toast.success("Notification status reset successfully.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reset status.");
      }
    } catch (error) {
      toast.error("Failed to reset notification status.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    setIsSending(true);
    setStats(null);

    try {
      const result = await sendBatchNotification({
        subject,
        message,
        ctaLink: `${window.location.origin}/dashboard`,
        ctaText: "Go to Dashboard",
      });
      setStats(result);
      router.refresh();
      if (result.failed === 0) {
        toast.success(`Successfully sent ${result.sent} emails!`);
      } else {
        toast.warning(`Sent ${result.sent} emails, but ${result.failed} failed.`);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while sending emails.");
    } finally {
      setIsSending(false);
    }
  };

  const handleTestSend = async () => {
    if (!subject || !message || !testEmail) {
      toast.error("Please fill in subject, message, and a test email address.");
      return;
    }

    setIsTesting(true);

    try {
      const result = await sendTestNotification({
        to: testEmail,
        subject,
        message,
        ctaLink: `${window.location.origin}/dashboard`,
        ctaText: "Go to Dashboard",
      });
      
      if (result.success) {
        toast.success(`Test email sent successfully to ${testEmail}`);
      } else {
        toast.error(`Failed to send test email: ${result.error}`);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while sending the test email.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isSending ? onClose : undefined}
      />
      
      <div className="relative w-full max-w-2xl bg-[#0d0d12] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
        
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Mail className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Course Announcement</h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Send a professional update</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                    {pendingStudents} Pending
                  </span>
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                    {notifiedStudents} Notified
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto">
               <button 
                type="button"
                onClick={() => setIsConfirmResetOpen(true)}
                disabled={isSending || isResetting}
                title="Reset Notification Status"
                className="p-3 bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:border-white/10 rounded-xl transition-all"
               >
                 <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
               </button>
            </div>
          </div>

          {!stats ? (
            <form onSubmit={handleSend} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New Module Available: Advanced React Patterns"
                  className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white focus:outline-none focus:border-blue-500/30 transition-all rounded-2xl placeholder-zinc-800 text-sm"
                  disabled={isSending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your announcement here..."
                  className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white focus:outline-none focus:border-blue-500/30 transition-all rounded-2xl placeholder-zinc-800 text-sm min-h-[200px] resize-none"
                  disabled={isSending}
                />
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email for testing..."
                    className="flex-1 bg-white/5 border border-white/5 px-6 py-4 text-white focus:outline-none focus:border-blue-500/30 transition-all rounded-2xl placeholder-zinc-800 text-sm"
                    disabled={isSending || isTesting}
                  />
                  <button
                    type="button"
                    onClick={handleTestSend}
                    disabled={isSending || isTesting || !testEmail}
                    className="px-8 py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Beaker className="w-5 h-5" />}
                    Send Test
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 border-t border-white/5 pt-4 mt-2">
                  <button
                    type="submit"
                    disabled={isSending || isTesting || pendingStudents === 0}
                    className="flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-95"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Batch...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {pendingStudents === 0 
                          ? "All Students Notified" 
                          : `Dispatch to ${pendingStudents} Pending Students`}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSending || isTesting}
                    className="px-8 py-5 bg-white/5 border border-white/5 text-zinc-500 hover:text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total</p>
                  <p className="text-3xl font-black text-white">{stats.total}</p>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-3xl text-center">
                  <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-2">Sent</p>
                  <p className="text-3xl font-black text-green-500">{stats.sent}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl text-center">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2">Failed</p>
                  <p className="text-3xl font-black text-red-500">{stats.failed}</p>
                </div>
              </div>

              {stats.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Error Log
                  </p>
                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl max-h-[150px] overflow-y-auto custom-scrollbar">
                    {stats.errors.map((err, i) => (
                      <p key={i} className="text-red-400 font-mono text-[9px] mb-1">{err}</p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all hover:bg-blue-500 hover:text-white flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                Return to Registry
              </button>
            </div>
          )}
        </div>
      </div>

      <TacticalConfirm
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleReset}
        title="Reset Dispatch Status"
        description="Are you sure you want to reset the notification status for all students? This will allow you to send a fresh announcement to everyone."
        variant="info"
        confirmText="Reset Status"
      />
    </div>
  );
}
