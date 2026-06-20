import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquarePlus, Link, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddSolutionFormProps {
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  userId: string;
  onSuccess: () => void;
}

export function AddSolutionForm({ 
  problemId, 
  problemTitle,
  problemDescription,
  userId, 
  onSuccess 
}: AddSolutionFormProps) {
  const [content, setContent] = useState("");
  const [productLink, setProductLink] = useState("");
  const [productName, setProductName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showProductFields, setShowProductFields] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isAI = false) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please write a solution");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("solutions").insert({
        problem_id: problemId,
        user_id: userId,
        content: content.trim(),
        product_link: productLink.trim() || null,
        product_name: productName.trim() || null,
        is_ai_generated: isAI,
      });

      if (error) throw error;

      toast.success("Solution posted successfully!");
      setContent("");
      setProductLink("");
      setProductName("");
      setShowProductFields(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to post solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAISolution = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await supabase.functions.invoke("generate-solution", {
        body: {
          problemTitle,
          problemDescription,
        },
      });

      if (response.error) throw response.error;

      const { solution, productRecommendation, productLink: aiProductLink } = response.data;
      
      setContent(solution);
      if (productRecommendation) {
        setShowProductFields(true);
        setProductName(productRecommendation);
        if (aiProductLink) {
          setProductLink(aiProductLink);
        }
      }
      
      toast.success("AI solution generated! Review and edit before posting.");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate AI solution. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          Add Your Solution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="solution">Your Solution</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAISolution}
                disabled={isGeneratingAI}
                className="border-secondary/30 text-secondary hover:bg-secondary/10"
              >
                {isGeneratingAI ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate AI Solution
              </Button>
            </div>
            <Textarea
              id="solution"
              placeholder="Share your practical solution..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-muted/30 border-border focus:border-primary resize-none"
              disabled={isSubmitting || isGeneratingAI}
            />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowProductFields(!showProductFields)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Link className="mr-2 h-4 w-4" />
              {showProductFields ? "Hide" : "Add"} Product Link
            </Button>
            
            {showProductFields && (
              <div className="grid gap-3 pl-6">
                <div className="space-y-1">
                  <Label htmlFor="productName" className="text-sm">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Cable Protector Set"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-muted/30 border-border focus:border-primary"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="productLink" className="text-sm">Product URL</Label>
                  <Input
                    id="productLink"
                    placeholder="https://amazon.com/..."
                    value={productLink}
                    onChange={(e) => setProductLink(e.target.value)}
                    className="bg-muted/30 border-border focus:border-primary"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-secondary text-secondary-foreground glow-blue"
            disabled={isSubmitting || isGeneratingAI}
          >
            {isSubmitting ? "Posting..." : "Post Solution"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
