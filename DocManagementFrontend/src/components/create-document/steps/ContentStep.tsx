import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface ContentStepProps {
  content: string;
  onContentChange: (value: string) => void;
  contentError?: string;
}

export const ContentStep = ({
  content,
  onContentChange,
  contentError,
}: ContentStepProps) => {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <Label
        htmlFor="content"
        className="text-sm font-medium text-gray-200 flex items-center gap-2"
      >
        <FileText className="h-4 w-4 text-blue-400" />
        Document Content*
      </Label>

      <textarea
        id="content"
        value={content}
        onChange={handleContentChange}
        placeholder="Enter document content"
        rows={10}
        className={`w-full text-base resize-y bg-gray-900 border ${
          contentError ? "border-red-500" : "border-gray-800"
        } text-white placeholder:text-gray-500 p-3 rounded-md`}
      />

      {contentError && <p className="text-sm text-red-500">{contentError}</p>}

      <p className="text-xs text-gray-400">
        Enter the content for your document. This will be used as the main body
        text.
      </p>
    </div>
  );
};
