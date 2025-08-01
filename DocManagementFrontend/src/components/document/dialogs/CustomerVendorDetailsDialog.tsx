import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  Package, 
  MapPin, 
  Globe, 
  X
} from 'lucide-react';
import { Document } from '@/models/document';
import { useTranslation } from '@/hooks/useTranslation';

interface CustomerVendorDetailsDialogProps {
  document: Document;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerVendorDetailsDialog({
  document,
  isOpen,
  onOpenChange,
}: CustomerVendorDetailsDialogProps) {
  const { t, tWithParams } = useTranslation();
  const isCustomer = document.documentType?.tierType === 1; 
  const tierType = isCustomer ? t('customer') : t('vendor'); 
  const tierIcon = isCustomer ? UserCheck : Package;

  // Customer/Vendor information
  const customerVendorInfo = {
    name: document.customerVendorName,
    code: document.customerVendorCode,
    address: document.customerVendorAddress,
    city: document.customerVendorCity,
    country: document.customerVendorCountry,
  };

  const hasAddress = customerVendorInfo.address || customerVendorInfo.city || customerVendorInfo.country;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border-slate-600/50">
        <DialogHeader className="border-b border-slate-600/50 pb-6">
          <DialogTitle className="flex items-center gap-4 text-2xl">
            <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
              {React.createElement(tierIcon, { className: "h-8 w-8 text-blue-400" })}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-bold">
                {isCustomer ? t('documents.customerAddress') : t('documents.vendorAddress')}
              </span>
              <span className="text-slate-300 text-sm font-normal">
                {t('documents.contactAndLocationInformation')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ml-auto h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-400" />
              {t('documents.basicInformation')}
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <label className="text-sm font-medium text-slate-300 mb-2 block">{t('common.name')}</label>
                <p className="text-white font-semibold text-lg">
                  {customerVendorInfo.name || t('documents.notSpecified')}
                </p>
              </div>

              {/* Code */}
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <label className="text-sm font-medium text-slate-300 mb-2 block">{t('common.code')}</label>
                <p className="text-white font-mono text-lg">
                  {customerVendorInfo.code || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {hasAddress && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-400" />
                {t('documents.addressInformation')}
              </h3>
              
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <div className="space-y-4">
                  {/* Street Address */}
                  {customerVendorInfo.address && (
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1 block">{t('documents.streetAddress')}</label>
                      <p className="text-white">{customerVendorInfo.address}</p>
                    </div>
                  )}

                  {/* City and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerVendorInfo.city && (
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">{t('city')}</label>
                        <p className="text-white">{customerVendorInfo.city}</p>
                      </div>
                    )}
                    
                    {customerVendorInfo.country && (
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">{t('country')}</label>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <p className="text-white">{customerVendorInfo.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Address Warning */}
          {!hasAddress && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-amber-400" />
                <div>
                  <h4 className="text-amber-300 font-medium">{t('documents.noAddressInformation')}</h4>
                  <p className="text-amber-200/70 text-sm mt-1">
                    {tWithParams('documents.noAddressAvailable', { type: tierType.toLowerCase() })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-600/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
          >
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 