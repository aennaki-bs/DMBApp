
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContentStepProps {
  content: string;
  onContentChange: (value: string) => void;
  contentError?: string;
}

export const ContentStep = ({ content, onContentChange, contentError }: ContentStepProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="content" className="text-sm font-medium text-gray-200">Document Content*</Label>
      <Textarea 
        id="content" 
        value={content} 
        onChange={e => onContentChange(e.target.value)}
        placeholder="Enter document content"
        rows={8}
        className={`text-base resize-y bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 ${contentError ? 'border-red-500' : ''}`}
      />
      {contentError && (
        <p className="text-sm text-red-500">{contentError}</p>
      )}
    </div>
  );
};
