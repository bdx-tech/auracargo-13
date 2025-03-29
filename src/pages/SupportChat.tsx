
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Loader2, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SupportChat = () => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [newConversationContent, setNewConversationContent] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchConversations();

    const conversationsChannel = supabase
      .channel('support-conversations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'support_conversations', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Conversation change detected:', payload);
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);

      const messagesChannel = supabase
        .channel(`messages-${selectedConversation.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${selectedConversation.id}` },
          (payload) => {
            console.log('Message change detected:', payload);
            fetchMessages(selectedConversation.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const { data, error } = await supabase
        .from('support_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
      if (data?.length && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading conversations",
        description: error.message,
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data || []);
      
      markMessagesAsRead(conversationId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: error.message,
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_id', user?.id || '')
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const createConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newConversationTitle.trim() || !newConversationContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    
    try {
      setIsCreatingConversation(true);
      
      const { data: conversationData, error: conversationError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user?.id,
          title: newConversationTitle,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;
      
      if (conversationData) {
        const { error: messageError } = await supabase
          .from('support_messages')
          .insert({
            conversation_id: conversationData.id,
            sender_id: user?.id,
            is_admin: false,
            content: newConversationContent,
          });
          
        if (messageError) throw messageError;
        
        setSelectedConversation(conversationData);
        setNewConversationTitle("");
        setNewConversationContent("");
        setIsCreatingConversation(false);
        fetchConversations();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating conversation",
        description: error.message,
      });
      setIsCreatingConversation(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setIsSendingMessage(true);
      
      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          content: newMessage,
          is_admin: false,
        });
        
      if (error) throw error;
      
      await supabase
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);
      
      setNewMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message,
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Customer Support</h1>
          <p className="text-gray-600">Need help? Chat with our support team</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(!isMobile || (isMobile && showConversationList)) && (
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">Your Tickets</CardTitle>
                  <CardDescription className="text-base">View your support tickets or create a new one</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingConversations ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : conversations.length > 0 ? (
                    <ScrollArea className="h-[300px] md:h-[400px]">
                      <div className="space-y-3 pr-2">
                        {conversations.map((conversation) => (
                          <div 
                            key={conversation.id}
                            onClick={() => handleSelectConversation(conversation)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedConversation?.id === conversation.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium text-lg mb-1">{conversation.title}</div>
                            <div className="text-sm text-gray-500 mb-2">
                              {format(new Date(conversation.updated_at), 'MMM d, yyyy · h:mm a')}
                            </div>
                            <Badge className={`${
                              conversation.status === 'open' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }`}>
                              {conversation.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No tickets yet</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-kargon-red hover:bg-kargon-red/90 text-white"
                    onClick={() => {
                      setSelectedConversation(null);
                      if (isMobile) {
                        setShowConversationList(false);
                      }
                    }}
                  >
                    Create New Ticket
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {(!isMobile || (isMobile && !showConversationList)) && (
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader className="border-b">
                      <div className="flex items-center">
                        {isMobile && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mr-2 -ml-2" 
                            onClick={handleBackToList}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        )}
                        <div>
                          <CardTitle className="text-xl md:text-2xl">{selectedConversation.title}</CardTitle>
                          <div className="flex items-center mt-2">
                            <Badge className={`mr-2 ${
                              selectedConversation.status === 'open' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }`}>
                              {selectedConversation.status === 'open' ? (
                                <Clock className="h-3 w-3 mr-1 inline" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1 inline" />
                              )}
                              {selectedConversation.status}
                            </Badge>
                            <CardDescription className="text-sm">
                              Ticket #{selectedConversation.id.split('-')[0]}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <ScrollArea className="flex-1 p-4 h-[calc(100vh-450px)] md:h-[400px]">
                      {isLoadingMessages ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                      ) : messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((message) => {
                            const isCurrentUser = message.sender_id === user?.id;
                            const senderName = message.is_admin 
                              ? "Support Agent" 
                              : `${message.sender.first_name || ''} ${message.sender.last_name || ''}`;
                              
                            return (
                              <div 
                                key={message.id} 
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    isCurrentUser 
                                      ? 'bg-kargon-red text-white' 
                                      : message.is_admin 
                                        ? 'bg-indigo-100 text-gray-800' 
                                        : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <div className="text-sm font-medium mb-1">
                                    {senderName}
                                  </div>
                                  <div className="break-words">{message.content}</div>
                                  <div className="text-xs mt-1 opacity-70">
                                    {format(new Date(message.created_at), 'h:mm a')}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No messages yet
                        </div>
                      )}
                    </ScrollArea>
                    
                    <CardFooter className="border-t pt-4">
                      <form onSubmit={sendMessage} className="w-full flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          disabled={isSendingMessage}
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          disabled={!newMessage.trim() || isSendingMessage}
                          className="bg-kargon-red hover:bg-kargon-red/90"
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader>
                      {isMobile && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mb-2 -ml-2" 
                          onClick={handleBackToList}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to tickets
                        </Button>
                      )}
                      <CardTitle className="text-2xl font-bold">Create a New Support Ticket</CardTitle>
                      <CardDescription className="text-base">
                        Describe your issue and our support team will assist you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={createConversation} className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <Input
                            id="title"
                            value={newConversationTitle}
                            onChange={(e) => setNewConversationTitle(e.target.value)}
                            placeholder="Brief description of your issue"
                            disabled={isCreatingConversation}
                          />
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                          </label>
                          <Textarea
                            id="content"
                            value={newConversationContent}
                            onChange={(e) => setNewConversationContent(e.target.value)}
                            placeholder="Please provide details about your issue..."
                            disabled={isCreatingConversation}
                            className="h-32"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-kargon-red hover:bg-kargon-red/90" 
                          disabled={isCreatingConversation}
                        >
                          {isCreatingConversation ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Ticket...
                            </>
                          ) : (
                            'Submit Ticket'
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
