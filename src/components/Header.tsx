import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Lightbulb, MessageSquare, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  user: { id: string; username: string } | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user) return { problems: 0, solutions: 0 };
      
      const [problemsResult, solutionsResult] = await Promise.all([
        supabase.from("problems").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("solutions").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);

      return {
        problems: problemsResult.count || 0,
        solutions: solutionsResult.count || 0,
      };
    },
    enabled: !!user,
  });

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary glow-pink">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-glow-pink">
            FixFare
          </span>
        </div>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-foreground">
                  {user.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass border-border/50">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-foreground">{user.username}</p>
                <p className="text-xs text-muted-foreground">Community Member</p>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="px-2 py-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Problems Posted
                  </span>
                  <span className="font-medium text-foreground">{stats?.problems || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4 text-secondary" />
                    Solutions Shared
                  </span>
                  <span className="font-medium text-foreground">{stats?.solutions || 0}</span>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={onLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
