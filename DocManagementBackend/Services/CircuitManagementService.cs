using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Services
{
    public class CircuitManagementService
    {
        private readonly ApplicationDbContext _context;

        public CircuitManagementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Circuit> CreateCircuitAsync(Circuit circuit)
        {
            // Generate circuit key and set defaults
            var counter = await _context.TypeCounter.FirstOrDefaultAsync();
            if (counter == null)
            {
                counter = new TypeCounter { circuitCounter = 1 };
                _context.TypeCounter.Add(counter);
            }
            else
            {
                counter.circuitCounter++;
            }

            string paddedCounter = counter.circuitCounter.ToString("D2");
            circuit.CircuitKey = $"CR{paddedCounter}";
            // circuit.IsActive = true;

            _context.Circuits.Add(circuit);
            await _context.SaveChangesAsync();
            return circuit;
        }

        public async Task<Step> AddStepToCircuitAsync(Step step)
        {
            var circuit = await _context.Circuits
                .Include(c => c.Steps)
                .FirstOrDefaultAsync(c => c.Id == step.CircuitId);

            if (circuit == null)
                throw new KeyNotFoundException($"Circuit ID {step.CircuitId} not found");

            // Generate step key
            // Log the current state
            Console.WriteLine($"Circuit key: {circuit.CircuitKey}");
            Console.WriteLine($"Current step count: {circuit.Steps.Count}");

            // Count existing steps to determine next step number
            int stepCount = circuit.Steps.Count + 1;
            Console.WriteLine($"New step will be number: {stepCount}");

            // Generate the step key with proper incrementing number
            step.StepKey = $"{circuit.CircuitKey}-STEP{stepCount:D2}";
            Console.WriteLine($"Generated step key: {step.StepKey}");

            // Set new step's order index
            step.OrderIndex = stepCount;
            
            // If HasOrderedFlow, link to previous step
            if (circuit.HasOrderedFlow && circuit.Steps.Any())
            {
                var previousSteps = circuit.Steps.OrderByDescending(s => s.OrderIndex).ToList();
                var previousStep = previousSteps.FirstOrDefault();
                // Update relationships for ordered flow
                if (previousStep != null)
                {
                    // Set this new step's previous step reference
                    step.PrevStepId = previousStep.Id;

                    // Update previous step's next reference
                    // Save first to get an ID for the new step
                    _context.Steps.Add(step);
                    await _context.SaveChangesAsync();

                    var prevStep = await _context.Steps.FindAsync(previousStep.Id);
                    if (prevStep != null)
                    {
                        prevStep.NextStepId = step.Id;
                        _context.Entry(prevStep).State = EntityState.Modified;
                        await _context.SaveChangesAsync();
                    }

                    return step;
                }
            }

            _context.Steps.Add(step);
            await _context.SaveChangesAsync();

            // Verify the step was saved correctly
            var savedStep = await _context.Steps.FindAsync(step.Id);
            Console.WriteLine($"Saved step key: {savedStep!.StepKey}");
            
            // Update step links to maintain the proper workflow
            if (circuit.HasOrderedFlow)
            {
                await UpdateStepLinksAsync(step.CircuitId);
            }
            
            return step;
        }

        public async Task<bool> UpdateStepOrderAsync(int circuitId, List<StepOrderUpdateDto> stepOrders)
        {
            var circuit = await _context.Circuits
                .Include(c => c.Steps)
                .FirstOrDefaultAsync(c => c.Id == circuitId);

            if (circuit == null)
                throw new KeyNotFoundException($"Circuit ID {circuitId} not found");

            // Start a transaction for updating all steps
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var stepOrder in stepOrders)
                {
                    var step = await _context.Steps.FindAsync(stepOrder.StepId);
                    if (step == null || step.CircuitId != circuitId)
                        throw new InvalidOperationException($"Step ID {stepOrder.StepId} not found in circuit {circuitId}");

                    step.OrderIndex = stepOrder.OrderIndex;
                }

                // If circuit has ordered flow, update Next/Prev relationships
                if (circuit.HasOrderedFlow)
                {
                    await UpdateStepLinksAsync(circuitId);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        
        // Call this method after any operation that modifies steps in a circuit
        public async Task UpdateStepLinksAsync(int circuitId)
        {
            var steps = await _context.Steps
                .Where(s => s.CircuitId == circuitId)
                .OrderBy(s => s.OrderIndex)
                .ToListAsync();
            
            // Clear existing links first
            foreach (var step in steps)
            {
                step.NextStepId = null;
                step.PrevStepId = null;
                step.IsFinalStep = false;
            }
            
            // Set the links based on OrderIndex
            for (int i = 0; i < steps.Count; i++)
            {
                // Set previous step link (if not first)
                if (i > 0)
                {
                    steps[i].PrevStepId = steps[i-1].Id;
                }
                
                // Set next step link (if not last)
                if (i < steps.Count - 1)
                {
                    steps[i].NextStepId = steps[i+1].Id;
                }
                else
                {
                    // Mark the last step as final
                    steps[i].IsFinalStep = true;
                }
            }
            
            await _context.SaveChangesAsync();
        }
        
        // Use this method to update all step links in all circuits that have ordered flow
        public async Task UpdateAllCircuitStepLinksAsync()
        {
            var orderedFlowCircuits = await _context.Circuits
                .Where(c => c.HasOrderedFlow)
                .Select(c => c.Id)
                .ToListAsync();
                
            foreach (var circuitId in orderedFlowCircuits)
            {
                await UpdateStepLinksAsync(circuitId);
            }
        }
    }
}