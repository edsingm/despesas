import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: 'receita' | 'despesa' | 'categoria' | 'banco' | 'cartão';
  isLoading?: boolean;
  warningMessage?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  isLoading = false,
  warningMessage
}) => {
  const getTypeLabel = () => {
    const labels = {
      receita: 'receita',
      despesa: 'despesa',
      categoria: 'categoria',
      banco: 'banco',
      cartão: 'cartão'
    };
    return labels[itemType];
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 pt-2">
            <p>
              Você está prestes a excluir {getTypeLabel()}:
            </p>
            
            <div className="bg-muted p-3 rounded-md border font-medium text-foreground">
              {itemName}
            </div>

            {warningMessage && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      {warningMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-destructive text-sm font-medium">
              Esta ação não pode ser desfeita. {getTypeLabel().charAt(0).toUpperCase() + getTypeLabel().slice(1)} será permanentemente excluída.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Sim, Excluir
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteModal;

