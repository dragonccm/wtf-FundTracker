$token = "xpKvItmdxqKFAPmbqppWZboQZGXZodjFIxTgsuROzKJTAyRUoyOiypfDiDxREoba"
$baseUrl = "https://dokploy.wtfdev.qzz.io"

$headers = @{
    "x-api-key" = $token
    "Authorization" = "Bearer $token"
}

Write-Host "=== 1. Testing OpenApi / Swagger Spec ==="
$swaggerPaths = @("/swagger/json", "/api/swagger", "/api/openapi.json", "/api/trpc/project.all", "/api/project.all", "/api/postgres.all", "/api/mysql.all", "/api/mariadb.all", "/api/mongo.all", "/api/compose.all")

foreach ($path in $swaggerPaths) {
    try {
        $uri = "$baseUrl$path"
        $res = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 5
        Write-Host "SUCCESS: $path"
        $res | ConvertTo-Json -Depth 4 | Select-Object -First 30
    } catch {
        Write-Host "FAILED: $path - $($_.Exception.Message)"
    }
}
