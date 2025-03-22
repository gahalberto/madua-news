"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  postId: string;
  initialViews: number;
}

export default function ViewCounter({ postId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    // Registra a visualização quando o componente é montado
    const registerView = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: "POST",
        });
        
        if (response.ok) {
          const data = await response.json();
          setViews(data.views);
        }
      } catch (error) {
        console.error("Erro ao registrar visualização:", error);
      }
    };

    registerView();
  }, [postId]);

  return (
    <div className="flex items-center text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>{views}</span>
    </div>
  );
} 