import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';

interface DocumentStatusBadgeProps {
  status: number;
  erpDocumentCode?: string | null;
}

const DocumentStatusBadge = ({ status, erpDocumentCode }: DocumentStatusBadgeProps) => {
  const location = useLocation();
  
  // Check if we're coming from completed documents context
  const searchParams = new URLSearchParams(location.search);
  const fromCompleted = searchParams.get('from') === 'completed' || 
                       sessionStorage.getItem('documentContext') === 'completed';
  
  switch(status) {
    case 0:
      return <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border-amber-500/30">Draft</Badge>;
    case 1:
      return <Badge className="bg-green-500/20 text-green-200 hover:bg-green-500/30 border-green-500/30">InProgress</Badge>;
    case 2:
      // For status 2, check if document is truly archived (has ERP code) or just completed
      if (erpDocumentCode) {
        return <Badge className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border-purple-500/30">Archived</Badge>;
      } else if (fromCompleted) {
        return <Badge className="bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 border-orange-500/30">Completed</Badge>;
      } else {
        // Default to completed for status 2 without ERP code
        return <Badge className="bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 border-orange-500/30">Completed</Badge>;
      }
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default DocumentStatusBadge;
