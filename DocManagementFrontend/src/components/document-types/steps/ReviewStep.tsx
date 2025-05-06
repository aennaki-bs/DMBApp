import React from 'react';

interface ReviewStepProps {
  data: {
    typeName: string;
    typeKey: string;
    typeAttr?: string;
  };
}

export const ReviewStep = ({ data }: ReviewStepProps) => {
  return (
    <div className="bg-[#111633] rounded-md p-4 border border-blue-900/30">
      <h3 className="font-medium text-blue-200 text-sm mb-3">Review Document Type Details</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-blue-300">Type Name</p>
          <p className="text-sm text-white">{data.typeName}</p>
        </div>
        
        <div>
          <p className="text-xs text-blue-300">Type Code</p>
          <p className="text-sm text-white">{data.typeKey}</p>
        </div>
        
        {data.typeAttr && (
          <div>
            <p className="text-xs text-blue-300">Description</p>
            <p className="text-sm text-white">{data.typeAttr}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 border-t border-blue-900/20 pt-3">
        <p className="text-xs text-blue-300">Please review the information above before submitting.</p>
      </div>
    </div>
  );
}; 