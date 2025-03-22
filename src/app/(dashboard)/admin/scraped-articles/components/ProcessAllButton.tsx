"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProcessAllButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessAll = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/scraper/process-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao processar artigos");
      }

      if (data.processing === 0) {
        toast.info("Nenhum artigo pendente para processar");
      } else {
        toast.success(
          `Processamento de ${data.processing} artigos iniciado com sucesso! Os artigos serão traduzidos em segundo plano.`
        );
      }
    } catch (error) {
      console.error("Erro ao processar artigos:", error);
      toast.error(
        `Erro ao iniciar processamento: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      onClick={handleProcessAll}
      disabled={isLoading}
      className="ml-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        "Processar Todos Pendentes"
      )}
    </Button>
  );
} 