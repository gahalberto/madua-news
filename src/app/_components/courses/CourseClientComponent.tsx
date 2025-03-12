'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
// Importe apenas o que for necessário para o cliente
// NÃO importe nada relacionado a bcrypt ou auth.ts

// Defina interfaces adequadas para os tipos
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  // Adicione outros campos conforme necessário
}

interface CourseProps {
  course: Course;
  session: Session | null;
}

export default function CourseClientComponent({ course, session }: CourseProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Implementar a lógica do cliente
  const handleEnroll = async () => {
    if (!session) {
      // Redirecionar para login
      window.location.href = `/login?callbackUrl=/cursos/${course.id}`;
      return;
    }
    
    setIsLoading(true);
    try {
      // Lógica para matricular o usuário
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao matricular');
      }
      
      // Redirecionar ou atualizar a UI
      window.location.href = `/cursos/${course.id}/aulas`;
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <button 
        onClick={handleEnroll}
        disabled={isLoading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {isLoading ? "Processando..." : "Matricular-se"}
      </button>
    </div>
  );
} 