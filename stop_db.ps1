$token = "xpKvItmdxqKFAPmbqppWZboQZGXZodjFIxTgsuROzKJTAyRUoyOiypfDiDxREoba"
$baseUrl = "https://dokploy.wtfdev.qzz.io"

$headers = @{
    "x-api-key" = $token
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$mongoId = "TTi08NTPz3Yf95ZZOJPLf"

Write-Host "=== Stopping Mongo Database: wtf-FundTracker (ID: $mongoId) ==="

$body = @{
    "mongoId" = $mongoId
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/mongo.stop" -Headers $headers -Method Post -Body $body
    Write-Host "SUCCESS calling /api/mongo.stop :"
    $res | ConvertTo-Json -Depth 5
} catch {
    Write-Host "POST /api/mongo.stop Failed: $($_.Exception.Message)"
}

# Also verify status after stop call
Start-Sleep -Seconds 2
try {
    $detail = Invoke-RestMethod -Uri "$baseUrl/api/mongo.one?mongoId=$mongoId" -Headers $headers -Method Get
    Write-Host "Current Status after stop request: $($detail.applicationStatus)"
    $detail | ConvertTo-Json -Depth 4
} catch {
    Write-Host "Status check failed: $($_.Exception.Message)"
}
