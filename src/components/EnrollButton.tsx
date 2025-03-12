"use client";

import { useState } from "react";

interface EnrollButtonProps {
  courseId: string;
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Erro ao se matricular no curso');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao se matricular:', error);
      alert('Erro ao se matricular no curso');
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleEnroll}
      disabled={isLoading}
      className="w-full py-3 bg-blue-600 text-white rounded-md font-bold mb-4 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {isLoading ? "Processando..." : "Matricular-se Agora"}
    </button>
  );
} 