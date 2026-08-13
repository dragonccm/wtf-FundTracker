$token = "xpKvItmdxqKFAPmbqppWZboQZGXZodjFIxTgsuROzKJTAyRUoyOiypfDiDxREoba"
$baseUrl = "https://dokploy.wtfdev.qzz.io"

$headers = @{
    "x-api-key" = $token
    "Authorization" = "Bearer $token"
}

$projects = Invoke-RestMethod -Uri "$baseUrl/api/project.all" -Headers $headers -Method Get

Write-Host "=== All Projects in Dokploy ==="
foreach ($p in $projects) {
    Write-Host "Project ID: $($p.projectId) | Name: $($p.name)"
    foreach ($env in $p.environments) {
        Write-Host "  Env: $($env.name) (ID: $($env.environmentId))"
        
        if ($env.applications) {
            foreach ($app in $env.applications) {
                Write-Host "    [APP] ID: $($app.applicationId) | Name: $($app.name) | Status: $($app.applicationStatus)"
            }
        }
        if ($env.postgres) {
            foreach ($db in $env.postgres) {
                Write-Host "    [POSTGRES] ID: $($db.postgresId) | Name: $($db.name) | Status: $($db.applicationStatus)"
            }
        }
        if ($env.mysql) {
            foreach ($db in $env.mysql) {
                Write-Host "    [MYSQL] ID: $($db.mysqlId) | Name: $($db.name) | Status: $($db.applicationStatus)"
            }
        }
        if ($env.mariadb) {
            foreach ($db in $env.mariadb) {
                Write-Host "    [MARIADB] ID: $($db.mariadbId) | Name: $($db.name) | Status: $($db.applicationStatus)"
            }
        }
        if ($env.mongo) {
            foreach ($db in $env.mongo) {
                Write-Host "    [MONGO] ID: $($db.mongoId) | Name: $($db.name) | Status: $($db.applicationStatus)"
            }
        }
        if ($env.redis) {
            foreach ($db in $env.redis) {
                Write-Host "    [REDIS] ID: $($db.redisId) | Name: $($db.name) | Status: $($db.applicationStatus)"
            }
        }
        if ($env.compose) {
            foreach ($comp in $env.compose) {
                Write-Host "    [COMPOSE] ID: $($comp.composeId) | Name: $($comp.name) | Status: $($comp.composeStatus)"
            }
        }
    }
}
