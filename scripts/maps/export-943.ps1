[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$scriptDirectory = Split-Path -Parent $PSCommandPath
$exporterPath = Join-Path $scriptDirectory 'export-snapshot.ps1'

& $exporterPath `
  -Year 943 `
  -GeoPackagePath 'gis\943\wudai-943.gpkg' `
  -SourceLedgerPath 'gis\943\sources.json' `
  -OutputRoot 'public\maps'
