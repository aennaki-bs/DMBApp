import circuitService from './circuitService';
import { toast } from 'sonner';

export interface Circuit {
  id: number;
  circuitKey: string;
  title: string;
  descriptif?: string;
  isActive: boolean;
  status?: string;
}

export interface CircuitDependency {
  type: 'documents' | 'steps' | 'approvals' | 'transitions';
  count: number;
  description: string;
  canForceDelete: boolean;
  details?: any[];
}

export interface DeleteOptions {
  forceDelete: boolean;
  cascadeDelete: boolean;
  backupBeforeDelete: boolean;
}

export interface DependencyAnalysisResult {
  dependencies: CircuitDependency[];
  hasBlockingDependencies: boolean;
  canDelete: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
  backupInfo?: {
    filename: string;
    size: string;
    timestamp: string;
  };
}

class CircuitDeleteService {
  
  /**
   * Analyze dependencies for one or more circuits
   */
  async analyzeDependencies(circuitIds: number[]): Promise<DependencyAnalysisResult> {
    try {
      const dependencies: CircuitDependency[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Check each circuit for dependencies
      for (const circuitId of circuitIds) {
        // Check for documents using this circuit
        const documentDependency = await this.checkDocumentDependencies(circuitId);
        if (documentDependency.count > 0) {
          dependencies.push(documentDependency);
        }

        // Check for circuit steps
        const stepsDependency = await this.checkStepsDependencies(circuitId);
        if (stepsDependency.count > 0) {
          dependencies.push(stepsDependency);
        }

        // Check for pending approvals
        const approvalsDependency = await this.checkApprovalsDependencies(circuitId);
        if (approvalsDependency.count > 0) {
          dependencies.push(approvalsDependency);
        }

        // Check for transitions
        const transitionsDependency = await this.checkTransitionsDependencies(circuitId);
        if (transitionsDependency.count > 0) {
          dependencies.push(transitionsDependency);
        }
      }

      const hasBlockingDependencies = dependencies.some(dep => !dep.canForceDelete);
      const canDelete = !hasBlockingDependencies;

      // Generate warnings and suggestions
      if (hasBlockingDependencies) {
        warnings.push("This circuit has blocking dependencies that prevent deletion");
        suggestions.push("Consider archiving the circuit instead of deleting it");
      }

      if (dependencies.some(dep => dep.type === 'documents' && dep.count > 0)) {
        suggestions.push("Review documents using this circuit before deletion");
      }

      return {
        dependencies,
        hasBlockingDependencies,
        canDelete,
        warnings,
        suggestions
      };

    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      throw new Error('Failed to analyze circuit dependencies');
    }
  }

  /**
   * Check for documents using the circuit
   */
  private async checkDocumentDependencies(circuitId: number): Promise<CircuitDependency> {
    try {
      // Mock implementation - replace with actual API call
      const count = Math.floor(Math.random() * 10);
      return {
        type: 'documents',
        count,
        description: `Documents using circuit ${circuitId}`,
        canForceDelete: true,
        details: [] // Would contain actual document list
      };
    } catch (error) {
      console.error(`Error checking document dependencies for circuit ${circuitId}:`, error);
      return {
        type: 'documents',
        count: 0,
        description: 'Failed to check document dependencies',
        canForceDelete: false
      };
    }
  }

  /**
   * Check for circuit steps
   */
  private async checkStepsDependencies(circuitId: number): Promise<CircuitDependency> {
    try {
      // Mock implementation - replace with actual API call
      const count = Math.floor(Math.random() * 15);
      return {
        type: 'steps',
        count,
        description: `Circuit steps and configurations`,
        canForceDelete: true,
        details: [] // Would contain actual steps list
      };
    } catch (error) {
      console.error(`Error checking steps dependencies for circuit ${circuitId}:`, error);
      return {
        type: 'steps',
        count: 0,
        description: 'Failed to check steps dependencies',
        canForceDelete: false
      };
    }
  }

  /**
   * Check for pending approvals
   */
  private async checkApprovalsDependencies(circuitId: number): Promise<CircuitDependency> {
    try {
      // Mock implementation - replace with actual API call
      const count = Math.floor(Math.random() * 5);
      return {
        type: 'approvals',
        count,
        description: `Pending approvals in circuit`,
        canForceDelete: count === 0, // Can't force delete if there are pending approvals
        details: [] // Would contain actual approval list
      };
    } catch (error) {
      console.error(`Error checking approvals dependencies for circuit ${circuitId}:`, error);
      return {
        type: 'approvals',
        count: 0,
        description: 'Failed to check approvals dependencies',
        canForceDelete: false
      };
    }
  }

  /**
   * Check for workflow transitions
   */
  private async checkTransitionsDependencies(circuitId: number): Promise<CircuitDependency> {
    try {
      // Mock implementation - replace with actual API call
      const count = Math.floor(Math.random() * 8);
      return {
        type: 'transitions',
        count,
        description: `Workflow transitions`,
        canForceDelete: true,
        details: [] // Would contain actual transitions list
      };
    } catch (error) {
      console.error(`Error checking transitions dependencies for circuit ${circuitId}:`, error);
      return {
        type: 'transitions',
        count: 0,
        description: 'Failed to check transitions dependencies',
        canForceDelete: false
      };
    }
  }

  /**
   * Create backup before deletion
   */
  private async createBackup(circuits: Circuit[]): Promise<{ filename: string; size: string; timestamp: string }> {
    try {
      const timestamp = new Date().toISOString();
      const filename = `circuits_backup_${timestamp.replace(/[:.]/g, '-')}.json`;
      
      // Mock backup creation - in real implementation, this would save to server
      const backupData = {
        timestamp,
        circuits,
        metadata: {
          version: '1.0',
          createdBy: 'system',
          totalCircuits: circuits.length
        }
      };

      // Simulate backup size calculation
      const size = `${Math.round(JSON.stringify(backupData).length / 1024)}KB`;

      // In real implementation, send backup data to server
      console.log('Backup created:', { filename, size, timestamp });

      return { filename, size, timestamp };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Delete circuits with options
   */
  async deleteCircuits(circuits: Circuit[], options: DeleteOptions): Promise<DeleteResult> {
    const result: DeleteResult = {
      success: false,
      deletedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: []
    };

    try {
      // Create backup if requested
      if (options.backupBeforeDelete) {
        try {
          result.backupInfo = await this.createBackup(circuits);
          toast.success(`Backup created: ${result.backupInfo.filename}`);
        } catch (error) {
          result.warnings.push('Failed to create backup, but proceeding with deletion');
          toast.warning('Backup creation failed, proceeding with deletion');
        }
      }

      // Analyze dependencies if not force deleting
      if (!options.forceDelete) {
        const analysis = await this.analyzeDependencies(circuits.map(c => c.id));
        if (analysis.hasBlockingDependencies) {
          throw new Error('Cannot delete circuits with blocking dependencies');
        }
      }

      // Delete circuits
      const deletePromises = circuits.map(async (circuit) => {
        try {
          if (options.cascadeDelete) {
            await this.cascadeDeleteCircuit(circuit.id);
          } else {
            await circuitService.deleteCircuit(circuit.id);
          }
          result.deletedCount++;
          return { success: true, circuit };
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Failed to delete circuit "${circuit.title}": ${error.message}`);
          return { success: false, circuit, error };
        }
      });

      await Promise.all(deletePromises);

      result.success = result.deletedCount > 0;

      // Generate appropriate toast messages
      if (result.deletedCount === circuits.length) {
        toast.success(`Successfully deleted ${result.deletedCount} circuit${result.deletedCount === 1 ? '' : 's'}`);
      } else if (result.deletedCount > 0) {
        toast.warning(`Deleted ${result.deletedCount} circuits, ${result.failedCount} failed`);
      } else {
        toast.error('Failed to delete any circuits');
      }

    } catch (error) {
      result.errors.push(error.message);
      toast.error(`Delete operation failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Cascade delete - delete circuit and all related data
   */
  private async cascadeDeleteCircuit(circuitId: number): Promise<void> {
    try {
      // Delete in order: transitions, approvals, steps, then circuit
      // Mock implementation - replace with actual API calls
      
      // 1. Delete transitions
      console.log(`Deleting transitions for circuit ${circuitId}`);
      
      // 2. Delete pending approvals (if force delete is enabled)
      console.log(`Deleting approvals for circuit ${circuitId}`);
      
      // 3. Delete steps
      console.log(`Deleting steps for circuit ${circuitId}`);
      
      // 4. Finally delete the circuit
      await circuitService.deleteCircuit(circuitId);
      
    } catch (error) {
      console.error(`Error in cascade delete for circuit ${circuitId}:`, error);
      throw error;
    }
  }

  /**
   * Archive circuit instead of deleting (soft delete)
   */
  async archiveCircuit(circuitId: number): Promise<void> {
    try {
      // Mock implementation - in real app, this would set isActive to false
      // and possibly add an archived flag
      console.log(`Archiving circuit ${circuitId}`);
      
      // await circuitService.updateCircuit(circuitId, { isActive: false, archived: true });
      
      toast.success('Circuit archived successfully');
    } catch (error) {
      console.error('Error archiving circuit:', error);
      toast.error('Failed to archive circuit');
      throw error;
    }
  }

  /**
   * Validate if circuits can be deleted
   */
  async validateDeletion(circuitIds: number[]): Promise<{ canDelete: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    
    try {
      const analysis = await this.analyzeDependencies(circuitIds);
      
      if (analysis.hasBlockingDependencies) {
        reasons.push('Circuits have blocking dependencies');
      }

      // Additional validation rules
      for (const circuitId of circuitIds) {
        // Check if circuit is system-critical
        // if (await this.isSystemCritical(circuitId)) {
        //   reasons.push(`Circuit ${circuitId} is system-critical and cannot be deleted`);
        // }
      }

      return {
        canDelete: reasons.length === 0,
        reasons
      };
    } catch (error) {
      reasons.push('Failed to validate deletion permissions');
      return { canDelete: false, reasons };
    }
  }
}

export const circuitDeleteService = new CircuitDeleteService(); 