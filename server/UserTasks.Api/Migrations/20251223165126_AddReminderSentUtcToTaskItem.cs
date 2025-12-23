using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserTasks.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderSentUtcToTaskItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderSentUtc",
                table: "Tasks",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReminderSentUtc",
                table: "Tasks");
        }
    }
}
