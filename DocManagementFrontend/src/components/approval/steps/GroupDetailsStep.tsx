import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, MessageSquare } from "lucide-react";

interface GroupDetailsStepProps {
  name: string;
  comment?: string;
  onNameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
}

export function GroupDetailsStep({
  name,
  comment,
  onNameChange,
  onCommentChange,
}: GroupDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Group Details</h3>
        <p className="text-sm text-muted-foreground">
          Enter information about the approval group
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium flex items-center gap-2"
          >
            <FileText className="h-4 w-4 text-blue-500" />
            Group Name*
          </Label>
          <Input
            id="name"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground">
            Choose a descriptive name for the approval group
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="comment"
            className="text-sm font-medium flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Description (Optional)
          </Label>
          <Textarea
            id="comment"
            placeholder="Add additional details about this group"
            value={comment || ""}
            onChange={(e) => onCommentChange(e.target.value)}
            className="min-h-[120px] w-full"
          />
          <p className="text-xs text-muted-foreground">
            Provide any additional information about the purpose of this group
          </p>
        </div>
      </div>
    </div>
  );
}
