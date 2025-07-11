import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Clock,
  Archive,
  FileX,
  MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import erpArchivalService from '@/services/erpArchivalService';
import { DocumentErpStatus, ErpArchivalError, ErpErrorType } from '@/models/erpArchival';
import { formatDistanceToNow } from 'date-fns';

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
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<ErpArchivalError | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [retryReason, setRetryReason] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const queryClient = useQueryClient();

  const { data: erpStatus, isLoading, error } = useQuery({
    queryKey: ['documentErpStatus', documentId],
    queryFn: () => erpArchivalService.getDocumentErpStatus(documentId),
    enabled: !!documentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleResolveError = async () => {
    if (!selectedError || !resolutionNotes.trim()) return;

    setIsResolving(true);
    try {
      await erpArchivalService.resolveErpError(selectedError.id, {
        resolutionNotes: resolutionNotes.trim()
      });
      
      toast.success('Error resolved successfully');
      setResolveDialogOpen(false);
      setSelectedError(null);
      setResolutionNotes('');
      
      // Refresh the ERP status
      queryClient.invalidateQueries({ queryKey: ['documentErpStatus', documentId] });
    } catch (error) {
      console.error('Error resolving ERP error:', error);
      toast.error('Failed to resolve error');
    } finally {
      setIsResolving(false);
    }
  };

  const handleRetryArchival = async () => {
    setIsRetrying(true);
    try {
      // First try manual ERP archival endpoint
      try {
        await erpArchivalService.manualErpArchival(documentId);
        toast.success('Document archival initiated successfully');
      } catch (manualError) {
        // If manual archival fails, try the retry endpoint
        await erpArchivalService.retryDocumentArchival(documentId, {
          reason: 'Manual archival triggered by user'
        });
        toast.success('Document archival retry initiated');
      }
      
      setRetryReason('');
      
      // Refresh the ERP status after a short delay to allow processing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['documentErpStatus', documentId] });
      }, 2000);
      
    } catch (error) {
      console.error('Error initiating archival:', error);
      toast.error('Failed to initiate archival. Please check if the document is ready for ERP processing.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetryLineArchival = async (ligneIds: number[]) => {
    setIsRetrying(true);
    try {
      await erpArchivalService.retryLineArchival(documentId, {
        ligneIds,
        reason: retryReason.trim() || undefined
      });
      
      toast.success('Line archival retry initiated');
      setRetryReason('');
      
      // Refresh the ERP status
      queryClient.invalidateQueries({ queryKey: ['documentErpStatus', documentId] });
    } catch (error) {
      console.error('Error retrying line archival:', error);
      toast.error('Failed to retry line archival');
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case ErpErrorType.DocumentArchival:
        return <FileX className="h-4 w-4" />;
      case ErpErrorType.LineArchival:
        return <AlertTriangle className="h-4 w-4" />;
      case ErpErrorType.NetworkError:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case ErpErrorType.DocumentArchival:
        return 'destructive';
      case ErpErrorType.LineArchival:
        return 'warning';
      case ErpErrorType.NetworkError:
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            ERP Archival Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading ERP status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load ERP archival status. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!erpStatus) return null;

  const { isArchived, hasUnresolvedErrors, errors, ligneStatuses, archivalStatusSummary } = erpStatus;
  const unresolvedErrors = errors.filter(e => !e.isResolved);
  const documentErrors = unresolvedErrors.filter(e => !e.ligneId);
  const lineErrors = unresolvedErrors.filter(e => e.ligneId);

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              ERP Archival Status
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['documentErpStatus', documentId] })}
              className="h-8 w-8 p-0"
              title="Refresh status"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Badge variant={isArchived ? 'default' : hasUnresolvedErrors ? 'destructive' : 'secondary'}>
              {isArchived ? 
                (hasUnresolvedErrors ? 'Partially Archived' : 'Fully Archived') : 
                (hasUnresolvedErrors ? 'Archival Failed' : 
                  (erpStatus.lastArchivalAttempt ? 'Retry Required' : 'Archival Delayed')
                )
              }
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isArchived ? (
                hasUnresolvedErrors ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )
              ) : hasUnresolvedErrors ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium">{archivalStatusSummary}</span>
            </div>
            
            {/* Detailed Archival Process Status */}
            <div className="text-sm bg-muted/30 p-4 rounded border-l-4 border-l-blue-500 space-y-3">
              <div><strong>Document Workflow:</strong> ✅ Circuit completed - Document approved and ready for ERP archival</div>
              
              <div className="space-y-2">
                <div><strong>ERP Archival Process Status:</strong></div>
                {isArchived ? (
                  <div className="ml-4 space-y-1">
                    <div>✅ Document header successfully archived to ERP</div>
                    <div>📋 ERP Document Code: <span className="font-mono bg-muted px-1 rounded">{erpStatus.erpDocumentCode}</span></div>
                    {hasUnresolvedErrors && (
                      <div>⚠️ Some lines failed to archive - see details below</div>
                    )}
                  </div>
                ) : (
                  <div className="ml-4 space-y-2">
                    {erpStatus.lastArchivalAttempt ? (
                      <div className="space-y-1">
                        <div>❌ <strong>Archival Failed</strong></div>
                        {/* <div>🕒 Last attempt: {formatDistanceToNow(new Date(erpStatus.lastArchivalAttempt), { addSuffix: true })}</div> */}
                        <div>📝 The system attempted to archive this document but encountered errors</div>
                        {hasUnresolvedErrors && (
                          <div>🔍 <strong>Action Required:</strong> Review and resolve the errors shown below</div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div>⏳ <strong>Not Yet Processed</strong></div>
                        <div>📝 This document has not yet been submitted for ERP archival</div>
                        <div>🔄 Archival typically occurs automatically within minutes of circuit completion</div>
                        <div className="text-amber-700 bg-amber-50 dark:bg-amber-950/20 p-3 rounded mt-2">
                          <div className="space-y-2">
                            <div><strong>⚠️ Archival Status: DELAYED</strong></div>
                            <div>
                              <strong>Possible reasons:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>ERP system temporarily unavailable or under maintenance</li>
                                <li>Scheduled archival background service hasn't processed this document yet</li>
                                <li>Document data may require validation before ERP submission</li>
                                <li>Network connectivity issues between systems</li>
                                <li>ERP system authentication or permission issues</li>
                              </ul>
                            </div>
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                              <strong>💡 Next Steps:</strong>
                              <div>• Try the "Archive Now" button above to manually trigger archival</div>
                              <div>• Contact IT support if the issue persists</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {erpStatus.erpDocumentCode && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <strong>ERP Document Code:</strong>
              <Badge variant="outline" className="font-mono">
                {erpStatus.erpDocumentCode}
              </Badge>
            </div>
          )}

          {/*           {erpStatus.lastArchivalAttempt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <strong>Last Attempt:</strong>
              <span>{formatDistanceToNow(new Date(erpStatus.lastArchivalAttempt), { addSuffix: true })}</span>
            </div>
          )}

          {/* Manual Actions */}
          {!isArchived && !hasUnresolvedErrors && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">Manual Archival</div>
                  <div className="text-sm text-blue-700 dark:text-blue-200">
                    If automatic archival hasn't occurred, you can manually trigger it
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleRetryArchival}
                  disabled={isRetrying}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Processing...' : 'Archive Now'}
                </Button>
              </div>
            </div>
          )}

          {/* Detailed Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Workflow Status</span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-200">
                ✅ Circuit completed - Document approved and ready for archival
              </div>
            </div>

            <div className={`p-3 rounded border ${isArchived 
              ? (hasUnresolvedErrors 
                ? 'bg-amber-50 dark:bg-amber-950/20' 
                : 'bg-green-50 dark:bg-green-950/20')
              : 'bg-red-50 dark:bg-red-950/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isArchived ? (
                  hasUnresolvedErrors ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${isArchived 
                  ? (hasUnresolvedErrors 
                    ? 'text-amber-900 dark:text-amber-100' 
                    : 'text-green-900 dark:text-green-100')
                  : 'text-red-900 dark:text-red-100'
                }`}>
                  ERP Archival Status
                </span>
              </div>
              <div className={`text-sm ${isArchived 
                ? (hasUnresolvedErrors 
                  ? 'text-amber-700 dark:text-amber-200' 
                  : 'text-green-700 dark:text-green-200')
                : 'text-red-700 dark:text-red-200'
              }`}>
                {isArchived ? (
                  hasUnresolvedErrors ? (
                    '⚠️ Document archived, but some lines failed'
                  ) : (
                    '✅ Fully archived to ERP system'
                  )
                ) : (
                  '❌ Not yet archived to ERP system'
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Archival Errors */}
      {documentErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>Document archival failed:</strong>
              {documentErrors.map((error) => (
                <div key={error.id} className="flex items-center justify-between">
                  <span>{error.errorMessage}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedError(error);
                        setResolveDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRetryArchival}
                      disabled={isRetrying}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                      Retry
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Line Archival Errors */}
      {lineErrors.length > 0 && (
        <Alert variant="default" className="border-amber-200 bg-amber-10 text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>Some lines failed to archive:</strong>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-normal">
                    View {lineErrors.length} failed lines
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {lineErrors.map((error) => (
                    <div key={error.id} className="flex items-center justify-between bg-background/50 p-2 rounded">
                      <div>
                        <div className="font-medium">Line: {error.ligneCode || `ID ${error.ligneId}`}</div>
                        <div className="text-sm text-muted-foreground">{error.errorMessage}</div>
                      </div>
                      {/* <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedError(error);
                            setResolveDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRetryLineArchival([error.ligneId!])}
                          disabled={isRetrying}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                          Retry
                        </Button>
                      </div> */}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resolve Error Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve ERP Error</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedError && (
              <div className="space-y-2">
                <Label>Error Details</Label>
                <div className="p-3 bg-muted rounded text-sm">
                  <div><strong>Type:</strong> {selectedError.errorType}</div>
                  <div><strong>Message:</strong> {selectedError.errorMessage}</div>
                  {selectedError.ligneCode && (
                    <div><strong>Line:</strong> {selectedError.ligneCode}</div>
                  )}
                  <div><strong>Occurred:</strong> {formatDistanceToNow(new Date(selectedError.occurredAt), { addSuffix: true })}</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                placeholder="Describe how this error was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResolveDialogOpen(false);
                setSelectedError(null);
                setResolutionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveError}
              disabled={!resolutionNotes.trim() || isResolving}
            >
              {isResolving ? 'Resolving...' : 'Resolve Error'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 