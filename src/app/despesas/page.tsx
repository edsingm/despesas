'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { FiltroDespesa, Categoria, Banco, Cartao, Despesa, DespesaForm } from '@/types';
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
  DialogDescription,
} from "@/components/ui/dialog"

// Hooks Supabase
import { useDespesas } from '@/hooks/useDespesas';
import { useCategorias } from '@/hooks/useCategorias';
import { useBancos } from '@/hooks/useBancos';
import { useCartoes } from '@/hooks/useCartoes';

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
  const searchParams = useSearchParams();
  
  // Hooks Supabase
  const { 
    despesas, 
    loading: isLoadingDespesas, 
    fetchDespesas, 
    createDespesa, 
    updateDespesa, 
    deleteDespesa,
    updateParcela
  } = useDespesas();
  
  const { 
    categorias, 
    fetchCategorias 
  } = useCategorias();
  
  const { 
    bancos, 
    fetchBancos 
  } = useBancos();

  const {
    cartoes,
    fetchCartoes
  } = useCartoes();

  // Estados locais
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
    mes: String(new Date().getMonth() + 1), // Default para mês atual
    ano: String(new Date().getFullYear()),   // Default para ano atual
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [showParcelasModal, setShowParcelasModal] = useState(false);
  const [selectedDespesaParcelasId, setSelectedDespesaParcelasId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Paginação Client-side
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Carregar dados iniciais
  useEffect(() => {
    fetchCategorias({ tipo: 'despesa', ativo: true });
    fetchBancos();
    fetchCartoes();
  }, []);

  // Buscar despesas quando filtros (exceto busca textual) mudam
  useEffect(() => {
    const { mes, ano, bancoId, cartaoId, categoriaId } = filtros;
    
    fetchDespesas({
      mes: mes && mes !== 'all' ? parseInt(mes) : undefined,
      ano: ano && ano !== 'all' ? parseInt(ano) : undefined,
      bancoId: bancoId === 'all' ? undefined : bancoId,
      cartaoId: cartaoId === 'all' ? undefined : cartaoId,
      categoriaId: categoriaId === 'all' ? undefined : categoriaId,
    });
    
    setCurrentPage(1);
  }, [filtros.mes, filtros.ano, filtros.bancoId, filtros.cartaoId, filtros.categoriaId]);

  // Ação via URL (create)
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      handleCreate();
    }
  }, [searchParams]);

  // Filtragem local (busca textual, forma de pagamento, recorrência)
  const filteredDespesas = useMemo(() => {
    return despesas.filter(despesa => {
      // Busca textual
      if (filtros.busca && !despesa.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) {
        return false;
      }
      
      // Forma de pagamento
      if (filtros.formaPagamento && filtros.formaPagamento !== undefined && despesa.formaPagamento !== filtros.formaPagamento) {
        return false;
      }
      
      // Recorrência
      if (filtros.recorrente !== undefined && despesa.recorrente !== filtros.recorrente) {
        return false;
      }
      
      return true;
    });
  }, [despesas, filtros.busca, filtros.formaPagamento, filtros.recorrente]);

  // Paginação dos dados filtrados
  const totalItems = filteredDespesas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDespesas = filteredDespesas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalFiltrado = filteredDespesas.reduce((acc, curr) => acc + curr.valorTotal, 0);

  const handleSearch = () => {
    // A busca textual já é reativa via useMemo, mas mantemos a função para o botão "Buscar"
    // ou se quisermos implementar debounce no input
  };

  const handleClearFilters = () => {
    setFiltros({
      busca: '',
      categoriaId: undefined,
      bancoId: undefined,
      cartaoId: undefined,
      formaPagamento: undefined,
      recorrente: undefined,
      mes: String(new Date().getMonth() + 1),
      ano: String(new Date().getFullYear()),
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
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
      await deleteDespesa(despesaToDelete.id);
      setShowDeleteModal(false);
      setDespesaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    setSelectedDespesa(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleSaveDespesa = async (data: DespesaForm) => {
    if (modalType === 'create') {
      await createDespesa(data);
    } else if (modalType === 'edit' && selectedDespesa) {
      await updateDespesa(selectedDespesa._id, data);
    }
    setShowModal(false);
  };

  const handleManageParcelas = (despesa: Despesa) => {
    setSelectedDespesaParcelasId(despesa._id);
    setShowParcelasModal(true);
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

  const selectedDespesaParcelas = useMemo(() => {
    return despesas.find(d => d._id === selectedDespesaParcelasId);
  }, [despesas, selectedDespesaParcelasId]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

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
              onClick={() => handlePageChange(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {[2023, 2024, 2025, 2026, 2027, 2028].map((ano) => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
        </Collapsible>
      </Card>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingDespesas ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : paginatedDespesas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <NoData 
                    title="Nenhuma despesa encontrada" 
                    description="Tente ajustar os filtros ou adicione uma nova despesa."
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedDespesas.map((despesa) => (
                <TableRow key={despesa._id}>
                  <TableCell>{formatDate(despesa.data)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{despesa.descricao}</div>
                    {despesa.parcelado && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Parcelado: {despesa.numeroParcelas}x
                      </Badge>
                    )}
                    {despesa.recorrente && (
                      <Badge variant="secondary" className="mt-1 ml-1 text-xs">
                        Recorrente: {despesa.tipoRecorrencia}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {typeof despesa.categoriaId !== 'string' && despesa.categoriaId && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: despesa.categoriaId.cor || '#ef4444' }}
                        >
                          {renderCategoryIcon(despesa.categoriaId.icone, "h-3 w-3")}
                        </div>
                        <span>{despesa.categoriaId.nome}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {despesa.formaPagamento === 'credito' ? (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {typeof despesa.cartaoId !== 'string' && despesa.cartaoId 
                            ? despesa.cartaoId.nome 
                            : 'Cartão de Crédito'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {typeof despesa.bancoId !== 'string' && despesa.bancoId 
                            ? despesa.bancoId.nome 
                            : getFormaPagamentoLabel(despesa.formaPagamento)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-destructive">
                    {formatCurrency(despesa.valorTotal)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = getStatusPagamento(despesa);
                      return (
                        <Badge variant={status.variant} className={status.className}>
                          {status.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {despesa.parcelado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleManageParcelas(despesa)}
                          title="Gerenciar Parcelas"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(despesa)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(despesa)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(despesa)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-bold">Total</TableCell>
              <TableCell className="font-bold text-destructive">
                {formatCurrency(totalFiltrado)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {renderPagination()}

      <DespesaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
        initialData={selectedDespesa}
        onSave={handleSaveDespesa}
        isLoading={isLoadingDespesas}
        categorias={categorias}
        bancos={bancos}
        cartoes={cartoes}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Despesa"
        itemName={despesaToDelete?.nome || ''}
        itemType="despesa"
        isLoading={isDeleting}
      />

      <Dialog open={showParcelasModal} onOpenChange={setShowParcelasModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Parcelas</DialogTitle>
            <DialogDescription>
              Visualize e marque as parcelas desta despesa como pagas ou pendentes.
            </DialogDescription>
          </DialogHeader>
          {selectedDespesaParcelas && (
            <ParcelasManager 
              despesa={selectedDespesaParcelas}
              onUpdateParcela={updateParcela}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
