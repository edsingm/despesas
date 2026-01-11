import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from "@/lib/utils";
import { Banco, BancoForm } from '@/types';

interface BancoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Banco | null;
  onSave?: (data: BancoForm) => Promise<void>;
  isLoading?: boolean;
}

const BancoModal: React.FC<BancoModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  initialData, 
  onSave, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<BancoForm>({
    nome: '',
    tipo: 'conta_corrente',
    agencia: '',
    conta: '',
    saldoInicial: 0,
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        nome: initialData.nome || '',
        tipo: initialData.tipo || 'conta_corrente',
        agencia: initialData.agencia || '',
        conta: initialData.conta || '',
        saldoInicial: initialData.saldoInicial || 0,
        ativo: initialData.ativo !== undefined ? initialData.ativo : true,
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        tipo: 'conta_corrente',
        agencia: '',
        conta: '',
        saldoInicial: 0,
        ativo: true,
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.agencia?.trim()) {
      newErrors.agencia = 'Agência é obrigatória';
    }

    if (!formData.conta?.trim()) {
      newErrors.conta = 'Conta é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (onSave) {
      await onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleValueChange = (value: number) => {
    setFormData(prev => ({ ...prev, saldoInicial: value }));
    if (errors.saldoInicial) {
      setErrors(prev => ({ ...prev, saldoInicial: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, ativo: checked }));
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Conta Bancária';
      case 'edit': return 'Editar Conta Bancária';
      case 'view': return 'Visualizar Conta Bancária';
      default: return 'Conta Bancária';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'Detalhes da conta bancária cadastrada.' 
              : 'Preencha os campos abaixo para salvar as informações da conta.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Conta *</Label>
            <div className="relative">
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={cn(errors.nome && "border-destructive focus-visible:ring-destructive", "pr-10")}
                placeholder="Ex: Banco do Brasil - Conta Corrente"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {errors.nome && (
              <p className="text-xs font-medium text-destructive">{errors.nome}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm font-medium">Tipo de Conta *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleSelectChange('tipo', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={cn(errors.tipo && "border-destructive focus-visible:ring-destructive")}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                <SelectItem value="conta_poupanca">Conta Poupança</SelectItem>
                <SelectItem value="conta_investimento">Conta Investimento</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-xs font-medium text-destructive">{errors.tipo}</p>
            )}
          </div>

          {/* Agência e Conta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agencia" className="text-sm font-medium">Agência *</Label>
              <Input
                id="agencia"
                name="agencia"
                value={formData.agencia}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={cn(errors.agencia && "border-destructive focus-visible:ring-destructive")}
                placeholder="Ex: 1234"
              />
              {errors.agencia && (
                <p className="text-xs font-medium text-destructive">{errors.agencia}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta" className="text-sm font-medium">Conta *</Label>
              <Input
                id="conta"
                name="conta"
                value={formData.conta}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={cn(errors.conta && "border-destructive focus-visible:ring-destructive")}
                placeholder="Ex: 12345-6"
              />
              {errors.conta && (
                <p className="text-xs font-medium text-destructive">{errors.conta}</p>
              )}
            </div>
          </div>

          {/* Saldo Inicial */}
          <div className="space-y-2">
            <Label htmlFor="saldoInicial" className="text-sm font-medium">Saldo Inicial</Label>
            <CurrencyInput
              id="saldoInicial"
              name="saldoInicial"
              value={formData.saldoInicial}
              onChange={handleValueChange}
              disabled={isReadOnly}
              placeholder="0,00"
            />
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg border border-border/50">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={handleCheckboxChange}
              disabled={isReadOnly}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="ativo" className="text-sm font-medium cursor-pointer">
                Conta ativa
              </Label>
              <p className="text-xs text-muted-foreground">
                Contas inativas não aparecem na seleção de novas receitas/despesas.
              </p>
            </div>
          </div>

          {/* Informações adicionais no modo visualização */}
          {mode === 'view' && initialData && (
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumo da Conta</h3>
              <div className="space-y-2">
                <div className="text-sm flex justify-between p-2 rounded-md bg-primary/5">
                  <span className="font-medium text-muted-foreground">Saldo atual:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(initialData.saldoAtual || initialData.saldoInicial)}
                  </span>
                </div>
                <div className="text-xs flex justify-between px-2">
                  <span className="text-muted-foreground">Criada em:</span>
                  <span className="text-foreground">
                    {new Date(initialData.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {initialData.updatedAt && (
                  <div className="text-xs flex justify-between px-2">
                    <span className="text-muted-foreground">Última atualização:</span>
                    <span className="text-foreground">
                      {new Date(initialData.updatedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Conta' : 'Salvar Alterações'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BancoModal;