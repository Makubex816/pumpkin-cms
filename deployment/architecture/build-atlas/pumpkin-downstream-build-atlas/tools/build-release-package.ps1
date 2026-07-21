param(
  [string]$Out = '.tmp/cur-20-a04/release',
  [string]$Label = 'run'
)
$ErrorActionPreference = 'Stop'
$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$Version = '4.0.0'
$Fixed = [DateTimeOffset]::new(2026,7,21,3,5,0,[TimeSpan]::Zero)
function New-DeterministicZip {
  param([string]$Source,[string]$ZipPath,[string]$Prefix)
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zipFull = [System.IO.Path]::GetFullPath($ZipPath)
  New-Item -ItemType Directory -Force -Path ([System.IO.Path]::GetDirectoryName($zipFull)) | Out-Null
  if (Test-Path $zipFull) { Remove-Item -LiteralPath $zipFull -Force }
  $fs = [System.IO.File]::Open($zipFull,[System.IO.FileMode]::CreateNew)
  try {
    $archive = [System.IO.Compression.ZipArchive]::new($fs,[System.IO.Compression.ZipArchiveMode]::Create)
    try {
      $files = Get-ChildItem -LiteralPath $Source -Recurse -File | Where-Object { $_.FullName -notmatch '\\__pycache__\\' } | Sort-Object FullName
      foreach ($file in $files) {
        $rel = $file.FullName.Substring((Resolve-Path $Source).Path.Length).TrimStart('\\') -replace '\\','/'
        $entry = $archive.CreateEntry("$Prefix/$rel",[System.IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = $Fixed
        $in = [System.IO.File]::OpenRead($file.FullName)
        try {
          $out = $entry.Open()
          try { $in.CopyTo($out) } finally { $out.Dispose() }
        } finally { $in.Dispose() }
      }
    } finally { $archive.Dispose() }
  } finally { $fs.Dispose() }
  (Get-FileHash -LiteralPath $zipFull -Algorithm SHA256).Hash.ToLowerInvariant()
}
$runDir = Join-Path $Out $Label
$atlasZip = Join-Path $runDir "pumpkin-downstream-build-atlas-v$Version.zip"
$wmZip = Join-Path $runDir 'PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.zip'
$manifest = [ordered]@{
  label = $Label
  version = $Version
  atlasZip = $atlasZip
  atlasSha256 = New-DeterministicZip -Source $Root.Path -ZipPath $atlasZip -Prefix "pumpkin-downstream-build-atlas-v$Version"
  workingMemoryZip = $wmZip
  workingMemorySha256 = New-DeterministicZip -Source (Join-Path $Root.Path 'working-memory') -ZipPath $wmZip -Prefix 'PumpkinCMS_Chat_Working_Memory_Master_v1.0.0'
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $runDir 'release-manifest.json')
$manifest | ConvertTo-Json -Depth 5
