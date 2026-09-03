[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(907, 979)] [int]$Year,
  [string]$GeoPackagePath,
  [string]$SourceLedgerPath,
  [string]$OutputRoot
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDirectory = Split-Path -Parent $PSCommandPath
$repositoryRoot = (Resolve-Path (Join-Path $scriptDirectory '..\..')).Path
$yearText = $Year.ToString([System.Globalization.CultureInfo]::InvariantCulture)
$validToYearExclusive = $Year + 1
$expectedInputRoot = [System.IO.Path]::GetFullPath(
  (Join-Path $repositoryRoot (Join-Path 'gis' $yearText))
)

function Resolve-RepositoryPath {
  param([Parameter(Mandatory = $true)][string]$Path)

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return [System.IO.Path]::GetFullPath($Path)
  }

  return [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot $Path))
}

function Test-IsInsideDirectory {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Directory
  )

  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $fullDirectory = [System.IO.Path]::GetFullPath($Directory)
  $directoryPrefix = $fullDirectory.TrimEnd(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
  ) + [System.IO.Path]::DirectorySeparatorChar

  return $fullPath.StartsWith(
    $directoryPrefix,
    [System.StringComparison]::OrdinalIgnoreCase
  )
}

if ([string]::IsNullOrWhiteSpace($GeoPackagePath)) {
  $GeoPackagePath = Join-Path $expectedInputRoot "wudai-$yearText.gpkg"
}
if ([string]::IsNullOrWhiteSpace($SourceLedgerPath)) {
  $SourceLedgerPath = Join-Path $expectedInputRoot 'sources.json'
}
if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
  $OutputRoot = Join-Path $repositoryRoot 'public\maps'
}

$packageCandidate = Resolve-RepositoryPath -Path $GeoPackagePath
$sourceLedgerCandidate = Resolve-RepositoryPath -Path $SourceLedgerPath
$mapsRoot = Resolve-RepositoryPath -Path $OutputRoot

if (-not (Test-IsInsideDirectory -Path $packageCandidate -Directory $expectedInputRoot)) {
  throw "GeoPackage input must remain inside gis/$yearText."
}
if (-not (Test-IsInsideDirectory -Path $sourceLedgerCandidate -Directory $expectedInputRoot)) {
  throw "Source ledger input must remain inside gis/$yearText."
}
if ($mapsRoot.Equals($expectedInputRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    (Test-IsInsideDirectory -Path $mapsRoot -Directory $expectedInputRoot) -or
    (Test-IsInsideDirectory -Path $expectedInputRoot -Directory $mapsRoot)) {
  throw 'Output root must not overlap editable GIS inputs.'
}

$packagePath = (Resolve-Path -LiteralPath $packageCandidate).Path
$sourceLedgerPathResolved = (Resolve-Path -LiteralPath $sourceLedgerCandidate).Path
$outputDirectory = [System.IO.Path]::GetFullPath((Join-Path $mapsRoot $yearText))

if (-not [System.IO.Path]::GetDirectoryName($outputDirectory).Equals(
    $mapsRoot,
    [System.StringComparison]::OrdinalIgnoreCase
  )) {
  throw 'Atlas output must remain directly inside the configured output root.'
}

$manifestTemplateCandidates = @(
  (Join-Path $expectedInputRoot 'manifest.json'),
  (Join-Path $outputDirectory 'manifest.json')
)
$manifestTemplatePath = $manifestTemplateCandidates |
  Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
  Select-Object -First 1
if (-not $manifestTemplatePath) {
  throw "A runtime manifest template is required at gis/$yearText/manifest.json or public/maps/$yearText/manifest.json."
}

$manifest = Get-Content -Raw -LiteralPath $manifestTemplatePath | ConvertFrom-Json
$requiredManifestProperties = @(
  'id',
  'anchorYear',
  'version',
  'bbox',
  'files',
  'sourceRefs',
  'inferenceNotes',
  'confidence'
)
foreach ($propertyName in $requiredManifestProperties) {
  if (-not $manifest.PSObject.Properties[$propertyName]) {
    throw "Manifest template is missing required property: $propertyName"
  }
}
if ($manifest.id -ne "snapshot-$yearText") {
  throw "Manifest id must be snapshot-$yearText."
}
if ($manifest.anchorYear -ne $Year) {
  throw "Manifest anchorYear must be $Year."
}
if ($manifest.bbox.Count -ne 4) {
  throw 'Manifest bbox must contain four coordinates.'
}
if (-not $manifest.sourceRefs -or $manifest.sourceRefs.Count -eq 0) {
  throw 'Manifest sourceRefs must not be empty.'
}
if (-not $manifest.inferenceNotes -or $manifest.inferenceNotes.Count -eq 0) {
  throw 'Manifest inferenceNotes must not be empty.'
}
if ($manifest.confidence -notin @('high', 'medium', 'low')) {
  throw 'Manifest confidence must be high, medium, or low.'
}

$expectedFiles = [ordered]@{
  realms = "/maps/$yearText/realms.geojson"
  disputed = "/maps/$yearText/disputed.geojson"
  places = "/maps/$yearText/places.geojson"
  sources = "/maps/$yearText/sources.json"
}
foreach ($fileProperty in $expectedFiles.Keys) {
  if (-not $manifest.files.PSObject.Properties[$fileProperty] -or
      $manifest.files.$fileProperty -ne $expectedFiles[$fileProperty]) {
    throw "Manifest files.$fileProperty must be $($expectedFiles[$fileProperty])."
  }
}

$ogr2ogrCandidates = @(
  'C:\Program Files\QGIS 4.0.2\bin\ogr2ogr.exe',
  (Get-Command ogr2ogr.exe -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty Source -First 1)
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$ogrinfoCandidates = @(
  'C:\Program Files\QGIS 4.0.2\bin\ogrinfo.exe',
  (Get-Command ogrinfo.exe -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty Source -First 1)
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
   OR validFromYear <> $Year OR validToYearExclusive <> $validToYearExclusive
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
   OR validFromYear <> $Year OR validToYearExclusive <> $validToYearExclusive
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
   OR year <> $Year
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
    throw "Temporary atlas directory must be directly inside the configured output root: $fullPath"
  }
  if ($leafName -notmatch "^\.$([regex]::Escape($yearText))-(stage|backup)-[a-f0-9]{32}$") {
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
$stagingDirectory = Join-Path $mapsRoot ".$yearText-stage-$publishId"
$backupDirectory = Join-Path $mapsRoot ".$yearText-backup-$publishId"
Assert-TemporaryAtlasDirectory -Path $stagingDirectory
Assert-TemporaryAtlasDirectory -Path $backupDirectory
New-Item -ItemType Directory -Path $stagingDirectory | Out-Null

function Export-AtlasLayer {
  param(
    [Parameter(Mandatory = $true)][string]$LayerName,
    [Parameter(Mandatory = $true)][string]$FileName
  )

  $outputPath = [System.IO.Path]::GetFullPath((Join-Path $stagingDirectory $FileName))
  if (-not [System.IO.Path]::GetDirectoryName($outputPath).Equals(
      $stagingDirectory,
      [System.StringComparison]::OrdinalIgnoreCase
    )) {
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

  Copy-Item -LiteralPath $sourceLedgerPathResolved -Destination (Join-Path $stagingDirectory 'sources.json')
  Copy-Item -LiteralPath $manifestTemplatePath -Destination (Join-Path $stagingDirectory 'manifest.json')

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
  if ($movedExistingOutput -and
      (Test-Path -LiteralPath $backupDirectory) -and
      -not (Test-Path -LiteralPath $outputDirectory)) {
    Move-Item -LiteralPath $backupDirectory -Destination $outputDirectory
  }
}

Write-Output "Validated and exported $yearText atlas data to $outputDirectory"
