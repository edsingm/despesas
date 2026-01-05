'use client';

import React, { useEffect, useState } from 'react';
import { useCategorias } from '@/hooks/useCategorias';
import { Plus, Search, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { renderCategoryIcon } from '@/lib/categoryIcons';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import CategoriaModal from '@/components/modals/CategoriaModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { Categoria, CategoriaForm } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

function CategoriasContent() {
  const { 
    categorias, 
    loading, 
    currentCategoria, 
    setCurrentCategoria, 
    fetchCategorias, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria 
  } = useCategorias();
  
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, searchTerm]);

  // Client-side filtering
  const filteredCategorias = categorias.filter(cat => {
    const matchesTipo = filtroTipo === 'todos' ? true : cat.tipo === filtroTipo;
    const matchesSearch = searchTerm === '' ? true : cat.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTipo && matchesSearch;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const paginatedCategorias = filteredCategorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreate = () => {
    setCurrentCategoria(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setCurrentCategoria(categoria);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoriaToDelete) {
      await deleteCategoria(categoriaToDelete._id);
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    }
  };

  const handleSave = async (data: CategoriaForm) => {
    if (modalType === 'create') {
      await createCategoria(data);
    } else if (modalType === 'edit' && currentCategoria) {
      await updateCategoria(currentCategoria._id, data);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    // Sempre mostra a primeira página
    pages.push(1);

    // Lógica para mostrar ... e páginas ao redor da atual
    if (currentPage > 3) {
      pages.push('ellipsis-start');
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis-end');
    }

    // Sempre mostra a última página se houver mais de uma
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page as number)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground">Gerencie as categorias de suas transações</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="todos" value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)} className="w-full sm:w-auto">
          <TabsList className="bg-muted/50 border">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCategorias.length === 0 ? (
        <Card className="text-center py-16 border shadow-sm bg-muted/10">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted">
                <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Nenhuma categoria encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-[300px] mx-auto">
              Comece criando categorias para organizar suas receitas e despesas.
            </p>
            <div className="mt-8">
              <Button onClick={handleCreate} variant="outline" className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedCategorias.map((categoria: Categoria) => (
              <Card key={categoria._id} className="group border shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div 
                        className="p-3 rounded-xl transition-colors shadow-sm text-white"
                        style={{ backgroundColor: categoria.cor || (categoria.tipo === 'receita' ? '#22c55e' : '#ef4444') }}
                      >
                        {renderCategoryIcon(categoria.icone, "h-5 w-5")}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate mb-1.5">{categoria.nome}</h3>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-bold border-transparent px-2 py-0",
                            categoria.tipo === 'receita' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          )}
                        >
                          {categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(categoria)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(categoria)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {!categoria.ativa && (
                    <div className="bg-muted/50 px-5 py-1.5 border-t text-[10px] text-muted-foreground font-medium uppercase tracking-widest text-center">
                      Inativa
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {categorias.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-2xl bg-muted/20">
                <FolderOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-base font-semibold text-foreground">Nenhuma categoria encontrada</p>
                <p className="text-sm">Ajuste seus filtros ou crie uma nova categoria para começar.</p>
                <Button variant="outline" className="mt-6" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar minha primeira categoria
                </Button>
              </div>
            )}
          </div>
          
          {renderPagination()}
        </>
      )}

      {showModal && (
        <CategoriaModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalType}
          initialData={currentCategoria}
          onSave={handleSave}
          isLoading={loading}
        />
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Categoria"
        itemName={categoriaToDelete?.nome || ''}
        itemType="categoria"
        isLoading={loading}
      />
    </div>
  );
}


export default function CategoriasPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <CategoriasContent />
      </AppLayout>
    </AuthGuard>
  );
}
