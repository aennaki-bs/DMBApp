import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Share2,
  AlertCircle,
  Search,
  CheckCircle,
  Circle,
  FileText,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Circuit {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  code?: string;
  isActive?: boolean;
  stats?: {
    documentsProcessed?: number;
    averageProcessingTime?: string;
    approvers?: number;
  };
}

interface CircuitAssignmentStepProps {
  circuits: Circuit[];
  selectedCircuitId: number | null;
  circuitError: string | null;
  onCircuitChange: (value: string) => void;
  isLoading: boolean;
}

export const CircuitAssignmentStep = ({
  circuits,
  selectedCircuitId,
  circuitError,
  onCircuitChange,
  isLoading,
}: CircuitAssignmentStepProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // Filter circuits based on search query
  const filteredCircuits = circuits.filter(
    (circuit) =>
      circuit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circuit.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const noCircuitsAvailable = circuits.length === 0;

  const StatusIndicator = ({ isActive }: { isActive?: boolean }) => (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full",
          isActive ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span
        className={cn(
          "text-xs font-medium",
          isActive ? "text-green-400" : "text-red-400"
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search circuits..."
          className="pl-9 bg-gray-900 border-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Circuit Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-blue-400" />
          <Label className="text-sm font-medium text-gray-200">
            Select Circuit*
          </Label>
        </div>

        {isLoading ? (
          <div className="flex items-center space-x-3 text-blue-400 text-sm py-2 px-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent"></div>
            <span>Loading circuits...</span>
          </div>
        ) : noCircuitsAvailable ? (
          <Card className="bg-blue-900/20 border-blue-900/40">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-blue-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    No active circuits available
                  </p>
                  <p className="text-xs mt-1 text-blue-300/80">
                    There are no active circuits in the system. Only active
                    circuits can be assigned to documents.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredCircuits.length === 0 ? (
          <Card className="bg-amber-900/20 border-amber-800/40">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No circuits found matching your search.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <RadioGroup
            value={selectedCircuitId?.toString() || ""}
            onValueChange={onCircuitChange}
            className="space-y-3"
          >
            <div className="flex text-xs font-medium text-gray-400 px-4 py-2 justify-between border-b border-gray-800">
              <div>Circuit Code</div>
              <div>Title</div>
              <div>Description</div>
              <div>Status</div>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              {filteredCircuits.map((circuit) => (
                <div
                  key={circuit.id}
                  className="mb-6 bg-gray-900 border border-gray-800 rounded-md overflow-hidden"
                >
                  <div
                    className={cn(
                      "cursor-pointer transition-all p-4",
                      selectedCircuitId === circuit.id &&
                        "bg-blue-900/30 border-blue-500"
                    )}
                    onClick={() => onCircuitChange(circuit.id.toString())}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem
                        value={circuit.id.toString()}
                        id={`circuit-${circuit.id}`}
                        className={cn(
                          "mr-3",
                          selectedCircuitId === circuit.id && "text-blue-500"
                        )}
                      />

                      <div className="flex items-center gap-2 w-20">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="font-mono text-sm">
                          {circuit.code || "CR01"}
                        </span>
                      </div>

                      <div className="flex-grow mr-4">
                        <div className="text-blue-400 font-medium">
                          {circuit.name}
                        </div>
                      </div>

                      <div className="mr-4 text-sm text-gray-400">
                        {circuit.description}
                      </div>

                      <div className="flex items-center gap-2">
                        {circuit.isActive !== undefined && (
                          <StatusIndicator isActive={circuit.isActive} />
                        )}
                        {selectedCircuitId === circuit.id && (
                          <Badge className="bg-blue-600 ml-2">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Circuit Stats */}
                  {circuit.stats && (
                    <div className="grid grid-cols-3 gap-0 border-t border-gray-800">
                      <div className="flex flex-col items-center py-3 border-r border-gray-800">
                        <div className="text-gray-400 text-xs">Documents</div>
                        <div className="text-white font-medium">
                          {circuit.stats.documentsProcessed}
                        </div>
                      </div>

                      <div className="flex flex-col items-center py-3 border-r border-gray-800">
                        <div className="text-gray-400 text-xs">Avg. Time</div>
                        <div className="text-white font-medium">
                          {circuit.stats.averageProcessingTime}
                        </div>
                      </div>

                      <div className="flex flex-col items-center py-3">
                        <div className="text-gray-400 text-xs">Approvers</div>
                        <div className="text-white font-medium">
                          {circuit.stats.approvers}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full py-2 text-center text-blue-400 hover:text-blue-300 border-t border-gray-800 rounded-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(
                        showDetails === circuit.id ? null : circuit.id
                      );
                    }}
                  >
                    Show details
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </RadioGroup>
        )}

        {circuitError && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {circuitError}
          </p>
        )}
      </div>

      <div className="text-sm text-gray-400 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p>
            Assigning a document to a circuit determines its approval workflow
            and who will process it.
          </p>
          <p className="mt-1 text-blue-400/80">
            Note: Only active circuits are available for document assignment.
          </p>
        </div>
      </div>
    </div>
  );
};
