-- Script para crear datos iniciales de prueba
-- Ejecutar en pgAdmin o psql conectado a la base de datos 'bosstore'

-- 1. Crear el tenant de demo
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt")
VALUES ('tenant-demo', 'Mi Tienda Demo', 'demo', true, NOW());

-- 2. Crear la configuración de la tienda
INSERT INTO "StoreConfigs" (
  "Id",
  "TenantId",
  "Name",
  "WhatsappNumber",
  "Currency",
  "PrimaryColor",
  "SecondaryColor",
  "Address",
  "ThemeKey",
  "SocialMedia1Type",
  "SocialMedia1Url",
  "SocialMedia2Type",
  "SocialMedia2Url",
  "CreatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'tenant-demo',
  'Mi Tienda Demo',
  '+5491112345678',
  'ARS',
  '#FF6B35',
  '#F7931E',
  'Av. Corrientes 1234, CABA',
  'classic',
  'instagram',
  'https://instagram.com/mitienda',
  'facebook',
  'https://facebook.com/mitienda',
  NOW()
);

-- 3. Verificar que se crearon correctamente
SELECT * FROM "Tenants";
SELECT * FROM "StoreConfigs";
