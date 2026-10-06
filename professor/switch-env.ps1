# File paths
$envFile = ".env"
$envDev = ".env.development"
$envProd = ".env.production"
$prismaScript = "./switch-prisma-provider.ps1"

# Function to switch the .env file and Prisma provider
function Switch-Env {
    param (
        [string]$environment
    )
    
    if ($environment -eq "development") {
        Copy-Item -Path $envDev -Destination $envFile -Force
        Write-Output "Switched to development environment"
    } elseif ($environment -eq "production") {
        Copy-Item -Path $envProd -Destination $envFile -Force
        Write-Output "Switched to production environment"
    } else {
        Write-Error "Unknown environment: $environment"
        Write-Output "Usage: .\switch-env.ps1 {development|production}"
        exit 1
    }
    
    # Run the Prisma provider switch script
    & $prismaScript
}

# Check if the script received an argument
if ($args.Count -eq 0) {
    Write-Error "No environment specified."
    Write-Output "Usage: .\switch-env.ps1 {development|production}"
    exit 1
} else {
    Switch-Env -environment $args[0]
}
