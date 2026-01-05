'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { renderCategoryIcon } from '@/lib/categoryIcons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import ReceitaModal from '@/components/modals/ReceitaModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import NoData from '@/components/NoData';
import type { Receita, ReceitaForm, Categoria } from '@/types';
import { formatDateBR } from '@/lib/dateUtils';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"
import { useReceitas } from '@/hooks/useReceitas';
import { useCategorias } from '@/hooks/useCategorias';
import { useBancos } from '@/hooks/useBancos';
import { Edit } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function ReceitasPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ReceitasContent />
      </AppLayout>
    </AuthGuard>
  );
}

const ReceitasContent: React.FC = () => {
  const searchParams = useSearchParams();
  
  // Hooks
  const { 
    receitas, 
    totalReceitas,
    loading: isLoading, 
    fetchReceitas, 
    createReceita, 
    updateReceita, 
    deleteReceita 
  } = useReceitas();
  
  const { 
    categorias, 
    fetchCategorias 
  } = useCategorias();
  
  const { 
    bancos, 
    fetchBancos 
  } = useBancos();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filtros, setFiltros] = useState<{
    busca: string;
    categoriaId?: string;
    bancoId?: string;
    recorrente?: boolean;
    mes?: string;
    ano?: string;
  }>({
    busca: '',
    categoriaId: undefined,
    bancoId: undefined,
    recorrente: undefined,
    mes: (new Date().getMonth() + 1).toString(),
    ano: new Date().getFullYear().toString(),
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [currentReceita, setCurrentReceita] = useState<Receita | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchCategorias({ tipo: 'receita', ativo: true });
    fetchBancos();
    handleSearch();
  }, []);

  // Debounce busca
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros.busca]);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      handleCreate();
    }
  }, [searchParams]);

  const handleSearch = () => {
    setCurrentPage(1);
    const params = {
      mes: filtros.mes ? parseInt(filtros.mes) : undefined,
      ano: filtros.ano ? parseInt(filtros.ano) : undefined,
      bancoId: filtros.bancoId,
      categoriaId: filtros.categoriaId,
      busca: filtros.busca,
      page: 1,
      limit: itemsPerPage
    };
    
    fetchReceitas(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = {
      mes: filtros.mes ? parseInt(filtros.mes) : undefined,
      ano: filtros.ano ? parseInt(filtros.ano) : undefined,
      bancoId: filtros.bancoId,
      categoriaId: filtros.categoriaId,
      busca: filtros.busca,
      page: page,
      limit: itemsPerPage
    };
    
    fetchReceitas(params);
  };

  const handleClearFilters = () => {
    const currentMonth = (new Date().getMonth() + 1).toString();
    const currentYear = new Date().getFullYear().toString();

    setFiltros({
      busca: '',
      categoriaId: undefined,
      bancoId: undefined,
      recorrente: undefined,
      mes: currentMonth,
      ano: currentYear,
    });
    
    setCurrentPage(1);
    fetchReceitas({
      mes: parseInt(currentMonth),
      ano: parseInt(currentYear),
      page: 1,
      limit: itemsPerPage
    });
  };

  const handleEdit = (receita: Receita) => {
    setCurrentReceita(receita);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (receita: Receita) => {
    setCurrentReceita(receita);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (receita: Receita) => {
    setReceitaToDelete({ id: receita._id, nome: receita.descricao });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!receitaToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteReceita(receitaToDelete.id);
      await handleSearch();
      setShowDeleteModal(false);
      setReceitaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    setCurrentReceita(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleSaveReceita = async (data: ReceitaForm) => {
    if (modalType === 'create') {
      await createReceita(data);
    } else if (modalType === 'edit' && currentReceita) {
      await updateReceita(currentReceita._id, data);
    }
    await handleSearch();
    setShowModal(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return formatDateBR(date);
  };

  const getRecorrenciaText = (recorrente: boolean, tipoRecorrencia?: string) => {
    if (!recorrente) return 'Única';
    const labels: Record<string, string> = {
      mensal: 'Mensal',
      anual: 'Anual',
    };
    return tipoRecorrencia ? (labels[tipoRecorrencia] || tipoRecorrencia) : 'Recorrente';
  };

  const totalPages = Math.ceil(totalReceitas / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e entradas de dinheiro
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      <Card className="border shadow-sm">
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Listagem de Receitas</CardTitle>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform duration-200", showFilters ? "rotate-180" : "")} />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar receitas..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch}>Buscar</Button>
                <Button variant="outline" onClick={handleClearFilters}>Limpar</Button>
              </div>
            </div>

            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={filtros.categoriaId || "all"}
                    onValueChange={(value) => setFiltros({ ...filtros, categoriaId: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias">
                        {filtros.categoriaId && filtros.categoriaId !== 'all' && categorias.find(c => c._id === filtros.categoriaId) && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: categorias.find(c => c._id === filtros.categoriaId)?.cor || '#22c55e' }}
                            >
                              {renderCategoryIcon(categorias.find(c => c._id === filtros.categoriaId)?.icone || 'tag', "h-2.5 w-2.5")}
                            </div>
                            <span>{categorias.find(c => c._id === filtros.categoriaId)?.nome}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria._id} value={categoria._id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: categoria.cor || '#22c55e' }}
                            >
                              {renderCategoryIcon(categoria.icone || 'tag', "h-2.5 w-2.5")}
                            </div>
                            <span>{categoria.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select
                    value={filtros.bancoId || "all"}
                    onValueChange={(value) => setFiltros({ ...filtros, bancoId: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os bancos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os bancos</SelectItem>
                      {bancos.map((banco) => (
                        <SelectItem key={banco._id} value={banco._id}>
                          {banco.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Recorrência</Label>
                  <Select
                    value={filtros.recorrente === undefined ? "all" : filtros.recorrente ? "recorrente" : "unica"}
                    onValueChange={(value) => setFiltros({ 
                      ...filtros, 
                      recorrente: value === "all" ? undefined : value === "recorrente" 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="unica">Única</SelectItem>
                      <SelectItem value="recorrente">Recorrentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select
                    value={filtros.mes || "all"}
                    onValueChange={(value) => setFiltros({ ...filtros, mes: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os meses</SelectItem>
                      {[
                        { value: "1", label: "Janeiro" },
                        { value: "2", label: "Fevereiro" },
                        { value: "3", label: "Março" },
                        { value: "4", label: "Abril" },
                        { value: "5", label: "Maio" },
                        { value: "6", label: "Junho" },
                        { value: "7", label: "Julho" },
                        { value: "8", label: "Agosto" },
                        { value: "9", label: "Setembro" },
                        { value: "10", label: "Outubro" },
                        { value: "11", label: "Novembro" },
                        { value: "12", label: "Dezembro" },
                      ].map((mes) => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select
                    value={filtros.ano || "all"}
                    onValueChange={(value) => setFiltros({ ...filtros, ano: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os anos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : receitas.length === 0 ? (
              <NoData
                title="Nenhuma receita encontrada"
                description="Não há receitas que correspondam aos filtros aplicados ou você ainda não criou nenhuma receita."
                icon="search"
                actionButton={{
                  label: "Nova Receita",
                  onClick: handleCreate
                }}
              />
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Recorrência</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receitas.map((receita) => {
                        const categoria = typeof receita.categoriaId === 'object'
                          ? (receita.categoriaId as Categoria)
                          : categorias.find((c) => c._id === receita.categoriaId);
                        
                        const categoriaNome = categoria?.nome;
                        const categoriaCor = categoria?.cor || '#22c55e';
                        const categoriaIcone = categoria?.icone || 'tag';

                        return (
                          <TableRow key={receita._id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="font-medium text-foreground">{receita.descricao}</div>
                              {receita.observacoes && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {receita.observacoes}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                  style={{ backgroundColor: categoriaCor }}
                                >
                                  {renderCategoryIcon(categoriaIcone, "h-3 w-3")}
                                </div>
                                <span className="text-sm">{categoriaNome}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-emerald-600 dark:text-emerald-500">
                                {formatCurrency(receita.valor)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                {formatDate(receita.data)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={receita.recorrente ? "secondary" : "outline"}>
                                {getRecorrenciaText(receita.recorrente, receita.tipoRecorrencia)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(receita)}
                                  title="Visualizar"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(receita)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(receita)}
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Logic to show limited pages if too many
                          if (
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 || 
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Collapsible>
      </Card>

      <ReceitaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
        initialData={currentReceita}
        onSave={handleSaveReceita}
        isLoading={isLoading}
        categorias={categorias}
        bancos={bancos}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Receita"
        itemName={receitaToDelete?.nome || ''}
        itemType="receita"
        isLoading={isDeleting}
      />
    </div>
  );
};
