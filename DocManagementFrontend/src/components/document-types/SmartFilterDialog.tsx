import { useState, useEffect } from "react";
import { X, Plus, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SmartFilterConfig, SmartFilterCondition } from "@/hooks/document-types/useDocumentTypeFiltering";
import { v4 as uuidv4 } from 'uuid';

interface SmartFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (config: SmartFilterConfig) => void;
  initialConfig?: SmartFilterConfig;
}

const fieldOptions = [
  { value: "typeName", label: "Type Name" },
  { value: "typeKey", label: "Type Code" },
  { value: "typeAttr", label: "Description" },
  { value: "documentCounter", label: "Document Count" },
  { value: "tierType", label: "Tier Type" },
  { value: "typeNumber", label: "Type Number" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
];

const getOperatorOptions = (fieldType: string) => {
  // Determine field type based on field name
  if (fieldType === "documentCounter" || fieldType === "typeNumber") {
    return [
      { value: "equals", label: "Equals" },
      { value: "greaterThan", label: "Greater Than" },
      { value: "lessThan", label: "Less Than" },
      { value: "between", label: "Between" },
      { value: "isEmpty", label: "Is Empty" },
      { value: "isNotEmpty", label: "Is Not Empty" },
    ];
  } else if (fieldType === "createdAt" || fieldType === "updatedAt") {
    return [
      { value: "equals", label: "Equals" },
      { value: "greaterThan", label: "After" },
      { value: "lessThan", label: "Before" },
      { value: "between", label: "Between" },
    ];
  } else {
    return [
      { value: "contains", label: "Contains" },
      { value: "equals", label: "Equals" },
      { value: "startsWith", label: "Starts With" },
      { value: "endsWith", label: "Ends With" },
      { value: "isEmpty", label: "Is Empty" },
      { value: "isNotEmpty", label: "Is Not Empty" },
    ];
  }
};

const SmartFilterDialog = ({
  open,
  onOpenChange,
  onApply,
  initialConfig,
}: SmartFilterDialogProps) => {
  const [filterConfig, setFilterConfig] = useState<SmartFilterConfig>({
    operator: "AND",
    conditions: [],
  });

  // Reset or initialize with provided config when dialog opens
  useEffect(() => {
    if (open) {
      if (initialConfig) {
        setFilterConfig(initialConfig);
      } else {
        setFilterConfig({
          operator: "AND",
          conditions: [],
        });
      }
    }
  }, [open, initialConfig]);

  const addCondition = () => {
    const newCondition: SmartFilterCondition = {
      id: uuidv4(),
      field: "typeName",
      operator: "contains",
      value: "",
    };
    setFilterConfig({
      ...filterConfig,
      conditions: [...filterConfig.conditions, newCondition],
    });
  };

  const updateCondition = (
    id: string,
    field: keyof SmartFilterCondition,
    value: any
  ) => {
    setFilterConfig({
      ...filterConfig,
      conditions: filterConfig.conditions.map((condition) => {
        if (condition.id === id) {
          // If changing the field, reset the operator to an appropriate default
          if (field === "field") {
            const fieldType = value;
            let defaultOperator = "contains";
            
            if (fieldType === "documentCounter" || fieldType === "typeNumber") {
              defaultOperator = "equals";
            } else if (fieldType === "createdAt" || fieldType === "updatedAt") {
              defaultOperator = "equals";
            }
            
            return {
              ...condition,
              [field]: value,
              operator: defaultOperator,
              value: null,
              secondValue: undefined,
            };
          }
          
          return { ...condition, [field]: value };
        }
        return condition;
      }),
    });
  };

  const removeCondition = (id: string) => {
    setFilterConfig({
      ...filterConfig,
      conditions: filterConfig.conditions.filter(
        (condition) => condition.id !== id
      ),
    });
  };

  const handleApply = () => {
    onApply(filterConfig);
    onOpenChange(false);
  };

  const isDateField = (field: string) => {
    return field === "createdAt" || field === "updatedAt";
  };

  const isNumberField = (field: string) => {
    return field === "documentCounter" || field === "typeNumber";
  };

  const renderValueInput = (condition: SmartFilterCondition) => {
    const { field, operator, value, secondValue } = condition;

    // No input needed for isEmpty/isNotEmpty
    if (operator === "isEmpty" || operator === "isNotEmpty") {
      return null;
    }

    if (isDateField(field)) {
      return (
        <div className="flex flex-col space-y-2">
          <DatePicker
            date={value as Date | undefined}
            onDateChange={(date) =>
              updateCondition(condition.id, "value", date)
            }
            className="w-full"
          />
          {operator === "between" && (
            <div className="mt-2">
              <Label className="text-xs text-blue-300 mb-1 block">To</Label>
              <DatePicker
                date={secondValue as Date | undefined}
                onDateChange={(date) =>
                  updateCondition(condition.id, "secondValue", date)
                }
                className="w-full"
              />
            </div>
          )}
        </div>
      );
    }

    if (isNumberField(field)) {
      return (
        <div className="flex flex-col space-y-2">
          <Input
            type="number"
            value={value as string || ""}
            onChange={(e) =>
              updateCondition(condition.id, "value", e.target.value)
            }
            className="bg-blue-900/20 border-blue-800/30 text-white"
          />
          {operator === "between" && (
            <div className="mt-2">
              <Label className="text-xs text-blue-300 mb-1 block">To</Label>
              <Input
                type="number"
                value={secondValue as string || ""}
                onChange={(e) =>
                  updateCondition(condition.id, "secondValue", e.target.value)
                }
                className="bg-blue-900/20 border-blue-800/30 text-white"
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <Input
        value={value as string || ""}
        onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
        className="bg-blue-900/20 border-blue-800/30 text-white"
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#0a1033] border border-blue-900/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            Smart Filter
          </DialogTitle>
          <DialogDescription>
            Create complex filters with multiple conditions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <Label className="text-sm text-blue-300">Match Type</Label>
            <RadioGroup
              value={filterConfig.operator}
              onValueChange={(value) =>
                setFilterConfig({
                  ...filterConfig,
                  operator: value as "AND" | "OR",
                })
              }
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="AND"
                  id="and"
                  className="border-blue-500"
                />
                <Label htmlFor="and" className="text-sm">
                  Match ALL conditions (AND)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="OR"
                  id="or"
                  className="border-blue-500"
                />
                <Label htmlFor="or" className="text-sm">
                  Match ANY condition (OR)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-blue-900/30" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-blue-300">Filter Conditions</Label>
              <Button
                onClick={addCondition}
                variant="outline"
                size="sm"
                className="h-8 border-blue-500/50 bg-blue-900/20 hover:bg-blue-800/30"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Condition
              </Button>
            </div>

            {filterConfig.conditions.length === 0 ? (
              <div className="text-center py-6 text-blue-400 text-sm border border-dashed border-blue-900/30 rounded-md">
                No conditions added. Click "Add Condition" to start building your
                filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filterConfig.conditions.map((condition) => (
                  <Card
                    key={condition.id}
                    className="p-3 border border-blue-900/30 bg-blue-950/50"
                  >
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <Label className="text-xs text-blue-300 mb-1 block">
                          Field
                        </Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) =>
                            updateCondition(condition.id, "field", value)
                          }
                        >
                          <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs text-blue-300 mb-1 block">
                          Operator
                        </Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateCondition(condition.id, "operator", value)
                          }
                        >
                          <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorOptions(condition.field).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs text-blue-300 mb-1 block">
                          {condition.operator === "between" ? "From" : "Value"}
                        </Label>
                        {renderValueInput(condition)}
                      </div>
                      <div className="col-span-1 flex items-end justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(condition.id)}
                          className="h-9 w-9 hover:bg-red-900/30 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-blue-300 hover:text-blue-100"
          >
            Cancel
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setFilterConfig({
                  operator: "AND",
                  conditions: [],
                })
              }
              className="border-blue-500/50 bg-blue-900/20 hover:bg-blue-800/30"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApply}
              disabled={filterConfig.conditions.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Filter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SmartFilterDialog; 