'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSearchParams } from 'next/navigation';
import {
  fetchDespesas,
  deleteDespesa,
  clearCurrentDespesa,
  setCurrentDespesa
} from '@/store/slices/despesaSlice';
import { fetchCategoriasDespesa } from '@/store/slices/categoriaSlice';
import { fetchBancos } from '@/store/slices/bancoSlice';
import { fetchCartoes } from '@/store/slices/cartaoSlice';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Calendar as CalendarIcon, 
  CreditCard, 
  DollarSign, 
  Settings, 
  ChevronDown 
} from 'lucide-react';
import { renderCategoryIcon } from '@/lib/categoryIcons';
import { cn } from "@/lib/utils"
import ParcelasManager from '@/components/ParcelasManager';
import DespesaModal from '@/components/modals/DespesaModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import NoData from '@/components/NoData';
import { FiltroDespesa, Categoria, Banco, Cartao, Despesa } from '@/types';
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
  TableFooter
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DespesasPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <DespesasContent />
      </AppLayout>
    </AuthGuard>
  );
}

const DespesasContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { despesas, isLoading, pagination, totalFiltrado } = useAppSelector((state) => state.despesa);
  const { categoriasDespesa: categorias } = useAppSelector((state) => state.categoria);
  const { bancos } = useAppSelector((state) => state.banco);
  const { cartoes } = useAppSelector((state) => state.cartao);

  const [filtros, setFiltros] = useState<{
    busca: string;
    categoriaId?: string;
    bancoId?: string;
    cartaoId?: string;
    formaPagamento?: FiltroDespesa['formaPagamento'];
    recorrente?: boolean;
    mes?: string;
    ano?: string;
  }>({
    busca: '',
    categoriaId: undefined,
    bancoId: undefined,
    cartaoId: undefined,
    formaPagamento: undefined,
    recorrente: undefined,
    mes: undefined,
    ano: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showParcelasModal, setShowParcelasModal] = useState(false);
  const [selectedDespesaParcelasId, setSelectedDespesaParcelasId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchDespesas({ page: 1, limit: 10 }));
    dispatch(fetchCategoriasDespesa());
    dispatch(fetchBancos(undefined));
    dispatch(fetchCartoes(undefined));
  }, [dispatch]);

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
    const { busca, mes, ano, ...params } = filtros;
    
    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    
    if (mes && ano) {
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      dataInicio = `${anoNum}-${mesNum.toString().padStart(2, '0')}-01`;
      
      const ultimoDia = new Date(anoNum, mesNum, 0).getDate();
      dataFim = `${anoNum}-${mesNum.toString().padStart(2, '0')}-${ultimoDia}`;
    } else if (ano) {
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
    }
    
    dispatch(fetchDespesas({ 
      page: 1, 
      limit: 10, 
      ...params,
      busca, 
      dataInicio, 
      dataFim 
    }));
  };

  const handleClearFilters = () => {
    setFiltros({
      busca: '',
      categoriaId: undefined,
      bancoId: undefined,
      cartaoId: undefined,
      formaPagamento: undefined,
      recorrente: undefined,
      mes: undefined,
      ano: undefined,
    });

    dispatch(fetchDespesas({ page: 1, limit: 10 }));
  };

  const handlePageChange = (page: number) => {
    const { busca, mes, ano, ...params } = filtros;
    
    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    
    if (mes && ano) {
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      dataInicio = `${anoNum}-${mesNum.toString().padStart(2, '0')}-01`;
      
      const ultimoDia = new Date(anoNum, mesNum, 0).getDate();
      dataFim = `${anoNum}-${mesNum.toString().padStart(2, '0')}-${ultimoDia}`;
    } else if (ano) {
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
    }
    
    dispatch(fetchDespesas({ page, limit: 10, ...params, busca, dataInicio, dataFim }));
  };

  const handleEdit = (despesa: Despesa) => {
    dispatch(setCurrentDespesa(despesa));
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (despesa: Despesa) => {
    dispatch(setCurrentDespesa(despesa));
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (despesa: Despesa) => {
    setDespesaToDelete({ id: despesa._id, nome: despesa.descricao });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!despesaToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteDespesa(despesaToDelete.id)).unwrap();
      handleSearch(); // Refresh list using current filters
      setShowDeleteModal(false);
      setDespesaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    dispatch(clearCurrentDespesa());
    setModalType('create');
    setShowModal(true);
  };

  const handleManageParcelas = (despesa: any) => {
    setSelectedDespesaParcelasId(despesa._id);
    setShowParcelasModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalDespesasFiltradas = totalFiltrado;

  const formatDate = (date: string) => {
    return formatDateBR(date);
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'debito': 'Débito',
      'credito': 'Crédito',
      'pix': 'PIX',
      'transferencia': 'Transferência',
    };
    return labels[forma] || forma;
  };

  const getStatusPagamento = (despesa: Despesa) => {
    if (despesa.parcelado && despesa.parcelas) {
      const pagas = despesa.parcelas.filter((p) => p.paga).length;
      const total = despesa.parcelas.length;
      
      if (pagas === 0) return { label: 'Pendente', variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-transparent' };
      if (pagas === total) return { label: 'Pago', variant: 'secondary' as const, className: 'bg-success/10 text-success border-transparent' };
      return { label: `${pagas}/${total} Parcelas`, variant: 'secondary' as const, className: 'bg-warning/10 text-warning border-transparent' };
    }
    
    return despesa.pago 
      ? { label: 'Pago', variant: 'secondary' as const, className: 'bg-success/10 text-success border-transparent' }
      : { label: 'Pendente', variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-transparent' };
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
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(pagination.page - 1)}
              aria-disabled={pagination.page === 1}
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
              aria-disabled={pagination.page === pagination.pages}
              className={pagination.page === pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas e gastos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <Card className="border shadow-sm">
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Listagem de Despesas</CardTitle>
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
                placeholder="Buscar despesas..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
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
                            style={{ backgroundColor: categorias.find(c => c._id === filtros.categoriaId)?.cor || '#ef4444' }}
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
                            style={{ backgroundColor: categoria.cor || '#ef4444' }}
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
                <Label>Forma de Pagamento</Label>
                <Select
                  value={filtros.formaPagamento || "all"}
                  onValueChange={(value) => setFiltros({ ...filtros, formaPagamento: value === "all" ? undefined : value as FiltroDespesa['formaPagamento'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
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
                <Label>Cartão</Label>
                <Select
                  value={filtros.cartaoId || "all"}
                  onValueChange={(value) => setFiltros({ ...filtros, cartaoId: value === "all" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os cartões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cartões</SelectItem>
                    {cartoes.map((cartao) => (
                      <SelectItem key={cartao._id} value={cartao._id}>
                        {cartao.nome}
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

              <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select
                    value={filtros.mes || "all"}
                    onValueChange={(value) => setFiltros({ ...filtros, mes: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mês" />
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
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
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
            </div>
          </CollapsibleContent>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : despesas.length === 0 ? (
            <NoData
              title="Nenhuma despesa encontrada"
              description="Não há despesas que correspondam aos filtros aplicados ou você ainda não criou nenhuma despesa."
              icon="search"
              actionButton={{
                label: "Nova Despesa",
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
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesas.map((despesa) => {
                    const status = getStatusPagamento(despesa);
                    const categoria = typeof despesa.categoriaId === 'object'
                      ? (despesa.categoriaId as Categoria)
                      : categorias.find((c) => c._id === despesa.categoriaId);
                    
                    const categoriaNome = categoria?.nome;
                    const categoriaCor = categoria?.cor || '#ef4444';
                    const categoriaIcone = categoria?.icone || 'tag';

                    const cartaoNome = despesa.cartaoId && (typeof despesa.cartaoId === 'object'
                      ? (despesa.cartaoId as Cartao).nome
                      : cartoes.find((c) => c._id === despesa.cartaoId)?.nome);
                    const bancoNome = despesa.bancoId && (typeof despesa.bancoId === 'object'
                      ? (despesa.bancoId as Banco).nome
                      : bancos.find((b) => b._id === despesa.bancoId)?.nome);

                    return (
                      <TableRow key={despesa._id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-medium text-foreground">{formatDate(despesa.data)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{despesa.descricao}</span>
                            {despesa.observacoes && (
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{despesa.observacoes}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: categoriaCor }}
                            >
                              {renderCategoryIcon(categoriaIcone, "h-3.5 w-3.5")}
                            </div>
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent font-medium">
                              {categoriaNome || '—'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          {formatCurrency(despesa.valorTotal)}
                          {despesa.parcelado && despesa.parcelas && (
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">
                              {despesa.parcelas.length}x {formatCurrency(despesa.valorTotal / despesa.parcelas.length)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-foreground">
                            {despesa.formaPagamento === 'credito' ? (
                              <CreditCard className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            ) : (
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            )}
                            {getFormaPagamentoLabel(despesa.formaPagamento)}
                          </div>
                          {(cartaoNome || bancoNome) && (
                            <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                              {cartaoNome || bancoNome}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                            {formatDate(despesa.data)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={status.variant}
                            className={cn(status.className, "font-medium")}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleView(despesa)} title="Visualizar" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(despesa)} title="Editar" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {despesa.parcelado && despesa.parcelas && despesa.parcelas.length > 0 && (
                              <Button variant="ghost" size="icon" onClick={() => handleManageParcelas(despesa)} title="Gerenciar Parcelas" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                            {despesa.comprovante && (
                              <Button variant="ghost" size="icon" onClick={() => window.open(despesa.comprovante, '_blank')} title="Comprovante" className="h-8 w-8 text-muted-foreground hover:text-success hover:bg-success/10">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(despesa)} title="Excluir" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter className="bg-muted/50">
                  <TableRow>
                    <TableCell colSpan={2} className="font-medium text-right text-muted-foreground">
                      Total das despesas:
                    </TableCell>
                    <TableCell className="font-bold text-destructive text-lg">
                      {formatCurrency(totalDespesasFiltradas)}
                    </TableCell>
                    <TableCell colSpan={4} />
                  </TableRow>
                </TableFooter>
                </Table>
              </div>
              
              {renderPagination()}
            </>
          )}
        </CardContent>
        </Collapsible>
      </Card>

      <DespesaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />

      <Dialog open={showParcelasModal} onOpenChange={setShowParcelasModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Parcelas</DialogTitle>
          </DialogHeader>
          {selectedDespesaParcelasId && (
            <ParcelasManager 
              despesaId={selectedDespesaParcelasId} 
              onClose={() => setShowParcelasModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDespesaToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Despesa"
        itemName={despesaToDelete?.nome || ''}
        itemType="despesa"
        isLoading={isDeleting}
        warningMessage="Esta despesa será removida permanentemente do sistema."
      />
    </div>
  );
};
