$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:3000/')
$listener.Start()
Write-Host 'Server started on http://localhost:3000'

while($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response
  $rawPath = $request.Url.LocalPath
  if ($rawPath -eq '/') { $rawPath = '/index.html' }
  $localPath = Join-Path 'd:\traditional' $rawPath.Substring(1)

  if (Test-Path $localPath) {
    $bytes = [IO.File]::ReadAllBytes($localPath)
    $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
    switch ($ext) {
      '.jpg' { $ct = 'image/jpeg' }
      '.jpeg' { $ct = 'image/jpeg' }
      '.png' { $ct = 'image/png' }
      '.html' { $ct = 'text/html; charset=utf-8' }
      '.css' { $ct = 'text/css; charset=utf-8' }
      '.js' { $ct = 'application/javascript; charset=utf-8' }
      default { $ct = 'application/octet-stream' }
    }
    $response.ContentType = $ct
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
  }
  $response.Close()
}
