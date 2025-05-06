
import { useState } from 'react';
import PendingDocumentsList from '@/components/circuits/PendingDocumentsList';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Filter, XCircle } from 'lucide-react';

export default function PendingApprovalsPage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const handleSelection = (ids: number[]) => {
    setSelectedItems(ids);
  };
  
  const handleApproveSelected = () => {
    console.log("Approving documents with IDs:", selectedItems);
    setSelectedItems([]);
  };
  
  const handleRejectSelected = () => {
    console.log("Rejecting documents with IDs:", selectedItems);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg p-4 md:p-6 mb-4 md:mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 md:mb-2 text-white flex items-center">
              <Clock className="mr-2 h-6 w-6 text-amber-500" /> Pending Approvals
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Documents waiting for your approval or action
            </p>
          </div>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>
      
      <div className="bg-[#161b22] border border-gray-800 rounded-lg p-4 md:p-6 transition-all">
        <PendingDocumentsList onSelectionChange={handleSelection} />
      </div>
      
      {/* Bottom action bar for bulk actions */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-gray-700 p-4 flex justify-between items-center transition-all duration-300 z-10">
          <div className="text-white">
            <span className="font-medium">{selectedItems.length}</span> documents selected
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleApproveSelected}
              className="bg-green-900/20 text-green-400 hover:bg-green-900/30 hover:text-green-300 border border-green-900/30"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Approve Selected
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSelected}
              className="bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-red-900/30"
            >
              <XCircle className="h-4 w-4 mr-2" /> Reject Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
