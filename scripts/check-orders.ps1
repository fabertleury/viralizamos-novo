$baseUrl = "http://localhost:3000"
$endpoint = "/api/jobs/check-orders"

while ($true) {
    try {
        Write-Host "Checking orders..."
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Get
        Write-Host "Response: $($response | ConvertTo-Json)"
    }
    catch {
        Write-Host "Error checking orders: $_"
    }
    
    # Aguardar 5 minutos
    Start-Sleep -Seconds 300
}
