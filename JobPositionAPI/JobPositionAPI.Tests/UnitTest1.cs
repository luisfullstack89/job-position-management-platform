using System.Threading.Tasks;
using JobPositionAPI.Controllers;
using JobPositionAPI.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

public class PositionsControllerTests
{
    private readonly JobPositionsContext _context;
    private readonly PositionsController _controller;
    private readonly Mock<IHubContext<PositionHub>> _mockHubContext;

    public PositionsControllerTests()
    {
        var options = new DbContextOptionsBuilder<JobPositionsContext>()
            .UseInMemoryDatabase(databaseName: "JobPositionsTestDatabase")
            .Options;

        _context = new JobPositionsContext(options);
        _mockHubContext = new Mock<IHubContext<PositionHub>>();
        _controller = new PositionsController(_context, _mockHubContext.Object);
    }

    [Fact]
    public async Task PostPosition_ShouldReturnBadRequest_WhenPositionNumberIsNotUnique()
    {
        var existingPosition = new Position
        {
            PositionNumber = "12345",
            Title = "Test Position",
            StatusID = 1,
            DepartmentID = 1,
            RecruiterID = 1,
            Budget = 5000
        };

        _context.Positions.Add(existingPosition);
        await _context.SaveChangesAsync();

        var newPosition = new Position
        {
            PositionNumber = "12345", 
            Title = "Another Position",
            StatusID = 1,
            DepartmentID = 2,
            RecruiterID = 2,
            Budget = 6000
        };

        var result = await _controller.PostPosition(newPosition);

        var badRequestResult = result.Result as BadRequestObjectResult;
        Assert.NotNull(badRequestResult);
        Assert.Equal(400, badRequestResult.StatusCode);
        Assert.Equal("Position number must be unique.", badRequestResult.Value);
    }


    [Fact]
    public async Task PostPosition_ShouldReturnBadRequest_WhenBudgetIsNegative()
    {
        var newPosition = new Position
        {
            PositionNumber = "54321",
            Title = "Test Position with Negative Budget",
            StatusID = 1,
            DepartmentID = 1,
            RecruiterID = 1,
            Budget = -1000 
        };

        var result = await _controller.PostPosition(newPosition);

        var badRequestResult = result.Result as BadRequestObjectResult;
        Assert.NotNull(badRequestResult);
        Assert.Equal(400, badRequestResult.StatusCode);
        Assert.Equal("Budget must be a non-negative value.", badRequestResult.Value);
    }

}
