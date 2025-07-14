import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { GeneralAccounts } from "@/models/lineElements";

interface GeneralAccountsActionsDropdownProps {
  account: GeneralAccounts;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const GeneralAccountsActionsDropdown: React.FC<GeneralAccountsActionsDropdownProps> = ({
  account,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onView}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        title="View account details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        title="Edit account"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        title="Delete account"
        disabled={account.lignesCount > 0}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default GeneralAccountsActionsDropdown; 