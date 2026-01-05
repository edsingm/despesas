import { useState, useEffect } from 'react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { CreditCard, X, Tag } from 'lucide-react';
import { renderCategoryIcon } from '@/lib/categoryIcons';
import { getLocalDateString, toLocalDateString } from '@/lib/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
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
import { Despesa, DespesaForm, Categoria, Banco, Cartao } from '@/types';

interface DespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Despesa | null;
  onSave?: (data: DespesaForm) => Promise<void>;
  isLoading?: boolean;
  categorias: Categoria[];
  bancos: Banco[];
  cartoes: Cartao[];
}

const DespesaModal: React.FC<DespesaModalProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  initialData,
  onSave,
  isLoading = false,
  categorias,
  bancos,
  cartoes
}) => {
  const [formData, setFormData] = useState<{
    descricao: string;
    valorTotal: number;
    data: string;
    categoriaId: string;
    bancoId: string;
    cartaoId: string;
    formaPagamento: 'debito' | 'credito' | 'dinheiro';
    parcelado: boolean;
    numeroParcelas: number | string;
    recorrente: boolean;
    tipoRecorrencia: 'mensal' | 'anual';
    observacoes: string;
  }>({
    descricao: '',
    valorTotal: 0,
    data: getLocalDateString(),
    categoriaId: '',
    bancoId: '',
    cartaoId: '',
    formaPagamento: 'debito',
    parcelado: false,
    numeroParcelas: 1,
    recorrente: false,
    tipoRecorrencia: 'mensal',
    observacoes: '',
  });

  const [comprovante, setComprovante] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        descricao: initialData.descricao || '',
        valorTotal: initialData.valorTotal || 0,
        data: initialData.data ? toLocalDateString(initialData.data) : getLocalDateString(),
        categoriaId: typeof initialData.categoriaId === 'string' ? initialData.categoriaId : initialData.categoriaId?._id || '',
        bancoId: typeof initialData.bancoId === 'string' ? initialData.bancoId || '' : initialData.bancoId?._id || '',
        cartaoId: typeof initialData.cartaoId === 'string' ? initialData.cartaoId || '' : initialData.cartaoId?._id || '',
        formaPagamento: (['debito', 'credito', 'dinheiro'].includes(initialData.formaPagamento)) ? initialData.formaPagamento as 'debito' | 'credito' | 'dinheiro' : 'debito',
        parcelado: initialData.parcelado || false,
        numeroParcelas: initialData.numeroParcelas || 1,
        recorrente: initialData.recorrente || false,
        tipoRecorrencia: (['mensal', 'anual'].includes(initialData.tipoRecorrencia || '')) ? initialData.tipoRecorrencia as 'mensal' | 'anual' : 'mensal',
        observacoes: initialData.observacoes || '',
      });
    } else if (mode === 'create') {
      setFormData({
        descricao: '',
        valorTotal: 0,
        data: getLocalDateString(),
        categoriaId: '',
        bancoId: '',
        cartaoId: '',
        formaPagamento: 'debito',
        parcelado: false,
        numeroParcelas: 1,
        recorrente: false,
        tipoRecorrencia: 'mensal',
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

    if (!formData.valorTotal || formData.valorTotal <= 0) {
      newErrors.valorTotal = 'Valor deve ser maior que zero';
    }

    if (formData.valorTotal > 999999999) {
      newErrors.valorTotal = 'Valor muito alto';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Categoria é obrigatória';
    }

    if (formData.formaPagamento === 'credito' && !formData.cartaoId) {
      newErrors.cartaoId = 'Cartão é obrigatório para pagamento no crédito';
    }

    if (formData.formaPagamento !== 'credito' && !formData.bancoId) {
      newErrors.bancoId = 'Banco é obrigatório para este tipo de pagamento';
    }

    const numParcelas = typeof formData.numeroParcelas === 'string' ? parseInt(formData.numeroParcelas) : formData.numeroParcelas;
    
    if (formData.parcelado && (isNaN(numParcelas) || numParcelas < 2)) {
      newErrors.numeroParcelas = 'Número de parcelas deve ser pelo menos 2';
    }

    if (formData.parcelado && numParcelas > 60) {
      newErrors.numeroParcelas = 'Número de parcelas deve ser no máximo 60';
    }

    if (formData.parcelado && formData.recorrente) {
      newErrors.parcelado = 'Despesa não pode ser parcelada e recorrente ao mesmo tempo';
      newErrors.recorrente = 'Despesa não pode ser recorrente e parcelada ao mesmo tempo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!onSave) return;

    try {
      // Construct the DespesaForm object
      const submitData: any = { ...formData }; // Using any to manipulate fields easier before casting

      submitData.numeroParcelas = typeof submitData.numeroParcelas === 'string' 
        ? parseInt(submitData.numeroParcelas) || 1 
        : submitData.numeroParcelas;
      
      if (formData.formaPagamento === 'credito') {
        if (!submitData.bancoId) delete submitData.bancoId;
      } else {
        if (!submitData.cartaoId) delete submitData.cartaoId;
      }

      if (comprovante) {
        submitData.comprovante = comprovante;
      }

      await onSave(submitData as DespesaForm);
      // Success toast is handled by parent/hook
    } catch (error: any) {
      // Error toast is handled by parent/hook
      console.error('Erro ao salvar despesa:', error);
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

    if (name === 'formaPagamento') {
      if (value === 'credito') {
        setFormData(prev => ({ ...prev, bancoId: '', formaPagamento: 'credito' }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          cartaoId: '', 
          parcelado: false, 
          numeroParcelas: 1,
          formaPagamento: value as any 
        }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));

    if (name === 'parcelado' && !checked) {
      setFormData(prev => ({ ...prev, numeroParcelas: 1 }));
    }

    if (name === 'parcelado' && checked) {
      setFormData(prev => ({ ...prev, recorrente: false }));
    }

    if (name === 'recorrente' && checked) {
      setFormData(prev => ({ ...prev, parcelado: false, numeroParcelas: 1 }));
    }
  };

  const handleValueChange = (value: number) => {
    setFormData(prev => ({ ...prev, valorTotal: value }));
    if (errors.valorTotal) {
      setErrors(prev => ({ ...prev, valorTotal: '' }));
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

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Despesa';
      case 'edit': return 'Editar Despesa';
      case 'view': return 'Visualizar Despesa';
      default: return 'Despesa';
    }
  };

  const isReadOnly = mode === 'view';
  const isCredito = formData.formaPagamento === 'credito';
  const canParcelar = isCredito;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
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
                placeholder="Ex: Aluguel, Mercado, Luz..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {errors.descricao && (
              <p className="text-xs font-medium text-destructive">{errors.descricao}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Valor e Data */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorTotal" className="text-sm font-medium">Valor Total *</Label>
                  <CurrencyInput
                    id="valorTotal"
                    name="valorTotal"
                    value={formData.valorTotal}
                    onChange={handleValueChange}
                    readOnly={isReadOnly}
                    error={!!errors.valorTotal}
                    placeholder="0,00"
                  />
                  {errors.valorTotal && (
                    <p className="text-xs font-medium text-destructive">{errors.valorTotal}</p>
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

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="formaPagamento" className="text-sm font-medium">Forma de Pagamento *</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value) => handleSelectChange('formaPagamento', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={cn(errors.formaPagamento && "border-destructive focus-visible:ring-destructive")}>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro / Pix</SelectItem>
                  </SelectContent>
                </Select>
                {errors.formaPagamento && (
                  <p className="text-xs font-medium text-destructive">{errors.formaPagamento}</p>
                )}
              </div>

              {/* Banco ou Cartão */}
              {isCredito ? (
                <div className="space-y-2">
                  <Label htmlFor="cartaoId" className="text-sm font-medium">Cartão de Crédito *</Label>
                  <Select
                    value={formData.cartaoId}
                    onValueChange={(value) => handleSelectChange('cartaoId', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={cn(errors.cartaoId && "border-destructive focus-visible:ring-destructive")}>
                      <SelectValue placeholder="Selecione o cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {cartoes.filter(cartao => cartao.ativo).map((cartao) => (
                        <SelectItem key={cartao._id} value={cartao._id}>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                            {cartao.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cartaoId && (
                    <p className="text-xs font-medium text-destructive">{errors.cartaoId}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="bancoId" className="text-sm font-medium">Banco *</Label>
                  <Select
                    value={formData.bancoId}
                    onValueChange={(value) => handleSelectChange('bancoId', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={cn(errors.bancoId && "border-destructive focus-visible:ring-destructive")}>
                      <SelectValue placeholder="Selecione o banco" />
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
              )}

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoriaId" className="text-sm font-medium">Categoria *</Label>
                <Select
                  value={formData.categoriaId}
                  onValueChange={(value) => handleSelectChange('categoriaId', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={cn(errors.categoriaId && "border-destructive focus-visible:ring-destructive")}>
                    <SelectValue placeholder="Selecione a categoria">
                      {formData.categoriaId && categorias.find(c => c._id === formData.categoriaId) && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: categorias.find(c => c._id === formData.categoriaId)?.cor || '#ef4444' }}
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
                            style={{ backgroundColor: categoria.cor || '#ef4444' }}
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
            </div>

            <div className="space-y-6">
              {/* Opções Avançadas */}
              <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/30">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opções Adicionais</h3>
                
                {/* Parcelado */}
                {canParcelar && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="parcelado" 
                        checked={formData.parcelado}
                        onCheckedChange={(checked) => handleCheckboxChange('parcelado', checked as boolean)}
                        disabled={isReadOnly}
                      />
                      <Label htmlFor="parcelado" className="text-sm font-medium cursor-pointer">Despesa Parcelada</Label>
                    </div>
                    
                    {formData.parcelado && (
                      <div className="pl-6 space-y-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <Label htmlFor="numeroParcelas" className="text-xs font-medium">Número de Parcelas</Label>
                        <NumberInput
                          id="numeroParcelas"
                          name="numeroParcelas"
                          value={formData.numeroParcelas}
                          onValueChange={(val) => {
                            setFormData(prev => ({ ...prev, numeroParcelas: val === undefined ? '' : val }));
                          }}
                          readOnly={isReadOnly}
                          min={2}
                          max={60}
                        />
                        {errors.numeroParcelas && (
                          <p className="text-xs font-medium text-destructive">{errors.numeroParcelas}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Recorrente */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recorrente" 
                      checked={formData.recorrente}
                      onCheckedChange={(checked) => handleCheckboxChange('recorrente', checked as boolean)}
                      disabled={isReadOnly || (formData.parcelado && canParcelar)}
                    />
                    <Label htmlFor="recorrente" className="text-sm font-medium cursor-pointer">Despesa Recorrente (Fixa)</Label>
                  </div>

                  {formData.recorrente && (
                    <div className="pl-6 space-y-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      <Label htmlFor="tipoRecorrencia" className="text-xs font-medium">Frequência</Label>
                      <Select
                        value={formData.tipoRecorrencia}
                        onValueChange={(value) => handleSelectChange('tipoRecorrencia', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  placeholder="Detalhes adicionais..."
                  className="resize-none min-h-[80px]"
                />
              </div>
              
              {/* Comprovante - Visual apenas */}
              {!isReadOnly && (
                <div className="space-y-2">
                  <Label htmlFor="comprovante" className="text-sm font-medium">Comprovante</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="comprovante"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      accept="image/*,.pdf"
                    />
                    {comprovante && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DespesaModal;
