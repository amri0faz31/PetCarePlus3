# Architecture (Modular Monolith)

Projects:

- PetCare.Api — HTTP controllers, middleware, DI composition.
- PetCare.Application — use-cases (commands/queries), DTOs, validation, ports.
- PetCare.Domain — entities/value objects (no EF).
- PetCare.Infrastructure — EF Core (DbContext + Migrations), repositories, Identity/JWT (later).

Dependencies: Api → Application → Domain; Api → Infrastructure → Domain (Application never references Infrastructure).

Request flow: Controller → Application Handler → Repository interface → EF implementation → MySQL → DTO → Controller.
