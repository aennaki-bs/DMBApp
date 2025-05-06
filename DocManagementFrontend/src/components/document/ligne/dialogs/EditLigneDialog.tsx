
import { useState, useEffect } from 'react';
import { Edit, CheckCircle2, Ban } from 'lucide-react';
import { Document, Ligne, UpdateLigneRequest } from '@/models/document';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import documentService from '@/services/documentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditLigneDialogProps {
  document: Document;
  ligne: Ligne | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditLigneDialog = ({ document, ligne, isOpen, onOpenChange }: EditLigneDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [article, setArticle] = useState('');
  const [prix, setPrix] = useState<number>(0);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (ligne) {
      setTitle(ligne.title);
      setArticle(ligne.article);
      setPrix(ligne.prix);
    }
  }, [ligne]);

  const resetForm = () => {
    setTitle('');
    setArticle('');
    setPrix(0);
  };

  const handleUpdateLigne = async () => {
    if (!ligne) return;
    
    try {
      setIsSubmitting(true);
      await documentService.updateLigne(ligne.id, {
        title,
        article,
        prix
      });
      toast.success('Line updated successfully');
      resetForm();
      onOpenChange(false);
      
      // Refresh document data
      queryClient.invalidateQueries({queryKey: ['document', document.id]});
      queryClient.invalidateQueries({queryKey: ['documentLignes', document.id]});
    } catch (error) {
      console.error('Failed to update line:', error);
      toast.error('Failed to update line');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900/95 to-blue-900/90 border-white/10 text-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-300">
            <Edit className="h-5 w-5 mr-2" /> Edit Line
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-blue-200">Title<span className="text-red-400">*</span></Label>
            <Input 
              id="edit-title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter line title"
              className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-article" className="text-blue-200">Article Description<span className="text-red-400">*</span></Label>
            <Textarea 
              id="edit-article" 
              value={article} 
              onChange={(e) => setArticle(e.target.value)} 
              placeholder="Enter article description"
              rows={3}
              className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-prix" className="text-blue-200">Price (€)<span className="text-red-400">*</span></Label>
            <Input 
              id="edit-prix" 
              type="number" 
              value={prix} 
              onChange={(e) => setPrix(Number(e.target.value))} 
              placeholder="0.00"
              min="0"
              step="0.01"
              className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          >
            <Ban className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button 
            onClick={handleUpdateLigne} 
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLigneDialog;
