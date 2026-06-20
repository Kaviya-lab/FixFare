import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrCreateUser } from "@/lib/user-store";
import { toast } from "sonner";
import { Sparkles, User } from "lucide-react";

interface UsernameDialogProps {
  open: boolean;
  onComplete: (user: { id: string; username: string }) => void;
}

export function UsernameDialog({ open, onComplete }: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Please enter a username");
      return;
    }

    if (trimmedUsername.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (trimmedUsername.length > 20) {
      toast.error("Username must be less than 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }

    setIsLoading(true);
    try {
      const user = await getOrCreateUser(trimmedUsername);
      toast.success(`Welcome to FixFare, ${user.username}!`);
      onComplete(user);
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("This username is already taken");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="glass border-primary/20 sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-primary animate-pulse-glow">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-display text-glow-pink">
            Welcome to FixFare
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a username to start sharing problems and solutions with the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:border-primary focus:ring-primary/20"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full gradient-primary text-primary-foreground glow-pink hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
