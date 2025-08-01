import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Archive,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import erpArchivalService from '@/services/erpArchivalService';
import { DocumentErpStatus } from '@/models/erpArchival';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

interface ErpArchivalStatusProps {
  documentId: number;
  documentKey: string;
  isCompletedDocument?: boolean;
}

export default function ErpArchivalStatus({ 
  documentId, 
  documentKey, 
  isCompletedDocument = false 
}: ErpArchivalStatusProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const { hasRole } = useAuth();
  const { t, tWithParams } = useTranslation();

  const queryClient = useQueryClient();
  
  // Check if user can archive documents (Admin or FullUser, not SimpleUser)
  const canArchiveDocuments = hasRole(['Admin', 'FullUser']);

  const { data: erpStatus, isLoading, error } = useQuery({
    queryKey: ['documentErpStatus', documentId],
    queryFn: () => erpArchivalService.getDocumentErpStatus(documentId),
    enabled: !!documentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRetryArchival = async () => {
    setIsRetrying(true);
    try {
      // First try manual ERP archival endpoint
      try {
              await erpArchivalService.manualErpArchival(documentId);
      toast.success(t('documents.documentArchivalInitiated'));
    } catch (manualError) {
      // If manual archival fails, try the retry endpoint
      await erpArchivalService.retryDocumentArchival(documentId, {
        reason: 'Manual archival triggered by user'
      });
      toast.success(t('documents.documentArchivalRetry'));
    }
      
      // Refresh the ERP status after a short delay to allow processing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['documentErpStatus', documentId] });
      }, 2000);
      
    } catch (error) {
      console.error('Error initiating archival:', error);
      toast.error(t('documents.failedToInitiateArchival'));
    } finally {
      setIsRetrying(false);
    }
  };



  if (isLoading) {
    return (
      <Card>
        <CardHeader>
                  <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {t('documents.erpArchivalStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{t('documents.loadingErpStatus')}</span>
        </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
              <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{t('documents.failedToLoadErpStatus')}</span>
        </div>
        </CardContent>
      </Card>
    );
  }

  if (!erpStatus) return null;

  const { isArchived, hasUnresolvedErrors, errors, archivalStatusSummary, erpDocumentCode } = erpStatus;
  const unresolvedErrors = errors.filter(e => !e.isResolved);
  // Remove duplicates by ligne ID and keep only unique line errors
  const lineErrors = unresolvedErrors
    .filter(e => e.ligneId)
    .reduce((unique: typeof unresolvedErrors, error) => {
      const exists = unique.find(e => e.ligneId === error.ligneId && e.ligneCode === error.ligneCode);
      if (!exists) {
        unique.push(error);
      }
      return unique;
    }, []);

  // Document is considered successfully archived if it has an ERP Document Code
  const isDocumentArchivedToErp = !!erpDocumentCode;

  return (
    <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {t('documents.erpArchivalStatus')}
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Status Indicator */}
          <div className="flex items-center gap-3">
            {isDocumentArchivedToErp ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <span className="font-medium">
              {isDocumentArchivedToErp ? t('documents.documentSuccessfullyArchived') : t('documents.documentNotYetArchived')}
            </span>
          </div>

          {/* Detailed Process Status */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            isDocumentArchivedToErp 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-muted/30'
          }`}>
            <div className="font-medium">{t('documents.erpArchivalProcessStatus')}:</div>
            
            {isDocumentArchivedToErp ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>{t('documents.documentHeaderSuccessfullyArchived')}</span>
                </div>
                {erpStatus.erpDocumentCode && (
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    <span>{t('documents.erpDocumentCode')}: </span>
                    <Badge variant="outline" className="font-mono">
                      {erpStatus.erpDocumentCode}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {erpStatus.lastArchivalAttempt ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">❌</span>
                      <span className="font-medium">{t('documents.archivalFailed')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>{t('documents.systemAttemptedToArchive')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🔄</span>
                      <span className="font-medium">{t('documents.notYetProcessed')}</span>
                    </div>
                  </div>
                )}

                {/* Delayed Status Warning */}
                {!erpStatus.lastArchivalAttempt && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{t('documents.archivalStatusDelayed')}</span>
                      </div>
                      
                      <div>
                        <div className="font-medium text-amber-900 dark:text-amber-100 mb-2">{t('documents.possibleReasons')}</div>
                        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                          <li>• {t('documents.erpSystemUnavailable')}</li>
                          <li>• {t('documents.scheduledArchivalNotProcessed')}</li>
                          <li>• {t('documents.networkConnectivityIssues')}</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 p-3 rounded">
                        <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 {t('documents.nextSteps')}</div>
                        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          {canArchiveDocuments ? (
                            <div>• {t('documents.tryArchiveNowButton')}</div>
                          ) : (
                            <div>• {t('documents.contactAdministrator')}</div>
                          )}
                          <div>• {t('documents.contactItSupport')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Archival Section - Only for Admin and FullUser */}
          {!isDocumentArchivedToErp && canArchiveDocuments && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium text-blue-900 dark:text-blue-100">{t('documents.manualArchival')}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-200">
                    {t('documents.automaticArchivalNotOccurred')}
                  </div>
                </div>
                <Button
                  onClick={handleRetryArchival}
                  disabled={isRetrying}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Archive className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? t('documents.processing') : t('documents.archiveNow')}
                </Button>
              </div>
            </div>
          )}

          {/* Information message for SimpleUser */}
          {/* {!isArchived && !canArchiveDocuments && (
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-gray-500" />
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Document Archival</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Document archival is managed automatically or by administrators
                  </div>
                </div>
              </div>
            </div>
          )} */}



          {/* Line Archival Errors - Only show when document is NOT archived to ERP */}
          {lineErrors.length > 0 && !isDocumentArchivedToErp && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{t('documents.someLinesFailedToArchive')}</span>
              </div>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100">
                    {tWithParams('documents.viewFailedLines', { 
                      count: lineErrors.length, 
                      plural: lineErrors.length > 1 ? 's' : '' 
                    })}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3">
                  {lineErrors.map((error) => (
                    <div key={`${error.ligneId}-${error.id}`} className="bg-background/80 p-3 rounded border border-amber-200 dark:border-amber-700">
                      <div className="space-y-1">
                        <div className="font-medium text-amber-900 dark:text-amber-100">
                          {t('documents.line')}: {error.ligneCode || `ACC_${error.ligneId}`}
                        </div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                          {error.errorMessage}
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}


        </CardContent>
      </Card>
    );
} 