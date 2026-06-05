"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { supabase } from "@/features/auth/services";
import { useProfile } from "@/features/dashboard/hooks";
import type { Conversation, Message, Profile } from "@/shared/types/database";
import { MessageSquare, ChevronRight, Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ConversationWithDetails extends Conversation {
  last_message: Message | null;
  other_participant: Profile | null;
  unread_count: number;
}

export default function MessagesPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { profile } = useProfile();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Get conversations where user is a participant
      const { data: participantRows } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", profile.user_id);

      if (!participantRows || participantRows.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participantRows.map((r) => r.conversation_id);

      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (!convos) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // For each conversation, get last message + other participant
      const withDetails: ConversationWithDetails[] = [];
      for (const convo of convos) {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convo.id)
          .neq("user_id", profile.user_id)
          .single();

        let otherProfile: Profile | null = null;
        if (otherParticipant) {
          const { data: p } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", otherParticipant.user_id)
            .single();
          otherProfile = p;
        }

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", convo.id)
          .neq("sender_id", profile.user_id)
          .eq("is_read", false);

        withDetails.push({
          ...convo,
          last_message: lastMsg ?? null,
          other_participant: otherProfile,
          unread_count: unreadCount ?? 0,
        });
      }

      setConversations(withDetails);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filtered = search
    ? conversations.filter((c) =>
        c.other_participant?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Messages</h1>
        <p className="text-mid text-sm mt-1">Chat with hosts and guests</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="pl-10 h-10"
        />
      </div>

      {/* Conversations list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-mid" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">
              {search ? "No conversations found" : "No messages yet"}
            </h3>
            <p className="text-mid text-sm">
              {search
                ? "Try a different search term."
                : "Start a conversation by contacting a host from a property listing."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((convo) => (
            <Link key={convo.id} href={`/${locale}/dashboard/messages/${convo.id}`}>
              <Card className="border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="w-12 h-12 shrink-0">
                    {convo.other_participant?.avatar_url ? (
                      <AvatarImage src={convo.other_participant.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {convo.other_participant?.full_name?.[0] ?? "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-dark truncate">
                        {convo.other_participant?.full_name ?? "Unknown user"}
                      </p>
                      <span className="text-xs text-mid shrink-0 ml-2">
                        {convo.last_message ? formatTime(convo.last_message.created_at) : formatTime(convo.updated_at)}
                      </span>
                    </div>
                    <p className="text-sm text-mid truncate mt-0.5">
                      {convo.last_message?.content ?? convo.subject ?? "No messages yet"}
                    </p>
                  </div>
                  {convo.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">
                      {convo.unread_count}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-mid shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
