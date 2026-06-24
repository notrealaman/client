$logFile = "$PSScriptRoot\next-dev.log"
$process = Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npx next dev -p 3000" -WorkingDirectory $PSScriptRoot -RedirectStandardOutput $logFile -RedirectStandardError $logFile -PassThru
Write-Output "Started Next.js with PID $($process.Id)"
$process.Id | Out-File -FilePath "$PSScriptRoot\next.pid"
