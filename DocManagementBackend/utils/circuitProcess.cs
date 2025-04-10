using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
public class CircuitProcessingService
{
    private readonly ApplicationDbContext _context;

    public CircuitProcessingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> AssignDocumentToCircuit(int documentId, int circuitId, int userId)
    {
        var document = await _context.Documents
            .Include(d => d.Circuit)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document == null)
            return false;

        var circuit = await _context.Circuits
            .Include(c => c.CircuitDetails.OrderBy(cd => cd.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == circuitId && c.IsActive);

        if (circuit == null || !circuit.CircuitDetails.Any())
            return false;
        document.CircuitId = circuitId;
        document.Circuit = circuit;

        var firstDetail = circuit.CircuitDetails.OrderBy(cd => cd.OrderIndex).First();
        document.CurrentCircuitDetailId = firstDetail.Id;
        document.CurrentCircuitDetail = firstDetail;
        document.IsCircuitCompleted = false;
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        var historyEntry = new DocumentCircuitHistory
        {
            DocumentId = documentId,
            Document = document,
            CircuitDetailId = firstDetail.Id,
            CircuitDetail = firstDetail,
            ProcessedByUserId = userId,
            ProcessedBy = user,
            ProcessedAt = DateTime.UtcNow,
            Comments = "Document assigned to circuit",
            IsApproved = true
        };

        _context.DocumentCircuitHistory.Add(historyEntry);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ProcessCircuitStep(int documentId, int userId, bool isApproved, string comments)
    {
        var document = await _context.Documents
            .Include(d => d.Circuit)
            .Include(d => d.CurrentCircuitDetail)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document == null || document.CircuitId == null || document.CurrentCircuitDetailId == null)
            return false;

        var circuit = await _context.Circuits
            .Include(c => c.CircuitDetails.OrderBy(cd => cd.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == document.CircuitId.Value);

        if (circuit == null)
            return false;
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        var circuitDetail = document.CurrentCircuitDetail;
        if (circuitDetail == null)
        {
            circuitDetail = await _context.CircuitDetails.FindAsync(document.CurrentCircuitDetailId);
            if (circuitDetail == null)
                return false;
        }

        var historyEntry = new DocumentCircuitHistory
        {
            DocumentId = documentId,
            Document = document,
            CircuitDetailId = document.CurrentCircuitDetailId.Value,
            CircuitDetail = circuitDetail, // Use the loaded circuit detail
            ProcessedByUserId = userId,
            ProcessedBy = user,
            ProcessedAt = DateTime.UtcNow,
            Comments = comments,
            IsApproved = isApproved
        };

        _context.DocumentCircuitHistory.Add(historyEntry);

        if (isApproved)
        {
            var currentDetail = document.CurrentCircuitDetail;
            var allDetails = circuit.CircuitDetails.OrderBy(cd => cd.OrderIndex).ToList();
            var currentIndex = currentDetail != null ? allDetails.FindIndex(cd => cd.Id == currentDetail.Id) : -1;

            if (currentIndex < allDetails.Count - 1)
            {
                var nextDetail = allDetails[currentIndex + 1];
                document.CurrentCircuitDetailId = nextDetail.Id;
                document.CurrentCircuitDetail = nextDetail;
            }
            else
            {
                document.IsCircuitCompleted = true;
                document.Status = 1;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<DocumentCircuitHistory>> GetDocumentCircuitHistory(int documentId)
    {
        return await _context.DocumentCircuitHistory
            .Where(h => h.DocumentId == documentId)
            .Include(h => h.CircuitDetail)
            .Include(h => h.ProcessedBy)
            .OrderBy(h => h.ProcessedAt)
            .ToListAsync();
    }
}