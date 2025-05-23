
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, X, Minimize, Maximize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content: "Hello! I'm TabbyAI Assistant. How can I help you with your debate tournament today?"
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to conversation
    const userMessage = { role: "user" as const, content: message };
    setConversation(prev => [...prev, userMessage]);
    setMessage("");
    
    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const responses = [
        "I can help you set up round pairings based on team scores.",
        "Would you like me to analyze the results from the previous round?",
        "I can suggest judge allocations to minimize conflicts of interest.",
        "Let me check the tournament schedule and suggest some optimizations.",
        "I've analyzed the debate motions and can suggest balanced alternatives."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setConversation(prev => [
        ...prev, 
        { role: "assistant" as const, content: randomResponse }
      ]);
      setIsLoading(false);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-tabby-secondary hover:bg-tabby-secondary/90 text-white"
      >
        <BrainCircuit className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed z-50 transition-all duration-300 shadow-xl rounded-lg overflow-hidden bg-white border border-gray-200",
        isMinimized 
          ? "bottom-6 right-6 h-14 w-72" 
          : "bottom-6 right-6 h-96 w-72 md:w-96"
      )}
    >
      {/* Header */}
      <div className="bg-tabby-primary p-3 flex items-center justify-between">
        <div className="flex items-center">
          <BrainCircuit className="h-5 w-5 text-tabby-secondary mr-2" />
          <h3 className="text-sm font-medium text-white">TabbyAI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-tabby-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-tabby-primary-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="p-4 h-[calc(100%-110px)] overflow-y-auto space-y-4">
            {conversation.map((msg, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "user" 
                      ? "bg-tabby-secondary text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-tabby-secondary" />
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask the AI assistant..."
                className="tabby-input text-sm"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-tabby-secondary hover:bg-tabby-secondary/90"
                disabled={message.trim() === "" || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
