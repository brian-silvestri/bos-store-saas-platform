-- Script para crear usuario SuperAdmin
-- Password: SuperAdmin123! (hasheado con BCrypt)

INSERT INTO "Users" (
    "Id",
    "TenantId",
    "Email",
    "PasswordHash",
    "Role",
    "Name",
    "CreatedAt",
    "UpdatedAt"
) VALUES (
    gen_random_uuid()::text,
    'global',
    'superadmin@bosstore.com',
    '$2a$11$XJZ9H.Nx8mHmK5qYk7yKzOr7qV3qWuKH4JJQx6vYqMZqXQJZ7.Yxe',
    'SuperAdmin',
    'Super Admin',
    NOW(),
    NOW()
) ON CONFLICT ("Email") DO UPDATE SET
    "Role" = 'SuperAdmin',
    "UpdatedAt" = NOW();

-- Verificar que se creó
SELECT "Id", "Email", "Role", "Name" FROM "Users" WHERE "Email" = 'superadmin@bosstore.com';
