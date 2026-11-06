# Migrate the nine catalog images into the private product-images container.
# Does not delete, rename, or modify local files, and does not overwrite existing blobs.
#
# From the repository root, in Windows PowerShell:
#   az login
#   .\Migrate-ProductImages.ps1
#   .\Migrate-ProductImages.ps1 -Execute

[CmdletBinding()]
param(
    [switch]$Execute
)

$ErrorActionPreference = 'Stop'

$AccountName = 'veldsupplyimages'
$ContainerName = 'product-images'
$FileNames = @(
    'VS-APP-220.jpg',
    'VS-APP-310.jpg',
    'VS-APP-546.jpg',
    'VS-CMP-014.jpg',
    'VS-CMP-033.jpg',
    'VS-KNF-018.jpg',
    'VS-LMP-014.jpg',
    'VS-OPT-1042.jpg',
    'VS-PCK-028.jpg'
)

$SourceDirectory = Join-Path $PSScriptRoot 'EcommWebApi\wwwroot\products'
$missingSources = @()
$failedChecks = @()
$failedUploads = @()
$plannedUploads = @()
$skipped = @()

function Invoke-Az {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = & az @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previous
    }

    $text = (($output | ForEach-Object { "$_" }) -join [Environment]::NewLine).Trim()
    return [pscustomobject]@{
        ExitCode = $exitCode
        Output   = $text
    }
}

Write-Host $(if ($Execute) { 'EXECUTE: blobs will be uploaded.' } else { 'DRY RUN: no blobs will be uploaded. Pass -Execute to upload.' })
Write-Host "Source: $SourceDirectory"
Write-Host "Account: $AccountName  Container: $ContainerName"
Write-Host ''

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error 'Azure CLI (az) was not found. Install it, run az login, then run this script again.'
    exit 1
}

$account = Invoke-Az -Arguments @('account', 'show', '--output', 'none')
if ($account.ExitCode -ne 0) {
    Write-Error "Azure CLI is not logged in. Run az login, then run this script again. $($account.Output)"
    exit 1
}

foreach ($fileName in $FileNames) {
    $sourcePath = Join-Path $SourceDirectory $fileName
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        $missingSources += $fileName
        Write-Host "MISSING SOURCE: $fileName"
        continue
    }

    $exists = Invoke-Az -Arguments @(
        'storage', 'blob', 'exists',
        '--account-name', $AccountName,
        '--container-name', $ContainerName,
        '--name', $fileName,
        '--auth-mode', 'login',
        '--query', 'exists',
        '--output', 'tsv'
    )
    if ($exists.ExitCode -ne 0) {
        $failedChecks += $fileName
        Write-Host "CHECK FAILED: $fileName"
        Write-Host $exists.Output
        continue
    }

    if ($exists.Output -eq 'true') {
        $skipped += $fileName
        Write-Host "SKIP: $fileName already exists"
        continue
    }

    if (-not $Execute) {
        $plannedUploads += $fileName
        Write-Host "WOULD UPLOAD: $fileName"
        continue
    }

    $upload = Invoke-Az -Arguments @(
        'storage', 'blob', 'upload',
        '--account-name', $AccountName,
        '--container-name', $ContainerName,
        '--name', $fileName,
        '--file', $sourcePath,
        '--auth-mode', 'login',
        '--overwrite', 'false',
        '--output', 'none'
    )
    if ($upload.ExitCode -ne 0) {
        $failedUploads += $fileName
        Write-Host "UPLOAD FAILED: $fileName"
        Write-Host $upload.Output
        continue
    }

    Write-Host "UPLOADED: $fileName"
}

Write-Host ''
Write-Host 'Verification'
$missingBlobs = @()
foreach ($fileName in $FileNames) {
    $exists = Invoke-Az -Arguments @(
        'storage', 'blob', 'exists',
        '--account-name', $AccountName,
        '--container-name', $ContainerName,
        '--name', $fileName,
        '--auth-mode', 'login',
        '--query', 'exists',
        '--output', 'tsv'
    )
    if ($exists.ExitCode -ne 0 -or $exists.Output -ne 'true') {
        $missingBlobs += $fileName
        Write-Host "BLOB MISSING: $fileName"
        if ($exists.ExitCode -ne 0) {
            Write-Host $exists.Output
        }
        continue
    }

    Write-Host "BLOB PRESENT: $fileName"
}

Write-Host ''
Write-Host "Missing source files: $($missingSources.Count)"
Write-Host "Failed existence checks: $($failedChecks.Count)"
Write-Host "Skipped existing blobs: $($skipped.Count)"
Write-Host "Uploads that would run: $($plannedUploads.Count)"
Write-Host "Failed uploads: $($failedUploads.Count)"
Write-Host "Blobs missing after verification: $($missingBlobs.Count)"

$failed = $missingSources.Count -gt 0 -or $failedChecks.Count -gt 0 -or $failedUploads.Count -gt 0
if ($Execute) {
    $failed = $failed -or $missingBlobs.Count -gt 0
}

if ($failed) {
    exit 1
}

exit 0
