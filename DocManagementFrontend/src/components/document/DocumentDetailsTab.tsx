
import { FileText, Calendar, User, Clock } from 'lucide-react';
import { Document } from '@/models/document';
import { Separator } from '@/components/ui/separator';
import { getStatusClass } from './DocumentStatusUtils';

interface DocumentDetailsTabProps {
  document: Document;
}

const DocumentDetailsTab = ({ document }: DocumentDetailsTabProps) => {
  return (
    <div className={`overflow-hidden border-l-4 bg-gradient-to-br ${getStatusClass(document.status)} shadow-xl rounded-lg`}>
      <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/20 border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-300" />
            Document Details
          </h2>
          <p className="text-sm text-blue-300/80 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="p-6 text-blue-100">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Document Type</h3>
            <p className="font-medium">{document.documentType.typeName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Document Date</h3>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-400" />
              {new Date(document.docDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Created By</h3>
            <p className="font-medium flex items-center gap-1">
              <User className="h-4 w-4 text-blue-400" />
              {document.createdBy.firstName} {document.createdBy.lastName}
            </p>
            <p className="text-sm text-blue-300/70">({document.createdBy.username})</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Created At</h3>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-400" />
              {new Date(document.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <Separator className="my-6 bg-blue-400/20" />
        
        <div>
          <h3 className="text-sm font-medium text-blue-300 mb-3">Content</h3>
          <div className="p-4 bg-blue-950/40 rounded-md min-h-[200px] whitespace-pre-wrap border border-blue-400/20">
            {document.content || "No content available."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsTab;
