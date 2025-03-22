"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchContacts();
    }
  }, [status]);

  async function fetchContacts() {
    try {
      const response = await fetch("/api/admin/contacts");
      if (!response.ok) {
        throw new Error("Erro ao buscar contatos");
      }
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar contatos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar contato");
      }

      setContacts(contacts.filter((contact) => contact.id !== id));
      toast({
        title: "Sucesso",
        description: "Contato deletado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar contato",
        variant: "destructive",
      });
    }
  }

  if (status === "loading" || isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Contatos</h1>
      <div className="grid gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{contact.subject}</CardTitle>
                  <CardDescription>
                    {contact.name} - {contact.email}
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(contact.id)}
                >
                  Deletar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-muted-foreground">
                Tipo: {contact.type}
              </p>
              <p className="whitespace-pre-wrap">{contact.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 