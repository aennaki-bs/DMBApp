import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMultiStepForm } from '@/context/form';
import { ResponsibilityCentreSelect } from '@/components/responsibility-centre/ResponsibilityCentreSelect';

const StepResponsibilityCentre: React.FC = () => {
  const { formData, setFormData } = useMultiStepForm();

  const handleSelectedCentreChange = (centreId: number | undefined) => {
    setFormData({
      responsibilityCentreId: centreId,
      // Clear any new centre data since we're only allowing selection
      newResponsibilityCentre: undefined,
    });
  };

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
          Select an existing responsibility centre (optional)
        </p>
      </div>

      {/* Warning Message */}
      <Alert className="bg-amber-900/20 border-amber-800/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-amber-300">
          <strong>Important:</strong> If your responsibility centre doesn't exist in the list below, 
          please contact the administration to have it created.
        </AlertDescription>
      </Alert>

      {/* Select Mode */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Select Responsibility Centre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsibilityCentreSelect
            value={formData.responsibilityCentreId}
            onValueChange={handleSelectedCentreChange}
            placeholder="Choose a responsibility centre (optional)"
            required={false}
          />
          <div className="mt-4 space-y-2">
            <Alert className="bg-blue-900/20 border-blue-800/30">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                This step is optional. You can skip it and assign a responsibility centre later, 
                or contact your administrator to create a new one if needed.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Current Selection Summary */}
      {formData.responsibilityCentreId && (
        <Card className="bg-green-900/20 border-green-800/30">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-400">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Selected Responsibility Centre (ID: {formData.responsibilityCentreId})</span>
            </div>
            <p className="text-sm text-green-300 mt-1">
              Your account will be associated with this responsibility centre.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default StepResponsibilityCentre; 