
import { useState } from 'react';
import { Plus, Ban } from 'lucide-react';
import { Document, CreateLigneRequest } from '@/models/document';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import documentService from '@/services/documentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CreateLigneDialogProps {
  document: Document;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateLigneDialog = ({ document, isOpen, onOpenChange }: CreateLigneDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [article, setArticle] = useState('');
  const [prix, setPrix] = useState<number>(0);
  
  const queryClient = useQueryClient();

  const resetForm = () => {
    setTitle('');
    setArticle('');
    setPrix(0);
  };

  const handleCreateLigne = async () => {
    if (!title || !article) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const newLigne: CreateLigneRequest = {
        documentId: document.id,
        title,
        article,
        prix
      };

      await documentService.createLigne(newLigne);
      toast.success('Line created successfully');
      resetForm();
      onOpenChange(false);
      
      // Refresh document data
      queryClient.invalidateQueries({queryKey: ['document', document.id]});
      queryClient.invalidateQueries({queryKey: ['documentLignes', document.id]});
    } catch (error) {
      console.error('Failed to create line:', error);
      toast.error('Failed to create line');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-gradient-to-br from-gray-900/95 to-blue-900/90 border-white/10 text-white shadow-xl p-4 sm:p-5 rounded-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center text-lg text-blue-300">
            <Plus className="h-4 w-4 mr-2" /> Add New Line
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm text-blue-200">Title<span className="text-red-400">*</span></Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter line title"
              className="h-9 text-sm bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article" className="text-sm text-blue-200">Article Description<span className="text-red-400">*</span></Label>
            <Textarea 
              id="article" 
              value={article} 
              onChange={(e) => setArticle(e.target.value)} 
              placeholder="Enter article description"
              rows={2}
              className="text-sm bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prix" className="text-sm text-blue-200">Price (€)<span className="text-red-400">*</span></Label>
            <Input 
              id="prix" 
              type="number" 
              value={prix} 
              onChange={(e) => setPrix(Number(e.target.value))} 
              placeholder="0.00"
              min="0"
              step="0.01"
              className="h-9 text-sm bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          >
            <Ban className="h-3.5 w-3.5 mr-1.5" /> Cancel
          </Button>
          <Button 
            onClick={handleCreateLigne} 
            disabled={isSubmitting}
            className={`h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Line
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLigneDialog;
