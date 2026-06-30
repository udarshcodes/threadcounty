"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Toaster, toast } from "react-hot-toast";

export function RealtimeNotifications() {
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channelId = `notifications-${user.id}-${Date.now()}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newNotif = payload.new as any;
            toast(newNotif.title, {
              icon: '🔔',
              duration: 5000,
            });
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <Toaster position="top-right" />;
}
