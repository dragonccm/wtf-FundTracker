$token = "xpKvItmdxqKFAPmbqppWZboQZGXZodjFIxTgsuROzKJTAyRUoyOiypfDiDxREoba"
$baseUrl = "https://dokploy.wtfdev.qzz.io"

$headers = @{
    "x-api-key" = $token
    "Authorization" = "Bearer $token"
}

Write-Host "=== POSTGRES DETAILS ==="
$pgIds = @("rch3u6aB0RlrxjFupE_sm", "Rf7NvdrHeEw8c8EN5lfrh")
foreach ($id in $pgIds) {
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/postgres.one?postgresId=$id" -Headers $headers -Method Get
        Write-Host "Postgres ID: $id | Name: $($res.name) | AppName: $($res.appName) | Status: $($res.applicationStatus) | Database: $($res.databaseName) | User: $($res.databaseUser)"
    } catch {
        Write-Host "Postgres ID: $id Failed: $($_.Exception.Message)"
    }
}

Write-Host "`n=== MONGO DETAILS ==="
$mongoIds = @("1Qx5TkidOuvt4gHy5GSOa", "TTi08NTPz3Yf95ZZOJPLf")
foreach ($id in $mongoIds) {
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/mongo.one?mongoId=$id" -Headers $headers -Method Get
        Write-Host "Mongo ID: $id | Name: $($res.name) | AppName: $($res.appName) | Status: $($res.applicationStatus) | Database: $($res.databaseName)"
    } catch {
        Write-Host "Mongo ID: $id Failed: $($_.Exception.Message)"
    }
}
