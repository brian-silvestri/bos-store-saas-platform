using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BosStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropOriginalFKConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the original foreign key constraints that are preventing optional relationships
            migrationBuilder.Sql(@"
                ALTER TABLE ""OrderItems"" DROP CONSTRAINT IF EXISTS ""FK_OrderItems_Products_ProductId"";
                ALTER TABLE ""OrderItems"" DROP CONSTRAINT IF EXISTS ""FK_OrderItems_Promotions_PromotionId"";
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
