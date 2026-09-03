[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDirectory = Split-Path -Parent $PSCommandPath
$repositoryRoot = (Resolve-Path (Join-Path $scriptDirectory '..\..')).Path
$packagePath = (Resolve-Path (Join-Path $repositoryRoot 'gis\943\wudai-943.gpkg')).Path
$sourceLedgerPath = (Resolve-Path (Join-Path $repositoryRoot 'gis\943\sources.json')).Path
$mapsRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot 'public\maps'))
$outputDirectory = [System.IO.Path]::GetFullPath((Join-Path $mapsRoot '943'))

$expectedInputRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot 'gis\943'))
if (-not $packagePath.StartsWith($expectedInputRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'GeoPackage input must remain inside gis/943.'
}

if (-not [System.IO.Path]::GetDirectoryName($outputDirectory).Equals($mapsRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Atlas output must remain directly inside public/maps.'
}

$ogr2ogrCandidates = @(
  'C:\Program Files\QGIS 4.0.2\bin\ogr2ogr.exe',
  (Get-Command ogr2ogr.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$ogrinfoCandidates = @(
  'C:\Program Files\QGIS 4.0.2\bin\ogrinfo.exe',
  (Get-Command ogrinfo.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$ogr2ogr = $ogr2ogrCandidates | Select-Object -First 1
$ogrinfo = $ogrinfoCandidates | Select-Object -First 1
if (-not $ogr2ogr -or -not $ogrinfo) {
  throw 'ogr2ogr.exe and ogrinfo.exe are required. Install QGIS/GDAL or add them to PATH.'
}

function Assert-ZeroValidationCount {
  param(
    [Parameter(Mandatory = $true)][string]$Alias,
    [Parameter(Mandatory = $true)][string]$Sql,
    [Parameter(Mandatory = $true)][string]$Description
  )

  $validationOutput = & $ogrinfo -ro -dialect sqlite -sql $Sql $packagePath 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "$Description could not run.`n$($validationOutput -join [Environment]::NewLine)"
  }

  $validationText = $validationOutput -join [Environment]::NewLine
  $zeroPattern = "(?m)^\s*$([regex]::Escape($Alias))\s+\([^)]+\)\s+=\s+0\s*$"
  if ($validationText -notmatch $zeroPattern) {
    throw "$Description failed.`n$validationText"
  }
}

Assert-ZeroValidationCount -Alias 'invalid_realms' -Description 'Realm attribute preflight' -Sql @"
SELECT COUNT(*) AS invalid_realms
FROM realms
WHERE id IS NULL OR TRIM(id) = ''
   OR dynastyId IS NULL OR TRIM(dynastyId) = ''
   OR name IS NULL OR TRIM(name) = ''
   OR validFromYear <> 943 OR validToYearExclusive <> 944
   OR boundaryKind NOT IN ('controlled', 'influence')
   OR accuracyLevel NOT IN ('attested', 'reconstructed', 'approximate')
   OR verificationStatus NOT IN ('verified', 'reviewed')
   OR sourceRefs IS NULL OR NOT json_valid(sourceRefs)
   OR json_type(sourceRefs) <> 'array' OR json_array_length(sourceRefs) = 0
   OR labelLongitude IS NULL OR labelLongitude NOT BETWEEN 72 AND 136
   OR labelLatitude IS NULL OR labelLatitude NOT BETWEEN 18 AND 55
"@

Assert-ZeroValidationCount -Alias 'invalid_disputed_areas' -Description 'Disputed-area attribute preflight' -Sql @"
SELECT COUNT(*) AS invalid_disputed_areas
FROM disputed_areas
WHERE id IS NULL OR TRIM(id) = ''
   OR dynastyId IS NULL OR TRIM(dynastyId) = ''
   OR name IS NULL OR TRIM(name) = ''
   OR validFromYear <> 943 OR validToYearExclusive <> 944
   OR boundaryKind <> 'disputed'
   OR accuracyLevel NOT IN ('attested', 'reconstructed', 'approximate')
   OR verificationStatus NOT IN ('verified', 'reviewed')
   OR disputedNote IS NULL OR TRIM(disputedNote) = ''
   OR sourceRefs IS NULL OR NOT json_valid(sourceRefs)
   OR json_type(sourceRefs) <> 'array' OR json_array_length(sourceRefs) = 0
   OR labelLongitude IS NULL OR labelLongitude NOT BETWEEN 72 AND 136
   OR labelLatitude IS NULL OR labelLatitude NOT BETWEEN 18 AND 55
"@

Assert-ZeroValidationCount -Alias 'invalid_places' -Description 'Place attribute preflight' -Sql @"
SELECT COUNT(*) AS invalid_places
FROM places
WHERE id IS NULL OR TRIM(id) = ''
   OR locationId IS NULL OR TRIM(locationId) = ''
   OR name IS NULL OR TRIM(name) = ''
   OR dynastyId IS NULL OR TRIM(dynastyId) = ''
   OR year <> 943
   OR placeKind NOT IN ('capital', 'prefecture', 'landmark')
   OR verificationStatus NOT IN ('verified', 'reviewed')
   OR sourceRefs IS NULL OR NOT json_valid(sourceRefs)
   OR json_type(sourceRefs) <> 'array' OR json_array_length(sourceRefs) = 0
"@

Assert-ZeroValidationCount -Alias 'invalid_provenance' -Description 'Provenance attribute preflight' -Sql @"
SELECT COUNT(*) AS invalid_provenance
FROM provenance
WHERE id IS NULL OR TRIM(id) = ''
   OR title IS NULL OR TRIM(title) = ''
   OR reference IS NULL OR TRIM(reference) = ''
   OR role NOT IN ('georeference', 'cross-check', 'geography')
   OR license IS NULL OR TRIM(license) = ''
   OR redistributable NOT IN (0, 1)
   OR note IS NULL OR TRIM(note) = ''
"@

Assert-ZeroValidationCount -Alias 'invalid_source_refs' -Description 'Source-reference preflight' -Sql @"
SELECT COUNT(*) AS invalid_source_refs
FROM (
  SELECT sourceRefs FROM realms
  UNION ALL SELECT sourceRefs FROM disputed_areas
  UNION ALL SELECT sourceRefs FROM places
) features,
json_each(features.sourceRefs) source_ref
LEFT JOIN provenance ON provenance.id = source_ref.value
WHERE provenance.id IS NULL
"@

Assert-ZeroValidationCount -Alias 'invalid_geometries' -Description 'Geometry validity preflight' -Sql @"
SELECT
  (SELECT COUNT(*) FROM realms
   WHERE geom IS NULL OR ST_IsEmpty(geom) OR NOT ST_IsValid(geom))
  +
  (SELECT COUNT(*) FROM disputed_areas
   WHERE geom IS NULL OR ST_IsEmpty(geom) OR NOT ST_IsValid(geom))
  +
  (SELECT COUNT(*) FROM places
   WHERE geom IS NULL OR ST_IsEmpty(geom) OR NOT ST_IsValid(geom))
  AS invalid_geometries
"@

Assert-ZeroValidationCount -Alias 'controlled_overlaps' -Description 'Controlled-realm overlap preflight' -Sql @"
SELECT COUNT(*) AS controlled_overlaps
FROM realms realm_a
JOIN realms realm_b ON realm_a.fid < realm_b.fid
WHERE realm_a.boundaryKind = 'controlled'
  AND realm_b.boundaryKind = 'controlled'
  AND ST_Area(ST_Intersection(realm_a.geom, realm_b.geom)) > 1
"@

function Assert-TemporaryAtlasDirectory {
  param([Parameter(Mandatory = $true)][string]$Path)

  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $parentPath = [System.IO.Path]::GetDirectoryName($fullPath)
  $leafName = [System.IO.Path]::GetFileName($fullPath)
  if (-not $parentPath.Equals($mapsRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Temporary atlas directory must be directly inside public/maps: $fullPath"
  }
  if ($leafName -notmatch '^\.943-(stage|backup)-[a-f0-9]{32}$') {
    throw "Unexpected temporary atlas directory name: $leafName"
  }
}

function Remove-TemporaryAtlasDirectory {
  param([Parameter(Mandatory = $true)][string]$Path)

  Assert-TemporaryAtlasDirectory -Path $Path
  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Recurse -Force
  }
}

New-Item -ItemType Directory -Force -Path $mapsRoot | Out-Null
$publishId = [guid]::NewGuid().ToString('N')
$stagingDirectory = Join-Path $mapsRoot ".943-stage-$publishId"
$backupDirectory = Join-Path $mapsRoot ".943-backup-$publishId"
Assert-TemporaryAtlasDirectory -Path $stagingDirectory
Assert-TemporaryAtlasDirectory -Path $backupDirectory
New-Item -ItemType Directory -Path $stagingDirectory | Out-Null

function Export-AtlasLayer {
  param(
    [Parameter(Mandatory = $true)][string]$LayerName,
    [Parameter(Mandatory = $true)][string]$FileName
  )

  $outputPath = [System.IO.Path]::GetFullPath((Join-Path $stagingDirectory $FileName))
  if (-not [System.IO.Path]::GetDirectoryName($outputPath).Equals($stagingDirectory, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to export outside the staging directory: $outputPath"
  }

  & $ogr2ogr -f GeoJSON -t_srs EPSG:4326 `
    -lco RFC7946=YES -lco COORDINATE_PRECISION=5 `
    $outputPath $packagePath $LayerName

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to export $LayerName"
  }
}

$published = $false
$movedExistingOutput = $false
try {
  Export-AtlasLayer -LayerName 'realms' -FileName 'realms.geojson'
  Export-AtlasLayer -LayerName 'disputed_areas' -FileName 'disputed.geojson'
  Export-AtlasLayer -LayerName 'places' -FileName 'places.geojson'

  Copy-Item -LiteralPath $sourceLedgerPath -Destination (Join-Path $stagingDirectory 'sources.json')

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

  $manifestJson = $manifest | ConvertTo-Json -Depth 4
  [System.IO.File]::WriteAllText(
    (Join-Path $stagingDirectory 'manifest.json'),
    $manifestJson,
    [System.Text.UTF8Encoding]::new($false)
  )

  $requiredFiles = @('realms.geojson', 'disputed.geojson', 'places.geojson', 'sources.json', 'manifest.json')
  foreach ($requiredFile in $requiredFiles) {
    $stagedFile = Join-Path $stagingDirectory $requiredFile
    if (-not (Test-Path -LiteralPath $stagedFile -PathType Leaf)) {
      throw "Staged atlas output is missing: $requiredFile"
    }
  }

  if (Test-Path -LiteralPath $outputDirectory) {
    Move-Item -LiteralPath $outputDirectory -Destination $backupDirectory
    $movedExistingOutput = $true
  }

  try {
    Move-Item -LiteralPath $stagingDirectory -Destination $outputDirectory
    $published = $true
  }
  catch {
    if ($movedExistingOutput -and -not (Test-Path -LiteralPath $outputDirectory)) {
      Move-Item -LiteralPath $backupDirectory -Destination $outputDirectory
      $movedExistingOutput = $false
    }
    throw
  }

  if ($movedExistingOutput) {
    Remove-TemporaryAtlasDirectory -Path $backupDirectory
    $movedExistingOutput = $false
  }
}
finally {
  if (-not $published) {
    Remove-TemporaryAtlasDirectory -Path $stagingDirectory
  }
  if ($movedExistingOutput -and (Test-Path -LiteralPath $backupDirectory) -and -not (Test-Path -LiteralPath $outputDirectory)) {
    Move-Item -LiteralPath $backupDirectory -Destination $outputDirectory
  }
}

Write-Output "Validated and exported 943 atlas data to $outputDirectory"
