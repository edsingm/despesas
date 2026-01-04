'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchCategorias, 
  deleteCategoria, 
  setCurrentCategoria, 
  clearCurrentCategoria 
} from '@/store/slices/categoriaSlice';
import { Plus, Search, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { renderCategoryIcon } from '@/lib/categoryIcons';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import CategoriaModal from '@/components/modals/CategoriaModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { Categoria } from '@/types';
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
  const dispatch = useAppDispatch();
  const { categorias, isLoading, pagination } = useAppSelector((state) => state.categoria);
  
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchCategorias({ 
      tipo: filtroTipo === 'todos' ? undefined : filtroTipo,
      busca: debouncedSearch || undefined,
      page: 1,
      limit: 12 // Grid de 4 colunas fica bom com múltiplos de 4
    }));
  }, [dispatch, filtroTipo, debouncedSearch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchCategorias({ 
      tipo: filtroTipo === 'todos' ? undefined : filtroTipo,
      busca: debouncedSearch || undefined,
      page,
      limit: 12
    }));
  };

  const handleCreate = () => {
    dispatch(clearCurrentCategoria());
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (categoria: Categoria) => {
    dispatch(setCurrentCategoria(categoria));
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoriaToDelete) {
      await dispatch(deleteCategoria(categoriaToDelete._id));
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(pagination.page - 1)}
              className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === pagination.page}
                onClick={() => handlePageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < pagination.pages && (
            <>
              {endPage < pagination.pages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(pagination.pages)}>
                  {pagination.pages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(pagination.page + 1)}
              className={pagination.page === pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categorias.map((categoria: Categoria) => (
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
        />
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Categoria"
        itemName={categoriaToDelete?.nome || ''}
        itemType="categoria"
        isLoading={isLoading}
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
