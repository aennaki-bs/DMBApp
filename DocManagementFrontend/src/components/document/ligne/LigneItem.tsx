
import { useState } from 'react';
import { 
  Edit, Trash2, ChevronDown, ChevronUp, DollarSign,
  FileText, Clock, Tag
} from 'lucide-react';
import { Ligne, Document } from '@/models/document';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import SousLignesList from '../SousLignesList';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface LigneItemProps {
  ligne: Ligne;
  expandedLigneId: number | null;
  toggleLigneExpansion: (ligneId: number) => void;
  document: Document;
  canManageDocuments: boolean;
  onEdit: (ligne: Ligne) => void;
  onDelete: (ligne: Ligne) => void;
}

const LigneItem = ({ 
  ligne, 
  expandedLigneId, 
  toggleLigneExpansion, 
  document, 
  canManageDocuments,
  onEdit,
  onDelete
}: LigneItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = expandedLigneId === ligne.id;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative overflow-hidden rounded-lg border transition-all duration-200
        ${isExpanded 
          ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30' 
          : 'bg-gradient-to-br from-gray-900/40 to-blue-900/20 border-white/5 hover:border-blue-500/20'
        }
      `}>
        <div 
          onClick={() => toggleLigneExpansion(ligne.id)}
          className="cursor-pointer p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {ligne.title}
                </h3>
                <Badge variant="outline" className="bg-blue-900/30 border-blue-500/30 text-blue-300 font-mono">
                  {ligne.ligneKey}
                </Badge>
              </div>
              
              <p className="text-sm text-blue-200/80 line-clamp-2 mb-3">
                {ligne.article}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-blue-300/60">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {format(new Date(ligne.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center text-blue-300/60">
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {/* Use a property that actually exists or a fallback */}
                  {ligne.article.substring(0, 15) + '...'}
                </div>
                <div className="flex items-center text-blue-300/60">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  {/* Use a property that actually exists or a fallback */}
                  {ligne.sousLignesCount || 0} items
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-green-900/20 border border-green-500/20">
                <div className="flex items-center text-green-400 font-medium">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {ligne.prix.toFixed(2)}
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered || isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1"
              >
                {canManageDocuments && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(ligne);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ligne);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <div className={`
                  flex items-center justify-center h-8 w-8 rounded-md transition-colors duration-200
                  ${isExpanded ? 'bg-blue-900/40 text-blue-300' : 'text-blue-400'}
                `}>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Separator className="bg-blue-500/20" />
              <div className="p-4 bg-gradient-to-br from-blue-950/50 to-indigo-950/40">
                <SousLignesList 
                  document={document}
                  ligne={ligne}
                  canManageDocuments={canManageDocuments}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LigneItem;
