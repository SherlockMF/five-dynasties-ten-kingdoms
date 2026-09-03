[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDirectory = Split-Path -Parent $PSCommandPath
$repositoryRoot = (Resolve-Path (Join-Path $scriptDirectory '..\..')).Path
$packagePath = (Resolve-Path (Join-Path $repositoryRoot 'gis\943\wudai-943.gpkg')).Path
$sourceLedgerPath = (Resolve-Path (Join-Path $repositoryRoot 'gis\943\sources.json')).Path
$outputDirectory = Join-Path $repositoryRoot 'public\maps\943'

$expectedInputRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot 'gis\943'))
$expectedOutputRoot = [System.IO.Path]::GetFullPath($outputDirectory)

if (-not $packagePath.StartsWith($expectedInputRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'GeoPackage input must remain inside gis/943.'
}

if (-not $expectedOutputRoot.StartsWith([System.IO.Path]::GetFullPath((Join-Path $repositoryRoot 'public\maps')), [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Atlas output must remain inside public/maps.'
}

$ogr2ogrCandidates = @(
  'C:\Program Files\QGIS 4.0.2\bin\ogr2ogr.exe',
  (Get-Command ogr2ogr.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$ogr2ogr = $ogr2ogrCandidates | Select-Object -First 1
if (-not $ogr2ogr) {
  throw 'ogr2ogr.exe was not found. Install QGIS/GDAL or add ogr2ogr to PATH.'
}

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

function Export-AtlasLayer {
  param(
    [Parameter(Mandatory = $true)][string]$LayerName,
    [Parameter(Mandatory = $true)][string]$FileName
  )

  $outputPath = [System.IO.Path]::GetFullPath((Join-Path $outputDirectory $FileName))
  if (-not $outputPath.StartsWith($expectedOutputRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to export outside public/maps/943: $outputPath"
  }

  if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
  }

  & $ogr2ogr -f GeoJSON -t_srs EPSG:4326 -makevalid `
    -lco RFC7946=YES -lco COORDINATE_PRECISION=5 `
    $outputPath $packagePath $LayerName

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to export $LayerName"
  }
}

Export-AtlasLayer -LayerName 'realms' -FileName 'realms.geojson'
Export-AtlasLayer -LayerName 'disputed_areas' -FileName 'disputed.geojson'
Export-AtlasLayer -LayerName 'places' -FileName 'places.geojson'

Copy-Item -LiteralPath $sourceLedgerPath -Destination (Join-Path $outputDirectory 'sources.json') -Force

$manifest = [ordered]@{
  year = 943
  temporalBasis = 'year-end'
  bbox = @(72, 18, 136, 55)
  version = '943.1'
  files = @('realms.geojson', 'disputed.geojson', 'places.geojson', 'sources.json')
  attribution = @(
    'OpenStreetMap contributors',
    'Protomaps',
    'Mapterhorn',
    'Natural Earth (public domain)'
  )
  sourceLedger = 'sources.json'
}

$manifestPath = Join-Path $outputDirectory 'manifest.json'
$manifestJson = $manifest | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText(
  $manifestPath,
  $manifestJson,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Exported 943 atlas data to $outputDirectory"
