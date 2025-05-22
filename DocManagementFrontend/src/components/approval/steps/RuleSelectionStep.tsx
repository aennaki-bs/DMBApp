import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, UsersRound, UserCheck, ListOrdered } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalRuleType } from "@/models/approval";

interface RuleSelectionStepProps {
  selectedRule: ApprovalRuleType;
  onRuleChange: (value: string) => void;
}

const ruleDefinitions = [
  {
    id: "Any",
    title: "Any Can Approve",
    description: "Any single user in the group can approve the document",
    icon: <UserCheck className="h-5 w-5 text-green-500" />,
  },
  {
    id: "All",
    title: "All Must Approve",
    description:
      "All users in the group must approve for the document to proceed",
    icon: <UsersRound className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "Sequential",
    title: "Sequential Approval",
    description: "Users must approve in a specific order",
    icon: <ListOrdered className="h-5 w-5 text-purple-500" />,
  },
];

export function RuleSelectionStep({
  selectedRule,
  onRuleChange,
}: RuleSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Approval Rules</h3>
        <p className="text-sm text-muted-foreground">
          Select how approvals will be processed for this group
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-500" />
          Approval Method
        </Label>

        <RadioGroup
          value={selectedRule}
          onValueChange={onRuleChange}
          className="space-y-3"
        >
          {ruleDefinitions.map((rule) => (
            <div key={rule.id} className="flex">
              <RadioGroupItem
                value={rule.id}
                id={rule.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={rule.id}
                className="flex flex-1 cursor-pointer items-start space-x-3 rounded-md border border-gray-200 dark:border-gray-800 p-3.5 transition-all hover:bg-muted peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/20"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {rule.icon}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{rule.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">About approval methods</h4>
              <p className="text-xs text-muted-foreground mt-1">
                This setting determines how approvals are processed when a
                document requires approval from this group. Choose the method
                that best fits your workflow requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
