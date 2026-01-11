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
import { Palette, Tag } from 'lucide-react';
import { renderCategoryIcon, availableIcons, getIconLabel } from '@/lib/categoryIcons';
import { cn } from "@/lib/utils";
import { Categoria, CategoriaForm } from '@/types';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Categoria | null;
  onSave?: (data: CategoriaForm) => Promise<void>;
  isLoading?: boolean;
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  initialData,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CategoriaForm>({
    nome: '',
    tipo: 'despesa',
    cor: '#ef4444',
    icone: 'tag',
    ativa: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cores predefinidas para categorias
  const coresPredefinidas = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#6b7280', // gray-500
    '#84cc16', // lime-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
  ];


  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        nome: initialData.nome || '',
        tipo: initialData.tipo || 'despesa',
        cor: initialData.cor || '#ef4444',
        icone: initialData.icone || 'tag',
        ativa: initialData.ativa !== undefined ? initialData.ativa : true,
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        tipo: 'despesa',
        cor: '#ef4444',
        icone: 'tag',
        ativa: true,
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && onSave) {
      await onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, ativa: checked }));
  };

  const handleCorChange = (cor: string) => {
    setFormData(prev => ({ ...prev, cor }));
    if (errors.cor) {
      setErrors(prev => ({ ...prev, cor: '' }));
    }
  };

  const handleIconeChange = (icone: string) => {
    setFormData(prev => ({ ...prev, icone }));
    if (errors.icone) {
      setErrors(prev => ({ ...prev, icone: '' }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Categoria';
      case 'edit': return 'Editar Categoria';
      case 'view': return 'Visualizar Categoria';
      default: return 'Categoria';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Personalize suas categorias para organizar melhor suas receitas e despesas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <div className="relative">
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={cn(errors.nome && "border-destructive", "pr-10")}
                placeholder="Ex: Alimentação, Transporte, Salário..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleSelectChange('tipo', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={cn(errors.tipo && "border-destructive")}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo}</p>
            )}
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor *</Label>
            <div className="p-4 border border-border/60 rounded-lg space-y-4 bg-muted/10">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Selecione uma cor:</span>
              </div>
              
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {coresPredefinidas.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => !isReadOnly && handleCorChange(cor)}
                    disabled={isReadOnly}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
                      formData.cor === cor ? "border-foreground scale-110" : "border-transparent",
                      isReadOnly && "cursor-not-allowed opacity-50"
                    )}
                    style={{ backgroundColor: cor }}
                    title={cor}
                  />
                ))}
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => handleCorChange(e.target.value)}
                    className="w-12 h-8 p-1 cursor-pointer"
                    title="Escolher cor personalizada"
                  />
                  <span className="text-xs text-muted-foreground">Cor personalizada</span>
                </div>
              )}
            </div>
            {errors.cor && (
              <p className="text-sm text-destructive">{errors.cor}</p>
            )}
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label>Ícone *</Label>
            <div className="p-4 border border-border/60 rounded-lg space-y-4 bg-muted/10">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto pr-2">
                {availableIcons.map((icone) => (
                  <button
                    key={icone.nome}
                    type="button"
                    onClick={() => !isReadOnly && handleIconeChange(icone.nome)}
                    disabled={isReadOnly}
                    className={cn(
                      "p-2 border rounded-md transition-all flex items-center justify-center hover:bg-muted",
                      formData.icone === icone.nome 
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2" 
                        : "border-input text-muted-foreground",
                      isReadOnly && "cursor-not-allowed opacity-50"
                    )}
                    title={icone.label}
                  >
                    {renderCategoryIcon(icone.nome, 'w-5 h-5')}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
                <span className="text-sm text-muted-foreground">Ícone selecionado:</span>
                <div className="flex items-center gap-2 font-medium">
                  {renderCategoryIcon(formData.icone, 'w-4 h-4')}
                  <span className="text-sm">{getIconLabel(formData.icone)}</span>
                </div>
              </div>
            </div>
            {errors.icone && (
              <p className="text-sm text-destructive">{errors.icone}</p>
            )}
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2 bg-muted/20 p-3 rounded-lg border border-border/50">
            <Checkbox
              id="ativa"
              checked={formData.ativa}
              onCheckedChange={handleCheckboxChange}
              disabled={isReadOnly}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="ativa" className="text-sm font-medium cursor-pointer">
                Categoria ativa
              </Label>
              <p className="text-xs text-muted-foreground">
                Categorias inativas não podem ser usadas em novas transações.
              </p>
            </div>
          </div>

          {/* Preview da Categoria */}
          <div className="pt-4 border-t border-border/50">
            <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pré-visualização</Label>
            <div className="flex items-center space-x-4 p-4 border rounded-xl bg-muted/30 shadow-sm">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all"
                style={{ backgroundColor: formData.cor }}
              >
                {renderCategoryIcon(formData.icone, 'w-6 h-6')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {formData.nome || 'Nome da categoria'}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                    formData.tipo === 'receita' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {formData.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                  {!formData.ativa && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground font-bold uppercase tracking-tighter border">Inativa</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Categoria' : 'Salvar Alterações'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriaModal;