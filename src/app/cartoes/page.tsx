'use client';

import React, { useEffect, useState } from 'react';
import { useCartoes } from '@/hooks/useCartoes';
import { Plus, Edit, Trash2, CreditCard, Eye, Calendar, AlertTriangle } from 'lucide-react';
import CartaoModal from '@/components/modals/CartaoModal';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import { Cartao, CartaoForm } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function CartoesContent() {
  const { 
    cartoes, 
    loading, 
    currentCartao, 
    setCurrentCartao, 
    fetchCartoes, 
    createCartao, 
    updateCartao, 
    deleteCartao 
  } = useCartoes();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cartaoToDelete, setCartaoToDelete] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    fetchCartoes();
  }, [fetchCartoes]);

  const handleEdit = (cartao: Cartao) => {
    setCurrentCartao(cartao);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (cartao: Cartao) => {
    setCurrentCartao(cartao);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (cartao: Cartao) => {
    setCartaoToDelete({ id: cartao._id, nome: cartao.nome });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!cartaoToDelete) return;

    await deleteCartao(cartaoToDelete.id);
    setShowDeleteModal(false);
    setCartaoToDelete(null);
  };

  const handleCreate = () => {
    setCurrentCartao(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleSave = async (data: CartaoForm) => {
    if (modalType === 'create') {
      await createCartao(data);
    } else if (modalType === 'edit' && currentCartao) {
      await updateCartao(currentCartao._id, data);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCardColor = (bandeira: string) => {
    if (!bandeira || typeof bandeira !== 'string') {
      return 'from-slate-800 to-slate-950';
    }
    
    const colors: Record<string, string> = {
      'visa': 'from-blue-900 to-slate-900',
      'mastercard': 'from-rose-900 to-slate-900',
      'elo': 'from-amber-700 to-slate-900',
      'american express': 'from-emerald-900 to-slate-900',
      'hipercard': 'from-orange-900 to-slate-900',
    };
    return colors[bandeira.toLowerCase()] || 'from-slate-800 to-slate-950';
  };

  const calcularLimiteDisponivel = (cartao: Cartao) => {
    const faturaAtual = cartao.faturaAtual || 0;
    const limite = cartao.limite || 0;
    return limite - faturaAtual;
  };

  const calcularPercentualUso = (cartao: Cartao) => {
    const faturaAtual = cartao.faturaAtual || 0;
    const limite = cartao.limite || 0;
    if (limite === 0) return 0;
    return (faturaAtual / limite) * 100;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cartões de Crédito</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seus cartões de crédito, faturas e limites disponíveis
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Lista de cartões */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartoes.length === 0 ? (
          <Card className="text-center py-16 border shadow-sm bg-muted/10">
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-muted">
                  <CreditCard className="h-12 w-12 text-muted-foreground/30" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nenhum cartão encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[300px] mx-auto">
                Mantenha o controle de suas faturas adicionando seu primeiro cartão de crédito.
              </p>
              <div className="mt-8">
                <Button onClick={handleCreate} variant="outline" className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cartão
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartoes.map((cartao: Cartao) => {
              const limiteDisponivel = calcularLimiteDisponivel(cartao);
              const percentualUso = calcularPercentualUso(cartao);
              
              return (
                <div key={cartao._id} className="group relative">
                  {/* Visual do Cartão (Estilo cartão de crédito) */}
                  <div className={cn(
                    "bg-gradient-to-br rounded-2xl p-6 text-white shadow-xl mb-4 transition-all group-hover:shadow-2xl group-hover:-translate-y-1 duration-300 relative z-10 overflow-hidden min-h-[180px] flex flex-col justify-between",
                    getCardColor(cartao.bandeira)
                  )}>
                    {/* Glass texture effect */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    
                    <div className="flex justify-between items-start relative z-20">
                      <div>
                        <h3 className="text-base font-bold tracking-wider uppercase drop-shadow-md">{cartao.nome}</h3>
                        <p className="text-[10px] opacity-70 uppercase tracking-[0.2em] font-bold mt-0.5">{cartao.bandeira}</p>
                      </div>
                      {/* Chip simulation */}
                      <div className="w-10 h-8 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-md opacity-90 shadow-lg border border-white/20"></div>
                    </div>

                    <div className="space-y-4 relative z-20">
                      <div>
                        <div className="text-[9px] opacity-60 uppercase tracking-[0.2em] mb-1 font-bold">Limite Total</div>
                        <div className="text-2xl font-mono font-bold tracking-tight drop-shadow-sm">{formatCurrency(cartao.limite || 0)}</div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] opacity-70 font-mono tracking-widest uppercase font-bold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Vencimento: {cartao.diaVencimento}</span>
                        </div>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Fechamento: {cartao.diaFechamento}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes e Ações (Card abaixo) */}
                  <Card className="pt-8 -mt-6 border shadow-sm relative z-0 transition-all group-hover:bg-muted/30 overflow-hidden">
                    <CardContent className="space-y-5 pt-5">
                      <div className="space-y-3 px-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Fatura Atual</span>
                          <span className="text-sm font-bold text-destructive">{formatCurrency(cartao.faturaAtual || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Disponível</span>
                          <span className="text-sm font-bold text-success">{formatCurrency(limiteDisponivel)}</span>
                        </div>
                        
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <span className="flex items-center gap-1.5">
                              {percentualUso > 80 && <AlertTriangle className="h-3 w-3 text-warning" />}
                              Uso do limite
                            </span>
                            <span className={cn(percentualUso > 80 ? "text-warning" : "")}>{percentualUso.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentualUso} className="h-2 bg-muted shadow-inner" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-bold border-transparent",
                            cartao.ativo 
                              ? "bg-success/10 text-success hover:bg-success/20" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {cartao.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => handleView(cartao)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => handleEdit(cartao)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDelete(cartao)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo consolidado */}
      {cartoes.length > 0 && (
        <Card className="border shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b bg-muted/10">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Resumo Consolidado</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Limite Total
                </p>
                <p className="text-2xl font-bold text-primary tracking-tight">
                  {formatCurrency(cartoes.reduce((total, cartao) => total + (cartao.limite || 0), 0))}
                </p>
              </div>
              
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Fatura Total
                </p>
                <p className="text-2xl font-bold text-destructive tracking-tight">
                  {formatCurrency(cartoes.reduce((total, cartao) => total + (cartao.faturaAtual || 0), 0))}
                </p>
              </div>
              
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Disponível Total
                </p>
                <p className="text-2xl font-bold text-success tracking-tight">
                  {formatCurrency(cartoes.reduce((total, cartao: any) => total + calcularLimiteDisponivel(cartao), 0))}
                </p>
              </div>
              
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                  Cartões Ativos
                </p>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {cartoes.filter((cartao) => cartao.ativo).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Cartão */}
      <CartaoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
        initialData={currentCartao}
        onSave={handleSave}
        isLoading={loading}
      />

      {/* Modal de Confirmação de Exclusão */}
       <ConfirmDeleteModal
         isOpen={showDeleteModal}
         onClose={() => setShowDeleteModal(false)}
         onConfirm={confirmDelete}
         title="Excluir Cartão"
         itemName={cartaoToDelete?.nome || ""}
         itemType="cartão"
         warningMessage="Todas as despesas vinculadas a este cartão permanecerão no sistema."
         isLoading={loading}
       />
    </div>
  );
}

export default function CartoesPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <CartoesContent />
      </AppLayout>
    </AuthGuard>
  );
}
