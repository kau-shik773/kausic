$apk = "KAUSIC-v50-debug.apk"
Write-Host "Monitoring ADB for connected device..."

for ($i = 0; $i -lt 300; $i++) {
    $out = (& adb devices) | Out-String
    if ($out -match "\b(\w+)\s+device\b") {
        $dev = $matches[1]
        Write-Host "Device detected: $dev"
        Write-Host "Installing $apk..."
        & adb -s $dev install -r $apk
        Write-Host "Launching KAUSIC app..."
        & adb -s $dev shell am start -n "com.kausic.music/com.kausic.music.MainActivity"
        Write-Host "App launched on device successfully!"
        break
    } elseif ($out -match "\b(\w+)\s+unauthorized\b") {
        Write-Host "Device detected but unauthorized! Please unlock phone and tap ALLOW."
    }
    Start-Sleep -Seconds 2
}
