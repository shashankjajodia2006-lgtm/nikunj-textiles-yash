# Nikunj Textiles - Lightweight PowerShell Web Server
$port = 8080
$prefix = "http://localhost:$port/"
$baseDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Nikunj Textiles (Brand Yash) Online Store is Live!" -ForegroundColor Yellow
    Write-Host " Server running at: $prefix" -ForegroundColor Cyan
    Write-Host " Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green

    # Open default browser
    Start-Process $prefix

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $relPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
            $relPath = $relPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $baseDir $relPath

            if ((Test-Path $filePath -PathType Leaf) -and $filePath.StartsWith($baseDir, [System.StringComparison]::OrdinalIgnoreCase)) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".htm"  { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".png"  { "image/png" }
                    ".svg"  { "image/svg+xml" }
                    ".pdf"  { "application/pdf" }
                    Default { "application/octet-stream" }
                }
                $response.ContentType = $mime
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.OutputStream.Close()
        } catch {
            Write-Warning "Request error: $_"
        }
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
