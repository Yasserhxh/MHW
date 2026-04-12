namespace MoroccanWallet.Tests.Architecture;

public sealed class ProjectStructureTests
{
    [Fact]
    public void BackendSolution_ContainsExpectedHostModulesAndTests()
    {
        var root = FindRepositoryRoot();

        File.Exists(Path.Combine(root, "src", "backend", "Host", "MoroccanWallet.Host", "Program.cs")).Should().BeTrue();

        var expectedModules = new[]
        {
            "Identity",
            "Users",
            "HouseholdBudget",
            "SharedExpenses",
            "GroceryPrices",
            "Reminders",
            "Notifications",
            "ReferenceData",
            "Administration"
        };

        foreach (var module in expectedModules)
        {
            Directory.Exists(Path.Combine(root, "src", "backend", "Modules", module)).Should().BeTrue($"module {module} should exist");
        }

        Directory.Exists(Path.Combine(root, "tests", "MoroccanWallet.Tests.Unit")).Should().BeTrue();
        Directory.Exists(Path.Combine(root, "tests", "MoroccanWallet.Tests.Integration")).Should().BeTrue();
        Directory.Exists(Path.Combine(root, "tests", "MoroccanWallet.Tests.Architecture")).Should().BeTrue();
    }

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);

        while (current is not null)
        {
            if (Directory.Exists(Path.Combine(current.FullName, "src", "backend")) &&
                Directory.Exists(Path.Combine(current.FullName, "tests")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new InvalidOperationException("Repository root could not be located from the test output directory.");
    }
}
