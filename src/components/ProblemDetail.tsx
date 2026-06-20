import { useState } from "react";
import { Problem, Solution } from "@/types/database";
import { CategoryBadge } from "./CategoryBadge";
import { SolutionCard } from "./SolutionCard";
import { AddSolutionForm } from "./AddSolutionForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  User,
  Calendar 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProblemDetailProps {
  problem: Problem | null;
  userId: string;
  onClose: () => void;
}

export function ProblemDetail({ problem, userId, onClose }: ProblemDetailProps) {
  const queryClient = useQueryClient();

  // Fetch solutions for this problem
  const { data: solutions = [], isLoading: solutionsLoading } = useQuery({
    queryKey: ["solutions", problem?.id],
    queryFn: async () => {
      if (!problem) return [];
      
      const { data, error } = await supabase
        .from("solutions")
        .select(`
          *,
          user:users(username)
        `)
        .eq("problem_id", problem.id)
        .order("upvotes_count", { ascending: false });

      if (error) throw error;

      // Check which solutions the user has upvoted
      const { data: userUpvotes } = await supabase
        .from("upvotes")
        .select("solution_id")
        .eq("user_id", userId);

      const upvotedIds = new Set(userUpvotes?.map(u => u.solution_id) || []);

      return data.map(s => ({
        ...s,
        has_upvoted: upvotedIds.has(s.id),
      })) as Solution[];
    },
    enabled: !!problem,
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (solutionId: string) => {
      const solution = solutions.find(s => s.id === solutionId);
      
      if (solution?.has_upvoted) {
        // Remove upvote
        const { error } = await supabase
          .from("upvotes")
          .delete()
          .eq("solution_id", solutionId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Add upvote
        const { error } = await supabase
          .from("upvotes")
          .insert({ solution_id: solutionId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions", problem?.id] });
    },
    onError: () => {
      toast.error("Failed to update vote");
    },
  });

  // Mark as solved mutation
  const solveMutation = useMutation({
    mutationFn: async () => {
      if (!problem) return;
      const { error } = await supabase
        .from("problems")
        .update({ is_solved: !problem.is_solved })
        .eq("id", problem.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      toast.success(problem?.is_solved ? "Marked as unsolved" : "Marked as solved!");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleSolutionAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["solutions", problem?.id] });
    queryClient.invalidateQueries({ queryKey: ["problems"] });
  };

  if (!problem) return null;

  const isOwner = problem.user_id === userId;

  return (
    <Sheet open={!!problem} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl glass border-l border-border/50 p-0">
        <SheetHeader className="sticky top-0 z-10 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-display truncate">
                {problem.title}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Problem details and solutions
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-6 space-y-6">
            {/* Problem Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={problem.category} />
                {problem.is_solved ? (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Solved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Unsolved
                  </Badge>
                )}
              </div>

              <p className="text-foreground leading-relaxed">
                {problem.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {problem.user?.username || "Anonymous"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(problem.created_at), "MMM d, yyyy")}
                </span>
              </div>

              {isOwner && (
                <Button
                  variant="outline"
                  onClick={() => solveMutation.mutate()}
                  disabled={solveMutation.isPending}
                  className={problem.is_solved 
                    ? "border-muted-foreground/30" 
                    : "border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  }
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {problem.is_solved ? "Mark as Unsolved" : "Mark as Solved"}
                </Button>
              )}
            </div>

            {/* Add Solution Form */}
            <AddSolutionForm
              problemId={problem.id}
              problemTitle={problem.title}
              problemDescription={problem.description}
              userId={userId}
              onSuccess={handleSolutionAdded}
            />

            {/* Solutions List */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                Solutions
                <span className="text-sm font-normal text-muted-foreground">
                  ({solutions.length})
                </span>
              </h3>

              {solutionsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-lg animate-shimmer" />
                  ))}
                </div>
              ) : solutions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No solutions yet. Be the first to help!
                </div>
              ) : (
                <div className="space-y-3">
                  {solutions.map((solution) => (
                    <SolutionCard
                      key={solution.id}
                      solution={solution}
                      onUpvote={() => upvoteMutation.mutate(solution.id)}
                      isUpvoting={upvoteMutation.isPending}
                      currentUserId={userId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
