
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchRecentConversation();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [recentMessages]);

  useEffect(() => {
    if (activeConversation) {
      const messagesChannel = supabase
        .channel(`bubble-messages-${activeConversation.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${activeConversation.id}` },
          (payload) => {
            console.log('Message change detected:', payload);
            fetchMessages(activeConversation.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRecentConversation = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get most recent open conversation, if any
      const { data, error } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('updated_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setActiveConversation(data[0]);
        fetchMessages(data[0].id);
      } else {
        setRecentMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching recent conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select(`
          *,
          sender:sender_id(
            id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) throw error;
      
      setRecentMessages(data || []);
      
      // Mark messages as read
      await supabase
        .from('support_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('is_admin', true)
        .eq('read', false);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    if (!activeConversation) {
      await createNewConversation();
      return;
    }
    
    setIsSending(true);
    
    try {
      // Send the message
      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: user.id,
          content: message,
          is_admin: false,
        });
        
      if (error) throw error;
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversation.id);
      
      setMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const createNewConversation = async () => {
    if (!user || !message.trim()) return;
    
    setIsSending(true);
    
    try {
      // Create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user.id,
          title: 'Quick Support Chat',
        })
        .select()
        .single();

      if (conversationError) throw conversationError;
      
      // Add the initial message
      if (conversationData) {
        const { error: messageError } = await supabase
          .from('support_messages')
          .insert({
            conversation_id: conversationData.id,
            sender_id: user.id,
            is_admin: false,
            content: message,
          });
          
        if (messageError) throw messageError;
        
        setActiveConversation(conversationData);
        setMessage("");
        fetchMessages(conversationData.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating conversation",
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleNavigateToSupport = () => {
    setIsOpen(false);
    navigate('/support');
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Open support chat"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 shadow-xl transition-all animate-scale-in">
          <Card className="w-full">
            <CardHeader className="bg-primary text-white rounded-t-lg p-4 flex flex-row justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Customer Support
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-primary/80" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentMessages.length > 0 ? (
                  <div className="space-y-4">
                    {recentMessages.map((msg) => {
                      const isCustomer = !msg.is_admin;
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-2 ${
                              isCustomer 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="break-words text-sm">
                              {msg.content}
                            </div>
                            <div className="text-xs mt-1 opacity-70">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-muted-foreground text-sm mb-2">
                      Welcome to customer support!
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Send a message to start a conversation with our team.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t p-3">
              <form onSubmit={handleSendMessage} className="w-full flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  type="button" 
                  size="sm" 
                  className="text-xs"
                  onClick={handleNavigateToSupport}
                >
                  View all support tickets
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatBubble;
