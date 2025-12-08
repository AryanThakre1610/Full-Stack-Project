using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShooterBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDmgRarityPowerups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Weapon_Damage",
                table: "Items",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Weapon_Rarity",
                table: "Items",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Weapon_Damage",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Weapon_Rarity",
                table: "Items");
        }
    }
}
