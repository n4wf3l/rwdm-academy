import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mail, Trash2, Reply } from "lucide-react";

interface Message {
  id: number;
  senderEmail: string;
  senderName: string;
  subject: string;
  content: string;
  date: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    senderEmail: "contact@rwdm-academy.be",
    senderName: "RWD Membre",
    subject: "Demande d'inscription",
    content: "Bonjour, je souhaite inscrire mon fils pour la saison prochaine.",
    date: "25/04/2025",
  },
  {
    id: 2,
    senderEmail: "joueur92@gmail.com",
    senderName: "Ahmed B.",
    subject: "Problème planning",
    content:
      "Le créneau du mercredi ne me convient plus. Possible de changer ?",
    date: "24/04/2025",
  },
];

const Inbox = () => {
  const [newMessages, setNewMessages] = useState<Message[]>(initialMessages);
  const [repliedMessages, setRepliedMessages] = useState<Message[]>([]);

  const handleReply = (message: Message) => {
    setNewMessages((prev) => prev.filter((m) => m.id !== message.id));
    setRepliedMessages((prev) => [...prev, message]);
    window.location.href = `mailto:${message.senderEmail}?subject=Re: ${message.subject}`;
  };

  const handleDelete = (messageId: number, from: "new" | "replied") => {
    if (from === "new") {
      setNewMessages((prev) => prev.filter((m) => m.id !== messageId));
    } else {
      setRepliedMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  const renderMessages = (messages: Message[], from: "new" | "replied") => (
    <ScrollArea className="h-[500px] w-full pr-2">
      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">Aucun message.</p>
      ) : (
        messages.map((msg) => (
          <Card key={msg.id} className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{msg.subject}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {msg.senderName} — {msg.senderEmail}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {msg.date}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700">{msg.content}</p>
              <div className="flex gap-2">
                {from === "new" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReply(msg)}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Répondre
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(msg.id, from)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </ScrollArea>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête : même structure que Members */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Boîte de réception
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez les messages reçus via le formulaire de contact.
            </p>
          </div>

          <Button
            className="bg-rwdm-blue text-white hover:bg-rwdm-blue/90"
            onClick={() =>
              (window.location.href =
                "mailto:admin@rwdm-academy.be?subject=Contact RWDM Academy&body=")
            }
          >
            <Mail className="mr-2 h-4 w-4" />
            Envoyer un mail
          </Button>
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="new">Nouveaux</TabsTrigger>
            <TabsTrigger value="replied">Répondus</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            {renderMessages(newMessages, "new")}
          </TabsContent>
          <TabsContent value="replied">
            {renderMessages(repliedMessages, "replied")}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Inbox;
