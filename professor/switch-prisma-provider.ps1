# File to modify
$prismaFile = "prisma/schema.prisma"

# Check if the file exists
if (-Not (Test-Path $prismaFile)) {
    Write-Error "Error: $prismaFile not found!"
    exit 1
}

# Function to switch the provider
function Switch-Provider {
    param (
        [string]$currentProvider,
        [string]$newProvider
    )
    
    (Get-Content $prismaFile) -replace "provider = `"$currentProvider`"", "provider = `"$newProvider`"" | Set-Content $prismaFile
    Write-Output "Switched from $currentProvider to $newProvider in $prismaFile"
}

# Determine the current provider and switch to the other one
$content = Get-Content $prismaFile

if ($content -match 'provider = "sqlite"') {
    Switch-Provider -currentProvider "sqlite" -newProvider "postgresql"
} elseif ($content -match 'provider = "postgresql"') {
    Switch-Provider -currentProvider "postgresql" -newProvider "sqlite"
} else {
    Write-Error "Error: Could not determine the current provider in $prismaFile"
    exit 1
}
