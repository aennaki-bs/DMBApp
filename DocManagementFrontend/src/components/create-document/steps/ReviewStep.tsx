import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";

interface ReviewStepProps {
  selectedType: DocumentType | undefined;
  selectedSubType?: SubType | undefined;
  documentAlias: string;
  title: string;
  docDate: string;
  content: string;
}

export const ReviewStep = ({
  selectedType,
  selectedSubType,
  documentAlias,
  title,
  docDate,
  content
}: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Document Summary</h3>
      
      <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Document Type</p>
            <p className="text-base font-medium text-white">{selectedType?.typeName}</p>
          </div>
          {selectedSubType && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Document Subtype</p>
              <p className="text-base font-medium text-white">{selectedSubType.name}</p>
              <p className="text-xs text-blue-400 mt-1">
                Valid from {new Date(selectedSubType.startDate).toLocaleDateString()} to {new Date(selectedSubType.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {documentAlias && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Document Alias</p>
              <p className="text-base font-medium text-white">{documentAlias}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</p>
            <p className="text-base font-medium text-white">{title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</p>
            <p className="text-base font-medium text-white">{new Date(docDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Content</p>
          <p className="text-base whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-white">{content}</p>
        </div>
      </div>
    </div>
  );
};
