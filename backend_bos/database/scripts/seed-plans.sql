-- Script para crear los planes iniciales

-- Trial Plan (14 días)
INSERT INTO "Plans" (
    "Id",
    "Name",
    "Description",
    "Price",
    "DurationDays",
    "MaxUsers",
    "Features",
    "IsActive",
    "CreatedAt",
    "UpdatedAt"
) VALUES (
    'trial',
    'Trial',
    'Prueba gratuita de 14 días con funcionalidades básicas',
    0.00,
    14,
    1,
    '["basic", "orders", "products"]',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("Id") DO UPDATE SET
    "UpdatedAt" = NOW();

-- Pro Plan (30 días)
INSERT INTO "Plans" (
    "Id",
    "Name",
    "Description",
    "Price",
    "DurationDays",
    "MaxUsers",
    "Features",
    "IsActive",
    "CreatedAt",
    "UpdatedAt"
) VALUES (
    'pro',
    'Pro',
    'Plan profesional con todas las funcionalidades',
    29.99,
    30,
    5,
    '["basic", "orders", "products", "categories", "promotions", "analytics", "api"]',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("Id") DO UPDATE SET
    "UpdatedAt" = NOW();

-- Enterprise Plan (365 días)
INSERT INTO "Plans" (
    "Id",
    "Name",
    "Description",
    "Price",
    "DurationDays",
    "MaxUsers",
    "Features",
    "IsActive",
    "CreatedAt",
    "UpdatedAt"
) VALUES (
    'enterprise',
    'Enterprise',
    'Plan empresarial anual con soporte prioritario',
    299.99,
    365,
    999,
    '["basic", "orders", "products", "categories", "promotions", "analytics", "api", "priority-support", "custom-domain"]',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("Id") DO UPDATE SET
    "UpdatedAt" = NOW();

-- Verificar que se crearon
SELECT "Id", "Name", "Price", "DurationDays", "MaxUsers" FROM "Plans";
