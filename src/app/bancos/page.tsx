'use client';

import React, { useEffect, useState } from 'react';
import { useBancos } from '@/hooks/useBancos';
import { Plus, Edit, Trash2, Building2, Eye } from 'lucide-react';
import BancoModal from '@/components/modals/BancoModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import { Banco, BancoForm } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function BancosContent() {
  const { 
    bancos, 
    loading, 
    currentBanco, 
    setCurrentBanco, 
    fetchBancos, 
    createBanco, 
    updateBanco, 
    deleteBanco 
  } = useBancos();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bancoToDelete, setBancoToDelete] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    fetchBancos();
  }, [fetchBancos]);

  const handleEdit = (banco: Banco) => {
    setCurrentBanco(banco);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (banco: Banco) => {
    setCurrentBanco(banco);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (banco: Banco) => {
    setBancoToDelete({ id: banco._id, nome: banco.nome });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bancoToDelete) return;
    
    try {
      await deleteBanco(bancoToDelete.id);
      setShowDeleteModal(false);
      setBancoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir banco:', error);
    }
  };

  const handleCreate = () => {
    setCurrentBanco(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleSave = async (data: BancoForm) => {
    if (modalType === 'create') {
      await createBanco(data);
    } else if (modalType === 'edit' && currentBanco) {
      await updateBanco(currentBanco._id, data);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bancos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie suas contas bancárias e saldos consolidados
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Banco
        </Button>
      </div>

      {/* Lista de bancos */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : bancos.length === 0 ? (
          <Card className="text-center py-16 border shadow-sm bg-muted/10">
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-muted">
                  <Building2 className="h-12 w-12 text-muted-foreground/30" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nenhum banco encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[300px] mx-auto">
                Organize suas finanças adicionando sua primeira conta bancária agora mesmo.
              </p>
              <div className="mt-8">
                <Button onClick={handleCreate} variant="outline" className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Banco
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bancos.map((banco: Banco) => (
              <Card key={banco._id} className="group border shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shadow-sm">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base font-bold text-foreground leading-none">
                          {banco.nome}
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-semibold">
                          {banco.tipo}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold border-transparent",
                        banco.ativo 
                          ? "bg-success/10 text-success hover:bg-success/20" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {banco.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {/* Saldo */}
                  <div className="mb-6 bg-muted/30 p-4 rounded-xl border border-border/50 group-hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-foreground tracking-tight">
                      {formatCurrency(banco.saldoAtual)}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary/50" />
                      Saldo atual disponível
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="space-y-2 mb-6 px-1">
                    {banco.agencia && (
                      <div className="text-xs text-muted-foreground flex justify-between items-center">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Agência</span> 
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{banco.agencia}</span>
                      </div>
                    )}
                    {banco.conta && (
                      <div className="text-xs text-muted-foreground flex justify-between items-center">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Conta</span> 
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{banco.conta}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-end space-x-1 pt-4 border-t border-border/50">
                    <Button variant="ghost" size="icon" onClick={() => handleView(banco)} title="Visualizar" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banco)} title="Editar" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banco)} title="Excluir" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resumo consolidado */}
      {bancos.length > 0 && (
        <Card className="border shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b bg-muted/10">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Resumo Consolidado</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <div className="text-2xl font-bold text-primary tracking-tight">
                  {formatCurrency(bancos.reduce((total, banco) => total + (banco.saldoAtual || 0), 0))}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Patrimônio Total
                </div>
              </div>
              
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <div className="text-2xl font-bold text-success tracking-tight">
                  {bancos.filter((banco) => banco.ativo).length}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Contas Ativas
                </div>
              </div>
              
              <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                <div className="text-2xl font-bold text-foreground tracking-tight">
                  {bancos.length}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                  Total de Contas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Banco */}
      <BancoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
        initialData={currentBanco}
        onSave={handleSave}
        isLoading={loading}
      />

      {/* Modal de Confirmação de Exclusão */}
      {bancoToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setBancoToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Banco"
          itemName={bancoToDelete.nome}
          itemType="banco"
          isLoading={loading}
          warningMessage="Todas as receitas e despesas vinculadas a este banco permanecerão no sistema."
        />
      )}
    </div>
  );
}

export default function BancosPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <BancosContent />
      </AppLayout>
    </AuthGuard>
  );
}
