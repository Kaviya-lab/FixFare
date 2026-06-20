import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { UsernameDialog } from "@/components/UsernameDialog";
import { ProblemCard } from "@/components/ProblemCard";
import { PostProblemDialog } from "@/components/PostProblemDialog";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { ProblemDetail } from "@/components/ProblemDetail";
import { useUser } from "@/hooks/useUser";
import { Problem, Category } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Zap, Sparkles } from "lucide-react";

const Index = () => {
  const { user, isLoading: userLoading, setUser, logout } = useUser();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "most_solved">("newest");
  const [newProblemIds, setNewProblemIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Show username dialog if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      setShowUsernameDialog(true);
    }
  }, [userLoading, user]);

  // Fetch problems
  const { data: problems = [], isLoading: problemsLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problems")
        .select(`
          *,
          user:users(username),
          solutions:solutions(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((p) => ({
        ...p,
        solutions_count: p.solutions?.[0]?.count || 0,
      })) as Problem[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("problems-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "problems" },
        (payload) => {
          // Add new problem ID to highlight set
          setNewProblemIds((prev) => new Set([...prev, payload.new.id as string]));
          
          // Clear highlight after animation
          setTimeout(() => {
            setNewProblemIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(payload.new.id as string);
              return newSet;
            });
          }, 2000);
          
          // Invalidate query to refresh data
          queryClient.invalidateQueries({ queryKey: ["problems"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "problems" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["problems"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    let result = [...problems];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === "most_solved") {
      result.sort((a, b) => Number(b.is_solved) - Number(a.is_solved));
    }
    // Default is newest, which is already sorted from the query

    return result;
  }, [problems, searchQuery, selectedCategory, sortBy]);

  const handleUserComplete = (newUser: { id: string; username: string }) => {
    setUser(newUser);
    setShowUsernameDialog(false);
  };

  const handleLogout = () => {
    logout();
    setShowUsernameDialog(true);
  };

  const handleProblemClick = (problem: Problem) => {
    // Fetch full problem with user details
    setSelectedProblem(problem);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full gradient-primary animate-pulse-glow flex items-center justify-center">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading FixFare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      <Header user={user} onLogout={handleLogout} />

      <main className="container px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-glow-pink">Fix</span>
            <span className="text-glow-blue">Fare</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Share your daily problems, discover practical solutions, and help others solve theirs
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Problems Feed */}
        {problemsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-lg animate-shimmer"
              />
            ))}
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No problems found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Be the first to post a problem!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onClick={() => handleProblemClick(problem)}
                isNew={newProblemIds.has(problem.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Post Button */}
      {user && (
        <PostProblemDialog
          userId={user.id}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["problems"] })}
        />
      )}

      {/* Problem Detail Sheet */}
      {user && (
        <ProblemDetail
          problem={selectedProblem}
          userId={user.id}
          onClose={() => setSelectedProblem(null)}
        />
      )}

      {/* Username Dialog */}
      <UsernameDialog
        open={showUsernameDialog}
        onComplete={handleUserComplete}
      />
    </div>
  );
};

export default Index;
