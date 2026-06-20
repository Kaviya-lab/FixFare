import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Lightbulb } from "lucide-react";
import { CATEGORIES, Category } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostProblemDialogProps {
  userId: string;
  onSuccess: () => void;
}

export function PostProblemDialog({ userId, onSuccess }: PostProblemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your problem");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("problems").insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
      });

      if (error) throw error;

      toast.success("Problem posted! The community will help you solve it.");
      setTitle("");
      setDescription("");
      setCategory("");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to post problem. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full gradient-primary glow-pink animate-float shadow-2xl hover:scale-110 transition-transform z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-primary/20 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">
                Post a Problem
              </DialogTitle>
              <DialogDescription>
                Share your daily challenge with the community
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Problem Title</Label>
            <Input
              id="title"
              placeholder="e.g., My phone cable keeps breaking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as Category)}>
              <SelectTrigger className="bg-muted/50 border-border focus:border-primary">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="glass border-border/50">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your problem in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-muted/50 border-border focus:border-primary resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gradient-primary text-primary-foreground glow-pink"
              disabled={isLoading}
            >
              {isLoading ? "Posting..." : "Post Problem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
