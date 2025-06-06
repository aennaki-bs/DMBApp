import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Info,
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ResponsibilityCentreSelect } from "@/components/responsibility-centre/ResponsibilityCentreSelect";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";

interface ResponsibilityCentreStepProps {
  selectedCentreId?: number;
  onCentreChange: (centreId: number | undefined) => void;
  userHasCentre?: boolean;
  userCentreName?: string;
  isLoading?: boolean;
  responsibilityCentres?: ResponsibilityCentreSimple[];
  onRetryFetch?: () => void;
}

const TroubleshootingTips = () => (
  <div className="mt-4 p-4 bg-gray-900/60 rounded-md border border-gray-700">
    <h4 className="text-blue-300 font-medium mb-2 flex items-center">
      <Info className="h-4 w-4 mr-1" /> Troubleshooting Tips
    </h4>
    <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
      <li>Check your internet connection</li>
      <li>
        Ensure you have proper permissions to access responsibility centres
      </li>
      <li>Try logging out and logging back in</li>
      <li>Contact your administrator if the problem persists</li>
    </ul>
  </div>
);

export const ResponsibilityCentreStep: React.FC<
  ResponsibilityCentreStepProps
> = ({
  selectedCentreId,
  onCentreChange,
  userHasCentre = false,
  userCentreName,
  isLoading = false,
  responsibilityCentres = [],
  onRetryFetch,
}) => {
  const hasNoCentres = !isLoading && responsibilityCentres.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <Building2 className="h-12 w-12 text-blue-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Responsibility Centre</h2>
        <p className="text-gray-400">
          {userHasCentre
            ? "Document will be assigned to your responsibility centre"
            : "Select a responsibility centre for this document"}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span className="text-blue-300 font-medium">
                Loading responsibility centre information...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content when not loading */}
      {!isLoading && (
        <>
          {userHasCentre ? (
            // User has a responsibility centre - just show info card
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  Your Responsibility Centre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-900/20 p-4 rounded-md">
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-blue-400 mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {userCentreName}
                      </div>
                      <p className="text-blue-300 text-sm mt-1">
                        This document will be automatically assigned to your
                        responsibility centre
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // User doesn't have a responsibility centre - show selection
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Select Responsibility Centre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-amber-900/20 border-amber-800/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-amber-300">
                    Your account is not assigned to a responsibility centre.
                    Please select a centre for this document.
                  </AlertDescription>
                </Alert>

                {hasNoCentres ? (
                  <div className="space-y-4">
                    <Alert className="bg-amber-900/20 border-amber-800/30">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-amber-300 flex flex-col space-y-2">
                        <span>
                          Unable to load responsibility centres. Please try
                          again or contact administration.
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="self-start bg-amber-900/30 border-amber-700 text-amber-200 hover:bg-amber-800/50"
                          onClick={onRetryFetch}
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Retry Loading
                        </Button>
                      </AlertDescription>
                    </Alert>
                    <TroubleshootingTips />
                  </div>
                ) : (
                  <>
                    <ResponsibilityCentreSelect
                      value={selectedCentreId}
                      onValueChange={onCentreChange}
                      placeholder="Select a responsibility centre"
                      required={true}
                    />

                    {selectedCentreId && (
                      <Card className="bg-green-900/20 border-green-800/30 mt-4">
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2 text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">
                              Document will be assigned to the selected
                              responsibility centre
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
};
