# Utilities Documentation

## Overview
The utils folder contains utility classes and helper functions that provide common functionality across the Document Management System. These utilities handle authentication, data mapping, calculations, password generation, and console output formatting.

## Table of Contents
1. [Utility Architecture](#utility-architecture)
2. [Authentication Utilities](#authentication-utilities)
3. [Data Mapping Utilities](#data-mapping-utilities)
4. [Calculation Utilities](#calculation-utilities)
5. [Security Utilities](#security-utilities)
6. [Console Utilities](#console-utilities)
7. [Usage Patterns](#usage-patterns)
8. [Best Practices](#best-practices)

---

## Utility Architecture

### Design Principles
- **Static Classes**: Most utilities are static for easy access
- **Pure Functions**: Utilities avoid side effects where possible
- **Reusability**: Common functionality extracted into utilities
- **Performance**: Optimized for frequent use
- **Testing**: Utilities are easily unit testable

### File Organization

| File | Purpose | Category |
|------|---------|----------|
| `AuthHelper.cs` | Authentication and JWT utilities | Security |
| `Mappings.cs` | Entity to DTO mapping expressions | Data Transformation |
| `LigneCalculations.cs` | Financial calculations for document lines | Business Logic |
| `GeneratePassword.cs` | Secure password generation | Security |
| `ConsoleColorHelper.cs` | Console output formatting | Development/Debugging |

---

## Authentication Utilities

### AuthHelper
**File**: `AuthHelper.cs` (138 lines)
**Purpose**: Provides authentication-related utility functions including JWT token generation, email services, and password validation.

#### Password Validation
```csharp
public static bool IsValidPassword(string password)
{
    return password.Length >= 8 && 
           password.Any(char.IsLower) &&
           password.Any(char.IsUpper) && 
           password.Any(char.IsDigit) &&
           password.Any(ch => !char.IsLetterOrDigit(ch));
}
```

**Validation Rules**:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter  
- At least one digit
- At least one special character

#### JWT Token Generation
```csharp
public static string GenerateAccessToken(User user)
{
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET");
    if (string.IsNullOrEmpty(secretKey))
        throw new InvalidOperationException("JWT configuration is missing.");
    
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
    
    var claims = new[] {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim("Username", user.Username),
        new Claim("IsActive", user.IsActive.ToString()),
        new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "SimpleUser")
    };
    
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var expMinutes = 480; // 8 hours
    
    var token = new JwtSecurityToken(
        issuer: Environment.GetEnvironmentVariable("ISSUER"),
        audience: Environment.GetEnvironmentVariable("AUDIENCE"), 
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expMinutes),
        signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

**Features**:
- Environment-based configuration
- Extended 8-hour expiration
- Role-based claims
- User status tracking

#### Refresh Token Generation
```csharp
public static string GenerateRefreshToken()
{
    return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
}
```

**Purpose**: Creates secure, unique refresh tokens for JWT renewal

#### Email Service
```csharp
public static void SendEmail(string to, string subject, string body)
{
    try
    {
        string? emailAddress = Environment.GetEnvironmentVariable("EMAIL_ADDRESS");
        string? emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");
        
        if (string.IsNullOrEmpty(emailAddress) || string.IsNullOrEmpty(emailPassword))
            throw new InvalidOperationException("Email configuration missing.");
        
        using (var smtp = new SmtpClient("smtp.gmail.com", 587))
        {
            smtp.Credentials = new NetworkCredential(emailAddress, emailPassword);
            smtp.EnableSsl = true;
            
            var message = new MailMessage
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
                From = new MailAddress(emailAddress)
            };
            message.To.Add(to);
            
            smtp.Send(message);
        }
    }
    catch (Exception ex) 
    { 
        Console.WriteLine($"Email send failed: {ex.Message}"); 
    }
}
```

**Configuration**:
- Gmail SMTP integration
- Environment variable configuration
- HTML email support
- Error handling with logging

#### Email Template Generation
```csharp
public static string CreateEmailBody(string verificationLink, string verificationCode)
{
    return $@"
        <html>
        <head>
            <style>
                .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .code {{ font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; }}
                .footer {{ background-color: #f8f9fa; padding: 20px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>DocuVerse Email Verification</h1>
                </div>
                <div class='content'>
                    <p>Welcome to DocuVerse! Please verify your email address to complete your registration.</p>
                    <div class='code'>{verificationCode}</div>
                    <p>Or click the link below:</p>
                    <p><a href='{verificationLink}'>Verify Email Address</a></p>
                    <p>This verification code will expire in 24 hours.</p>
                </div>
                <div class='footer'>
                    <p>Thank you for choosing DocuVerse!</p>
                </div>
            </div>
        </body>
        </html>";
}
```

**Features**:
- Professional HTML email template
- Dual verification methods (code and link)
- Responsive design
- Branded styling

---

## Data Mapping Utilities

### Mappings
**File**: `Mappings.cs` (432 lines)
**Purpose**: Provides Entity Framework-compatible expression mappings for converting entities to DTOs efficiently.

#### Expression-Based Mapping
```csharp
public static class LigneMappings
{
    public static Expression<Func<Ligne, LigneDto>> ToLigneDto = l => new LigneDto
    {
        Id = l.Id,
        DocumentId = l.DocumentId,
        LigneKey = l.LigneKey,
        Title = l.Title,
        Article = l.Article,
        Prix = l.Prix,
        SousLignesCount = l.SousLignes.Count,
        
        // Complex nested mapping
        LignesElementType = l.LignesElementType == null ? null : new LignesElementTypeDto
        {
            Id = l.LignesElementType.Id,
            Code = l.LignesElementType.Code,
            TypeElement = l.LignesElementType.TypeElement.ToString(),
            Description = l.LignesElementType.Description,
            TableName = l.LignesElementType.TableName,
            CreatedAt = l.LignesElementType.CreatedAt,
            UpdatedAt = l.LignesElementType.UpdatedAt
        },
        
        // Conditional mapping based on element type
        ItemCode = l.Item != null ? l.Item.Code : 
                  (l.LignesElementType != null ? l.LignesElementType.ItemCode : null),
                  
        Item = l.Item != null ? new ItemDto
        {
            Code = l.Item.Code,
            Description = l.Item.Description,
            Unite = l.Item.Unite,
            // Nested unit mapping
            UniteCodeNavigation = l.Item.UniteCodeNavigation == null ? null : new UniteCodeDto
            {
                Code = l.Item.UniteCodeNavigation.Code,
                Description = l.Item.UniteCodeNavigation.Description,
                CreatedAt = l.Item.UniteCodeNavigation.CreatedAt,
                UpdatedAt = l.Item.UniteCodeNavigation.UpdatedAt,
                ItemsCount = l.Item.UniteCodeNavigation.Items.Count()
            },
            CreatedAt = l.Item.CreatedAt,
            UpdatedAt = l.Item.UpdatedAt,
            ElementTypesCount = l.Item.LignesElementTypes.Count()
        } : null
    };
}
```

**Advantages of Expression Mapping**:
- **Database Efficiency**: Translates to SQL SELECT clauses
- **Type Safety**: Compile-time checking of mappings
- **Performance**: No additional database queries
- **Maintainability**: Clear mapping definitions

#### Document Mapping
```csharp
public static class DocumentMappings
{
    public static Expression<Func<Document, DocumentDto>> ToDocumentDto =>
        d => new DocumentDto
        {
            Id = d.Id,
            DocumentKey = d.DocumentKey,
            DocumentAlias = d.DocumentAlias,
            Title = d.Title,
            Content = d.Content,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt,
            DocDate = d.DocDate,
            ComptableDate = d.ComptableDate,
            DocumentExterne = d.DocumentExterne,
            Status = d.Status,
            TypeId = d.TypeId,
            
            // Document type mapping
            DocumentType = d.DocumentType == null ? null : new DocumentTypeDto
            {
                TypeNumber = d.DocumentType.TypeNumber,
                TypeKey = d.DocumentType.TypeKey,
                TypeName = d.DocumentType.TypeName,
                TypeAttr = d.DocumentType.TypeAttr,
                TierType = d.DocumentType.TierType
            },
            
            // Creator mapping
            CreatedBy = d.CreatedBy == null ? null : new DocumentUserDto
            {
                Email = d.CreatedBy.Email,
                Username = d.CreatedBy.Username,
                FirstName = d.CreatedBy.FirstName,
                LastName = d.CreatedBy.LastName,
                Role = d.CreatedBy.Role != null ? d.CreatedBy.Role.RoleName : string.Empty,
                UserType = d.CreatedBy.UserType
            },
            
            // Counts and relationships
            LignesCount = d.Lignes.Count,
            SousLignesCount = d.Lignes.SelectMany(l => l.SousLignes).Count(),
            
            // Circuit and workflow information
            CircuitId = d.CircuitId,
            Circuit = d.Circuit == null ? null : new CircuitDto
            {
                Id = d.Circuit.Id,
                CircuitKey = d.Circuit.CircuitKey,
                Title = d.Circuit.Title,
                IsActive = d.Circuit.IsActive
            },
            
            CurrentStepId = d.CurrentStepId,
            CurrentStepTitle = d.CurrentStep != null ? d.CurrentStep.Title : string.Empty,
            CurrentStatusId = d.CurrentStatusId,
            CurrentStatusTitle = d.CurrentStatus != null ? d.CurrentStatus.Title : string.Empty,
            IsCircuitCompleted = d.IsCircuitCompleted,
            
            // ERP integration
            ERPDocumentCode = d.ERPDocumentCode
        };
}
```

#### User Mapping
```csharp
public static class UserMappings
{
    public static Expression<Func<User, UserDto>> ToUserDto =>
        u => new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            Username = u.Username,
            FirstName = u.FirstName,
            LastName = u.LastName,
            UserType = u.UserType,
            City = u.City,
            Address = u.Address,
            PhoneNumber = u.PhoneNumber,
            Country = u.Country,
            Website = u.WebSite,
            Identity = u.Identity,
            IsEmailConfirmed = u.IsEmailConfirmed,
            IsPhoneVerified = u.IsPhoneVerified,
            CreatedAt = u.CreatedAt,
            IsActive = u.IsActive,
            IsOnline = u.IsOnline,
            LastLogin = u.LastLogin,
            ProfilePicture = u.ProfilePicture,
            BackgroundPicture = u.BackgroundPicture,
            RoleId = u.RoleId,
            Role = u.Role != null ? u.Role.RoleName : string.Empty,
            ResponsibilityCentreId = u.ResponsibilityCentreId,
            ResponsibilityCentreName = u.ResponsibilityCentre != null ? u.ResponsibilityCentre.Descr : null
        };
}
```

#### Usage in Controllers
```csharp
// Efficient database query with mapping
var documents = await _context.Documents
    .Include(d => d.DocumentType)
    .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
    .Include(d => d.Circuit)
    .Where(d => d.Status == 1)
    .Select(DocumentMappings.ToDocumentDto)
    .ToListAsync();
```

---

## Calculation Utilities

### LigneCalculations
**File**: `LigneCalculations.cs` (143 lines)
**Purpose**: Handles financial calculations for document lines including unit conversions, discounts, VAT, and totals.

#### Main Calculation Method
```csharp
public static async Task<LigneCalculationResult> CalculateAmountsAsync(
    ApplicationDbContext context,
    decimal quantity,
    decimal priceHT,
    decimal discountPercentage,
    decimal? discountAmount,
    decimal vatPercentage,
    string? unitCode = null,
    string? elementCode = null,
    int? lignesElementTypeId = null)
{
    // Step 1: Apply unit conversion to get adjusted price
    decimal adjustedPriceHT = await ApplyUnitConversionAsync(
        context, priceHT, unitCode, elementCode, lignesElementTypeId);

    // Step 2: Calculate subtotal with adjusted price
    decimal subtotal = quantity * adjustedPriceHT;

    // Step 3: Calculate discount amount
    decimal calculatedDiscountAmount;
    if (discountAmount.HasValue && discountAmount.Value > 0)
    {
        calculatedDiscountAmount = discountAmount.Value;
    }
    else
    {
        calculatedDiscountAmount = subtotal * discountPercentage;
    }

    // Step 4: Calculate final amounts
    decimal amountHT = subtotal - calculatedDiscountAmount;
    decimal amountVAT = amountHT * vatPercentage;
    decimal amountTTC = amountHT + amountVAT;

    return new LigneCalculationResult
    {
        AdjustedPriceHT = adjustedPriceHT,
        Subtotal = subtotal,
        DiscountAmount = calculatedDiscountAmount,
        AmountHT = amountHT,
        AmountVAT = amountVAT,
        AmountTTC = amountTTC,
        UnitConversionFactor = adjustedPriceHT / priceHT
    };
}
```

#### Unit Conversion Logic
```csharp
private static async Task<decimal> ApplyUnitConversionAsync(
    ApplicationDbContext context,
    decimal priceHT,
    string? unitCode,
    string? elementCode,
    int? lignesElementTypeId)
{
    // No conversion needed if parameters missing
    if (string.IsNullOrEmpty(unitCode) || 
        string.IsNullOrEmpty(elementCode) || 
        !lignesElementTypeId.HasValue)
    {
        return priceHT;
    }

    // Get element type with item details
    var elementType = await context.LignesElementTypes
        .Include(let => let.Item)
        .FirstOrDefaultAsync(let => let.Id == lignesElementTypeId.Value);

    // Only apply conversion for Item types
    if (elementType?.TypeElement != ElementType.Item || elementType.Item == null)
    {
        return priceHT;
    }

    // Get item's default unit
    var defaultUnitCode = elementType.Item.Unite;
    
    // No conversion needed if using default unit
    if (string.IsNullOrEmpty(defaultUnitCode) || unitCode == defaultUnitCode)
    {
        return priceHT;
    }

    // Get unit conversion factor
    var itemUnit = await context.ItemUnitOfMeasures
        .FirstOrDefaultAsync(ium => ium.ItemCode == elementCode && 
                                   ium.UnitOfMeasureCode == unitCode);

    if (itemUnit == null)
    {
        return priceHT; // No conversion data available
    }

    // Apply conversion factor
    return priceHT * itemUnit.QtyPerUnitOfMeasure;
}
```

#### Calculation Result Model
```csharp
public class LigneCalculationResult
{
    public decimal AdjustedPriceHT { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal AmountHT { get; set; }
    public decimal AmountVAT { get; set; }
    public decimal AmountTTC { get; set; }
    public decimal UnitConversionFactor { get; set; }
}
```

#### Usage Examples
```csharp
// Calculate amounts for new line
var result = await LigneCalculations.CalculateAmountsAsync(
    _context,
    quantity: 10,
    priceHT: 25.00m,
    discountPercentage: 0.05m, // 5%
    discountAmount: null,
    vatPercentage: 0.20m, // 20%
    unitCode: "BOX",
    elementCode: "ITEM001",
    lignesElementTypeId: 1
);

// Calculate for existing ligne
var existingResult = await LigneCalculations.CalculateAmountsForLigneAsync(_context, ligne);
```

**Calculation Flow**:
1. **Unit Conversion**: Adjust price based on unit of measure
2. **Subtotal**: quantity × adjusted price
3. **Discount**: Apply percentage or fixed amount
4. **Amount HT**: Subtotal minus discount (before tax)
5. **VAT Amount**: Amount HT × VAT percentage
6. **Amount TTC**: Amount HT + VAT Amount (total including tax)

---

## Security Utilities

### GeneratePassword
**File**: `GeneratePassword.cs` (61 lines)
**Purpose**: Generates cryptographically secure random passwords with customizable complexity.

#### Password Generation
```csharp
public static string GenerateRandomPassword(int length = 12)
{
    if (length < 8)
        throw new ArgumentException("Password length must be at least 8 characters.");

    var passwordChars = new char[length];
    
    // Ensure at least one character from each required category
    passwordChars[0] = GetRandomChar(LowercaseLetters);
    passwordChars[1] = GetRandomChar(UppercaseLetters);
    passwordChars[2] = GetRandomChar(Digits);
    passwordChars[3] = GetRandomChar(SpecialCharacters);

    // Fill remaining positions with random characters from all categories
    var allCharacters = LowercaseLetters
        .Concat(UppercaseLetters)
        .Concat(Digits)
        .Concat(SpecialCharacters)
        .ToArray();

    for (int i = 4; i < length; i++)
        passwordChars[i] = GetRandomChar(allCharacters);

    // Shuffle to avoid predictable patterns
    Shuffle(passwordChars);

    return new string(passwordChars);
}
```

#### Character Sets
```csharp
private static readonly char[] LowercaseLetters = "abcdefghijklmnopqrstuvwxyz".ToCharArray();
private static readonly char[] UppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();
private static readonly char[] Digits = "0123456789".ToCharArray();
private static readonly char[] SpecialCharacters = "!@#$%^&*()-_=+[]{}|;:,.<>/?".ToCharArray();
```

#### Cryptographic Random Selection
```csharp
private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();

private static char GetRandomChar(char[] characters) 
{
    byte[] randomNumber = new byte[1];
    Rng.GetBytes(randomNumber);
    return characters[randomNumber[0] % characters.Length];
}

private static void Shuffle(char[] array) 
{
    int n = array.Length;
    while (n > 1)
    {
        byte[] randomNumber = new byte[1];
        Rng.GetBytes(randomNumber);
        int k = randomNumber[0] % n;
        n--;
        char value = array[k];
        array[k] = array[n];
        array[n] = value;
    }
}
```

**Security Features**:
- **Cryptographic RNG**: Uses `RandomNumberGenerator` for secure randomness
- **Character Requirements**: Guarantees complexity rules
- **Fisher-Yates Shuffle**: Prevents predictable patterns
- **Configurable Length**: Supports passwords from 8+ characters

#### Usage Examples
```csharp
// Generate default 12-character password
string password = PasswordGenerator.GenerateRandomPassword();

// Generate longer password for high-security accounts
string strongPassword = PasswordGenerator.GenerateRandomPassword(16);

// Example output: "Kp3$mN9@xQw2"
```

---

## Console Utilities

### ConsoleColorHelper
**File**: `ConsoleColorHelper.cs` (56 lines)
**Purpose**: Provides colored console output for development and debugging.

#### Colored Output Methods
```csharp
public static class ConsoleColorHelper
{
    public static void WriteSuccess(string message)
    {
        WriteWithColor(message, ConsoleColor.Green);
    }

    public static void WriteError(string message)
    {
        WriteWithColor(message, ConsoleColor.Red);
    }

    public static void WriteWarning(string message)
    {
        WriteWithColor(message, ConsoleColor.Yellow);
    }

    public static void WriteInfo(string message)
    {
        WriteWithColor(message, ConsoleColor.Cyan);
    }

    public static void WriteDebug(string message)
    {
        WriteWithColor(message, ConsoleColor.Gray);
    }

    private static void WriteWithColor(string message, ConsoleColor color)
    {
        var originalColor = Console.ForegroundColor;
        try
        {
            Console.ForegroundColor = color;
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {message}");
        }
        finally
        {
            Console.ForegroundColor = originalColor;
        }
    }
}
```

#### Advanced Formatting
```csharp
public static void WriteTable<T>(IEnumerable<T> items, params string[] headers)
{
    if (!items.Any()) return;

    var properties = typeof(T).GetProperties();
    var columnWidths = headers.Select(h => Math.Max(h.Length, 
        items.Max(item => properties.FirstOrDefault(p => p.Name == h)
            ?.GetValue(item)?.ToString()?.Length ?? 0))).ToArray();

    // Print headers
    WriteWithColor(string.Join(" | ", headers.Select((h, i) => h.PadRight(columnWidths[i]))), 
                   ConsoleColor.White);
    
    WriteWithColor(new string('-', columnWidths.Sum() + (headers.Length - 1) * 3), 
                   ConsoleColor.Gray);

    // Print rows
    foreach (var item in items)
    {
        var values = headers.Select((h, i) => 
            (properties.FirstOrDefault(p => p.Name == h)?.GetValue(item)?.ToString() ?? "")
            .PadRight(columnWidths[i]));
        
        Console.WriteLine(string.Join(" | ", values));
    }
}
```

#### Usage Examples
```csharp
// Simple colored messages
ConsoleColorHelper.WriteSuccess("Operation completed successfully!");
ConsoleColorHelper.WriteError("Failed to process request");
ConsoleColorHelper.WriteWarning("Deprecated method used");
ConsoleColorHelper.WriteInfo("Processing 150 records...");
ConsoleColorHelper.WriteDebug("Variable X = 42");

// Table output
var users = GetUsers();
ConsoleColorHelper.WriteTable(users, "Id", "Username", "Email", "IsActive");
```

---

## Usage Patterns

### Authentication Flow
```csharp
// Controller usage
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    // 1. Validate password
    if (!AuthHelper.IsValidPassword(request.Password))
        return BadRequest("Password does not meet requirements");
    
    // 2. Authenticate user
    var user = await AuthenticateUserAsync(request.Email, request.Password);
    if (user == null)
        return Unauthorized("Invalid credentials");
    
    // 3. Generate tokens
    var accessToken = AuthHelper.GenerateAccessToken(user);
    var refreshToken = AuthHelper.GenerateRefreshToken();
    
    // 4. Send welcome email
    var emailBody = AuthHelper.CreateEmailBody($"https://app.com/welcome", "WELCOME");
    AuthHelper.SendEmail(user.Email, "Welcome to DocuVerse!", emailBody);
    
    return Ok(new { accessToken, refreshToken });
}
```

### Data Mapping Flow
```csharp
// Service usage
public async Task<List<DocumentDto>> GetDocumentsAsync(int userId)
{
    return await _context.Documents
        .Include(d => d.DocumentType)
        .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
        .Include(d => d.Circuit)
        .Where(d => d.CreatedByUserId == userId)
        .Select(DocumentMappings.ToDocumentDto)
        .ToListAsync();
}
```

### Calculation Flow
```csharp
// Line creation with calculations
[HttpPost("lignes")]
public async Task<IActionResult> CreateLigne([FromBody] CreateLigneRequest request)
{
    // Calculate amounts
    var calculation = await LigneCalculations.CalculateAmountsAsync(
        _context,
        request.Quantity,
        request.PriceHT,
        request.DiscountPercentage,
        request.DiscountAmount,
        request.VatPercentage,
        request.UnitCode,
        request.ElementCode,
        request.LignesElementTypeId
    );
    
    // Create ligne with calculated values
    var ligne = new Ligne
    {
        // ... other properties
        PriceHT = calculation.AdjustedPriceHT,
        AmountHT = calculation.AmountHT,
        AmountVAT = calculation.AmountVAT,
        AmountTTC = calculation.AmountTTC,
        DiscountAmount = calculation.DiscountAmount
    };
    
    _context.Lignes.Add(ligne);
    await _context.SaveChangesAsync();
    
    return Ok(ligne);
}
```

### Password Generation Flow
```csharp
// User creation with generated password
[HttpPost("users")]
public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
{
    // Generate secure password if not provided
    var password = string.IsNullOrEmpty(request.Password) 
        ? PasswordGenerator.GenerateRandomPassword(12)
        : request.Password;
    
    // Validate password strength
    if (!AuthHelper.IsValidPassword(password))
        return BadRequest("Password does not meet security requirements");
    
    // Create user with hashed password
    var user = new User
    {
        Email = request.Email,
        Username = request.Username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
    };
    
    // Send password via email if generated
    if (string.IsNullOrEmpty(request.Password))
    {
        var emailBody = $"Your temporary password is: {password}";
        AuthHelper.SendEmail(user.Email, "Account Created", emailBody);
    }
    
    return Ok("User created successfully");
}
```

---

## Best Practices

### Utility Design Guidelines

#### 1. Static vs Instance Methods
```csharp
// Good: Static for pure functions
public static class MathHelper
{
    public static decimal CalculatePercentage(decimal value, decimal percentage)
    {
        return value * (percentage / 100);
    }
}

// Good: Instance for stateful operations
public class CalculationService
{
    private readonly ApplicationDbContext _context;
    
    public async Task<decimal> CalculateWithDatabaseLookupAsync(int itemId)
    {
        // Requires database context
    }
}
```

#### 2. Error Handling
```csharp
// Good: Defensive programming
public static bool IsValidEmail(string email)
{
    if (string.IsNullOrWhiteSpace(email))
        return false;
    
    try
    {
        var addr = new MailAddress(email);
        return addr.Address == email;
    }
    catch
    {
        return false;
    }
}

// Good: Clear error messages
public static string GeneratePassword(int length)
{
    if (length < 8)
        throw new ArgumentException("Password length must be at least 8 characters", nameof(length));
    
    if (length > 128)
        throw new ArgumentException("Password length cannot exceed 128 characters", nameof(length));
    
    // Implementation...
}
```

#### 3. Performance Considerations
```csharp
// Good: Reuse expensive resources
public static class EmailHelper
{
    private static readonly SmtpClient _smtpClient = CreateSmtpClient();
    
    private static SmtpClient CreateSmtpClient()
    {
        // Configure once, reuse many times
    }
}

// Good: Efficient string operations
public static string BuildEmailTemplate(string name, string content)
{
    var sb = new StringBuilder();
    sb.AppendLine($"<h1>Hello {name}</h1>");
    sb.AppendLine($"<p>{content}</p>");
    return sb.ToString();
}
```

#### 4. Testing Considerations
```csharp
// Good: Testable design
public static class PasswordHelper
{
    public static bool IsValidPassword(string password)
    {
        return HasMinimumLength(password) && 
               HasRequiredCharacterTypes(password);
    }
    
    // Internal methods for easier testing
    internal static bool HasMinimumLength(string password) => password?.Length >= 8;
    internal static bool HasRequiredCharacterTypes(string password) => /* validation logic */;
}

// Unit test
[Test]
public void IsValidPassword_WithValidPassword_ReturnsTrue()
{
    var result = PasswordHelper.IsValidPassword("SecureP@ss123");
    Assert.IsTrue(result);
}
```

#### 5. Configuration Management
```csharp
// Good: Environment-based configuration
public static class EmailConfig
{
    public static string SmtpServer => Environment.GetEnvironmentVariable("SMTP_SERVER") ?? "localhost";
    public static int SmtpPort => int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
    public static bool EnableSsl => bool.Parse(Environment.GetEnvironmentVariable("SMTP_SSL") ?? "true");
}

// Good: Fallback values
public static class AuthConfig
{
    public static int TokenExpirationMinutes => 
        int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION"), out var minutes) 
            ? minutes 
            : 480; // Default 8 hours
}
```

### Security Best Practices

#### 1. Secure Random Generation
```csharp
// Good: Cryptographic randomness
public static string GenerateSecureToken()
{
    using var rng = RandomNumberGenerator.Create();
    var bytes = new byte[32];
    rng.GetBytes(bytes);
    return Convert.ToBase64String(bytes);
}

// Bad: Predictable randomness
public static string GenerateWeakToken()
{
    var random = new Random(); // DON'T USE FOR SECURITY
    return random.Next().ToString();
}
```

#### 2. Input Validation
```csharp
// Good: Comprehensive validation
public static bool IsValidInput(string input)
{
    if (string.IsNullOrWhiteSpace(input))
        return false;
    
    if (input.Length > 1000) // Prevent DoS
        return false;
    
    // Check for malicious patterns
    var maliciousPatterns = new[] { "<script", "javascript:", "vbscript:" };
    return !maliciousPatterns.Any(pattern => input.Contains(pattern, StringComparison.OrdinalIgnoreCase));
}
```

#### 3. Sensitive Data Handling
```csharp
// Good: Clear sensitive data
public static void ProcessPassword(string password)
{
    try
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        // Use hash...
    }
    finally
    {
        // Clear password from memory
        if (password != null)
        {
            var span = password.AsSpan();
            span.Clear(); // Only works with Span<char> in newer .NET versions
        }
    }
}
```

This comprehensive utilities documentation provides developers with detailed understanding of the helper functions and common operations available throughout the Document Management System, ensuring consistent and secure implementation of common functionality. 