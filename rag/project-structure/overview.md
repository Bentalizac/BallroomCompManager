shared -> defines domain models. Source of truth for domain types
server -> maps domain <-> database and exposes API via tRPC
client -> consumes API, provides user interface, uses domain models
