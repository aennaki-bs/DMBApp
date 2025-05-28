import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResponsibilityCentreSelect } from '@/components/responsibility-centre/ResponsibilityCentreSelect';

interface ResponsibilityCentreStepProps {
  selectedCentreId?: number;
  onCentreChange: (centreId: number | undefined) => void;
  userHasCentre?: boolean;
  userCentreName?: string;
}

export const ResponsibilityCentreStep: React.FC<ResponsibilityCentreStepProps> = ({
  selectedCentreId,
  onCentreChange,
  userHasCentre = false,
  userCentreName,
}) => {
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
          Assign this document to a responsibility centre
        </p>
      </div>

      {userHasCentre && (
        <Alert className="bg-blue-900/20 border-blue-800/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            Your account is assigned to <strong>{userCentreName}</strong>. 
            This document will automatically be assigned to your responsibility centre unless you specify a different one.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Select Responsibility Centre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsibilityCentreSelect
            value={selectedCentreId}
            onValueChange={onCentreChange}
            placeholder={
              userHasCentre 
                ? `Use your centre (${userCentreName}) or select different`
                : 'Select a responsibility centre (optional)'
            }
            required={false}
          />
          
          {!userHasCentre && (
            <Alert className="mt-4 bg-amber-900/20 border-amber-800/30">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-amber-300">
                Your account is not assigned to a responsibility centre. 
                You can optionally assign this document to a specific centre.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedCentreId && (
        <Card className="bg-green-900/20 border-green-800/30">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-400">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Document will be assigned to the selected responsibility centre</span>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}; 