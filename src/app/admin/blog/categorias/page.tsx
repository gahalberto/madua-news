"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  _count?: {
    posts?: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        
        if (!response.ok) {
          throw new Error("Erro ao buscar categorias");
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Erro ao carregar categorias");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      toast.error("O nome da categoria não pode estar vazio");
      return;
    }
    
    setIsAdding(true);
    
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar categoria");
      }
      
      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setNewCategory("");
      toast.success("Categoria criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar categoria");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editName.trim() || !editingCategory) {
      toast.error("O nome da categoria não pode estar vazio");
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar categoria");
      }
      
      const updatedCategory = await response.json();
      setCategories(categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));
      setEditingCategory(null);
      toast.success("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar categoria");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir categoria");
      }
      
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao excluir categoria");
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/blog"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Categorias</h1>
        </div>
      </div>

      {/* Formulário para adicionar categoria */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Adicionar Nova Categoria</h2>
        <form onSubmit={handleAddCategory} className="flex items-center space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da categoria"
            disabled={isAdding}
          />
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isAdding || !newCategory.trim()}
          >
            <Plus size={16} className="mr-2" />
            {isAdding ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      </div>

      {/* Lista de categorias */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">Categorias Existentes</h2>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhuma categoria encontrada. Adicione uma categoria acima.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="p-4">
                {editingCategory?.id === category.id ? (
                  <form onSubmit={handleUpdateCategory} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Salvar"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-1 text-gray-600 hover:text-gray-800"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{category.name}</span>
                      {category._count?.posts !== undefined && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {category._count.posts} posts
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 