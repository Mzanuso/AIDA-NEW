# Load all environment variables from .env and start orchestrator
$envFile = Get-Content -Path "../../../.env"
foreach ($line in $envFile) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Start the service
npm run dev
