import { useState, useEffect } from 'react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { X, Tag } from 'lucide-react';
import { renderCategoryIcon } from '@/lib/categoryIcons';
import { getLocalDateString, toLocalDateString } from '@/lib/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Receita, ReceitaForm, Categoria, Banco } from '@/types';

interface ReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Receita | null;
  onSave?: (data: ReceitaForm) => Promise<void>;
  isLoading?: boolean;
  categorias: Categoria[];
  bancos: Banco[];
}

const ReceitaModal: React.FC<ReceitaModalProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  initialData,
  onSave,
  isLoading = false,
  categorias,
  bancos
}) => {
  const [formData, setFormData] = useState<ReceitaForm>({
    descricao: '',
    valor: 0,
    data: getLocalDateString(),
    categoriaId: '',
    bancoId: '',
    recorrente: false,
    observacoes: '',
  });

  const [comprovante, setComprovante] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        descricao: initialData.descricao || '',
        valor: initialData.valor || 0,
        data: initialData.data ? toLocalDateString(initialData.data) : getLocalDateString(),
        categoriaId: typeof initialData.categoriaId === 'string' ? initialData.categoriaId : initialData.categoriaId?._id || '',
        bancoId: typeof initialData.bancoId === 'string' ? initialData.bancoId : initialData.bancoId?._id || '',
        recorrente: initialData.recorrente || false,
        observacoes: initialData.observacoes || '',
      });
    } else if (mode === 'create') {
      setFormData({
        descricao: '',
        valor: 0,
        data: getLocalDateString(),
        categoriaId: '',
        bancoId: '',
        recorrente: false,
        observacoes: '',
      });
      setComprovante(null);
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (formData.valor > 999999999) {
      newErrors.valor = 'Valor muito alto';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Categoria é obrigatória';
    }

    if (!formData.bancoId) {
      newErrors.bancoId = 'Banco é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && onSave) {
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        // Error handling is done in parent component or hook
      }
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setFormData(prev => ({ ...prev, recorrente: checked }));
  };

  const handleValueChange = (value: number) => {
    setFormData(prev => ({ ...prev, valor: value }));
    if (errors.valor) {
      setErrors(prev => ({ ...prev, valor: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprovante(file);
    }
  };

  const removeFile = () => {
    setComprovante(null);
    const fileInput = document.getElementById('comprovante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const isReadOnly = mode === 'view';

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Receita';
      case 'edit': return 'Editar Receita';
      case 'view': return 'Visualizar Receita';
      default: return 'Receita';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'Visualize os detalhes desta entrada financeira.' 
              : 'Registre suas entradas para manter seu saldo atualizado.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <div className="relative">
              <Input
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                className={cn(errors.descricao && "border-destructive focus-visible:ring-destructive", "pr-10")}
                placeholder="Ex: Salário, Freelance, Venda..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {errors.descricao && (
              <p className="text-xs font-medium text-destructive">{errors.descricao}</p>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-medium">Valor *</Label>
              <CurrencyInput
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleValueChange}
                readOnly={isReadOnly}
                error={!!errors.valor}
                placeholder="0,00"
              />
              {errors.valor && (
                <p className="text-xs font-medium text-destructive">{errors.valor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data" className="text-sm font-medium">Data *</Label>
              <Input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                className={cn(errors.data && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.data && (
                <p className="text-xs font-medium text-destructive">{errors.data}</p>
              )}
            </div>
          </div>

          {/* Categoria e Banco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoriaId" className="text-sm font-medium">Categoria *</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => handleSelectChange('categoriaId', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger className={cn(errors.categoriaId && "border-destructive focus-visible:ring-destructive")}>
                  <SelectValue placeholder="Selecione uma categoria">
                    {formData.categoriaId && categorias.find(c => c._id === formData.categoriaId) && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: categorias.find(c => c._id === formData.categoriaId)?.cor || '#22c55e' }}
                        >
                          {renderCategoryIcon(categorias.find(c => c._id === formData.categoriaId)?.icone || 'tag', "h-3 w-3")}
                        </div>
                        <span>{categorias.find(c => c._id === formData.categoriaId)?.nome}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categorias.filter(cat => cat.ativa).map((categoria) => (
                    <SelectItem key={categoria._id} value={categoria._id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: categoria.cor || '#22c55e' }}
                        >
                          {renderCategoryIcon(categoria.icone || 'tag', "h-3 w-3")}
                        </div>
                        <span>{categoria.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoriaId && (
                <p className="text-xs font-medium text-destructive">{errors.categoriaId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bancoId" className="text-sm font-medium">Banco *</Label>
              <Select
                value={formData.bancoId}
                onValueChange={(value) => handleSelectChange('bancoId', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger className={cn(errors.bancoId && "border-destructive focus-visible:ring-destructive")}>
                  <SelectValue placeholder="Selecione um banco" />
                </SelectTrigger>
                <SelectContent>
                  {bancos.filter(banco => banco.ativo).map((banco) => (
                    <SelectItem key={banco._id} value={banco._id}>
                      {banco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bancoId && (
                <p className="text-xs font-medium text-destructive">{errors.bancoId}</p>
              )}
            </div>
          </div>

          {/* Recorrência */}
          {!isReadOnly && (
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg border border-border/50">
              <Checkbox 
                id="recorrente" 
                checked={formData.recorrente}
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="recorrente" className="text-sm font-medium cursor-pointer">
                  Esta é uma receita recorrente
                </Label>
                <p className="text-xs text-muted-foreground">
                  A receita será repetida mensalmente de forma automática.
                </p>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              placeholder="Alguma informação adicional sobre esta receita..."
              className="resize-none min-h-[80px]"
            />
          </div>

          {/* Comprovante */}
          <div className="space-y-2">
            <Label htmlFor="comprovante" className="text-sm font-medium">Comprovante</Label>
            {isReadOnly ? (
              initialData?.comprovante ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => window.open(initialData.comprovante, '_blank')}
                >
                  Visualizar Comprovante
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhum comprovante anexado.</p>
              )
            ) : (
              <div className="space-y-3">
                <Input
                  type="file"
                  id="comprovante"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="cursor-pointer"
                />
                {comprovante && (
                  <div className="flex items-center justify-between p-2 bg-success/10 rounded-md border border-success/20">
                    <span className="text-xs font-medium text-success truncate max-w-[200px]">
                      {comprovante.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-6 w-6 p-0 text-success hover:bg-success/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  mode === 'create' ? 'Criar Receita' : 'Salvar Alterações'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReceitaModal;
