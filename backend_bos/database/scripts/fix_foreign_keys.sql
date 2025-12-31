-- Eliminar las foreign key constraints originales que están causando el problema
ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "FK_OrderItems_Products_ProductId";
ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "FK_OrderItems_Promotions_PromotionId";

-- Las nuevas constraints opcionales (ProductId1, PromotionId1) ya existen por la migración
