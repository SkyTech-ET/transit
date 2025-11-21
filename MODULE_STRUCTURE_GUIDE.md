# 📋 **MODULE STRUCTURE GUIDE**

This document defines the **standard structure** that ALL modules must follow, based on the User module pattern.

---

## 🏗️ **COMPLETE MODULE STRUCTURE**

### **1. Domain Layer** (`Transit.Domain/Models/[Module]/`)
```
Transit.Domain/Models/
├── UserAccount/          # User module domain models
│   ├── User.cs
│   ├── Role.cs
│   └── ...
└── MOT/                  # MOT module domain models
    ├── Customer.cs
    ├── Service.cs
    └── ...
```

**Pattern:**
- Domain models inherit from `BaseEntity`
- Use private setters with public properties
- Include factory methods (e.g., `Create()`, `CreateUser()`)
- Include domain methods for business logic

---

### **2. Application Layer - Commands** (`Transit.Application/Commands/[Module]/`)
```
Transit.Application/Commands/
├── User Account/
│   ├── CreateUserCommand.cs
│   ├── LoginUserCommand.cs
│   └── ...
└── Service/
    ├── CreateServiceRequestCommand.cs
    ├── UpdateServiceCommand.cs
    └── ...
```

**Pattern:**
- Commands implement `IRequest<OperationResult<T>>`
- Include all properties needed for the operation
- Use proper namespaces: `namespace Transit.Application;`
- Add using directives for domain models: `using Transit.Domain.Models.MOT;`

**Example:**
```csharp
using Transit.Domain.Models.MOT;

namespace Transit.Application;

public class CreateServiceRequestCommand : IRequest<OperationResult<Service>>
{
    public long CustomerId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    // ... other properties
}
```

---

### **3. Application Layer - Queries** (`Transit.Application/Queries/[Module]/`)
```
Transit.Application/Queries/
├── Account Managment/
│   ├── GetAllUsersQuery.cs
│   └── ...
└── Service/
    ├── GetAllServicesQuery.cs
    ├── GetServiceByIdQuery.cs
    └── ...
```

**Pattern:**
- Queries implement `IRequest<OperationResult<T>>`
- Include filter/search parameters
- Use proper namespaces

**Example:**
```csharp
using Transit.Domain.Models.Shared;

namespace Transit.Application;

public class GetAllUsersQuery : IRequest<OperationResult<List<User>>>
{
    public RecordStatus? RecordStatus { get; set; }
}
```

---

### **4. Application Layer - Handlers** (`Transit.Application/Handlers/[Module]/`)
```
Transit.Application/Handlers/
├── UserAccount/
│   ├── CreateUserCommandHandler.cs
│   ├── GetAllUsersQueryHandler.cs
│   └── ...
└── Service/
    ├── CreateServiceRequestCommandHandler.cs
    ├── GetAllServicesQueryHandler.cs
    └── ...
```

**Pattern:**
- Handlers are `internal` classes
- Implement `IRequestHandler<TRequest, TResult>`
- Use dependency injection for `ApplicationDbContext` and services
- Return `OperationResult<T>`
- Handle errors using `result.AddError(ErrorCode, message)`

**Example:**
```csharp
using Transit.Domain;
using Transit.Domain.Models.MOT;

namespace Transit.Application;

internal class CreateServiceRequestCommandHandler 
    : IRequestHandler<CreateServiceRequestCommand, OperationResult<Service>>
{
    private readonly ApplicationDbContext _context;
    
    public CreateServiceRequestCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<OperationResult<Service>> Handle(
        CreateServiceRequestCommand request, 
        CancellationToken cancellationToken)
    {
        var result = new OperationResult<Service>();
        // ... implementation
        return result;
    }
}
```

---

### **5. API Layer - DTOs** (`Transit.API/DTO/[Module]/`)
```
Transit.API/DTO/
├── User/
│   ├── Request/
│   │   ├── UserRequest.cs
│   │   ├── UpdateUserRequest.cs
│   │   └── ...
│   └── Response/
│       ├── UserDetail.cs
│       ├── UserLoginResponse.cs
│       └── ...
└── MOT/
    ├── Request/
    │   ├── CreateServiceRequest.cs
    │   ├── UpdateServiceRequest.cs
    │   └── ...
    └── Response/
        ├── ServiceDetail.cs
        ├── CustomerDetail.cs
        └── ...
```

**Pattern:**
- **Request DTOs**: `namespace Transit.Api.Contracts.[Module].Request;`
- **Response DTOs**: `namespace Transit.Api.Contracts.[Module].Response;`
- Separate Request and Response folders
- Use descriptive names (e.g., `UserRequest`, `ServiceDetail`)

**Example Request:**
```csharp
using Transit.Domain.Models.Shared;

namespace Transit.Api.Contracts.MOT.Request;

public class CreateServiceRequest
{
    public string ItemDescription { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
    // ... other properties
}
```

**Example Response:**
```csharp
namespace Transit.Api.Contracts.MOT.Response;

public class ServiceDetail
{
    public long Id { get; set; }
    public string ServiceNumber { get; set; } = string.Empty;
    // ... other properties
}
```

---

### **6. API Layer - Controllers** (`Transit.API/Controllers/[Module]/`)
```
Transit.API/Controllers/
├── User Account/
│   ├── UserController.cs
│   └── ...
└── MOT/
    ├── ServiceController.cs
    ├── CustomerController.cs
    └── ...
```

**Pattern:**
- Inherit from `BaseController`
- Use `[ApiController]` and `[Route("api/v1/[controller]")]`
- Inject `IMediator` via `_mediator` (from BaseController)
- Use Mapster for DTO mapping: `request.Adapt<Command>()`
- Use proper DTO namespaces: `using Transit.Api.Contracts.[Module].Request;`
- Return `HandleSuccessResponse()` or `HandleErrorResponse()`

**Example:**
```csharp
using Microsoft.AspNetCore.Mvc;
using Transit.Controllers;
using Transit.Application;
using Transit.Api.Contracts.MOT.Request;
using Transit.Api.Contracts.MOT.Response;
using Mapster;

namespace Transit.API.Controllers.MOT;

[ApiController]
[Route("api/v1/[controller]")]
public class ServiceController : BaseController
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ServiceController(
        ApplicationDbContext context, 
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpPost("Create")]
    public async Task<IActionResult> Create([FromBody] CreateServiceRequest request)
    {
        var command = request.Adapt<CreateServiceRequestCommand>();
        var result = await _mediator.Send(command);
        
        return result.IsError 
            ? HandleErrorResponse(result.Errors) 
            : HandleSuccessResponse(result.Payload);
    }
}
```

---

## ✅ **KEY PRINCIPLES**

### **1. CQRS Pattern**
- **Commands** for write operations (Create, Update, Delete)
- **Queries** for read operations (GetAll, GetById)
- All operations go through MediatR

### **2. Separation of Concerns**
- **Domain Models**: Business logic and entities
- **Commands/Queries**: Request definitions
- **Handlers**: Business logic implementation
- **DTOs**: API contracts (Request/Response)
- **Controllers**: HTTP endpoints only

### **3. Consistent Naming**
- Commands: `[Action][Entity]Command` (e.g., `CreateUserCommand`)
- Queries: `[Action][Entity]Query` (e.g., `GetAllUsersQuery`)
- Handlers: `[Command/Query]Handler` (e.g., `CreateUserCommandHandler`)
- DTOs: `[Action][Entity]Request/Response` (e.g., `UserRequest`, `UserDetail`)

### **4. No Inline DTOs**
- ❌ **Never** define DTOs inside controllers
- ✅ **Always** create separate DTO files in `DTO/[Module]/Request/` or `Response/`

### **5. Consistent Namespaces**
- Domain: `Transit.Domain.Models.[Module]`
- Application: `Transit.Application`
- DTOs: `Transit.Api.Contracts.[Module].Request/Response`
- Controllers: `Transit.API.Controllers.[Module]` or `Transit.Controllers`

---

## 📝 **CHECKLIST FOR NEW MODULES**

When creating a new module, ensure:

- [ ] Domain models in `Transit.Domain/Models/[Module]/`
- [ ] Commands in `Transit.Application/Commands/[Module]/`
- [ ] Queries in `Transit.Application/Queries/[Module]/`
- [ ] Handlers in `Transit.Application/Handlers/[Module]/`
- [ ] Request DTOs in `Transit.API/DTO/[Module]/Request/`
- [ ] Response DTOs in `Transit.API/DTO/[Module]/Response/`
- [ ] Controllers in `Transit.API/Controllers/[Module]/`
- [ ] All handlers are `internal`
- [ ] All commands/queries implement `IRequest<OperationResult<T>>`
- [ ] Controllers use `_mediator.Send()` for all operations
- [ ] Controllers use Mapster for DTO mapping
- [ ] No inline DTOs in controllers
- [ ] Proper using directives in all files

---

## 🎯 **CURRENT STATUS**

### ✅ **User Module** - Complete (Reference Implementation)
- Domain: ✅
- Commands: ✅
- Queries: ✅
- Handlers: ✅
- DTOs: ✅
- Controllers: ✅

### ✅ **MOT Modules** - Restructured
- **Service**: ✅ Restructured
- **Customer**: ✅ Restructured
- **Manager**: ✅ Restructured
- **Assessor**: ✅ Restructured
- **CaseExecutor**: ✅ Restructured

---

## 📚 **REFERENCE FILES**

**User Module (Reference):**
- Domain: `Transit.Domain/Models/UserAccount/User.cs`
- Command: `Transit.Application/Commands/User Account/CreateUserCommand.cs`
- Query: `Transit.Application/Queries/Account Managment/GetAllUsersQuery.cs`
- Handler: `Transit.Application/Handlers/UserAccount/CreateUserCommandHandler.cs`
- DTO: `Transit.API/DTO/User/Request/UserRequest.cs`
- Controller: `Transit.API/Controllers/User Account/UserController.cs`

---

**Last Updated:** All modules now follow the User module structure pattern.


