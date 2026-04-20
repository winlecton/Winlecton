@echo off
title WinLectron Launcher
echo.
echo  ================================================
echo    WinLectron - Windows OS Simulator
echo  ================================================
echo.
echo  Select a version to launch:
echo.
echo    [1] Windows 10
echo    [2] Windows 11
echo    [3] Exit
echo.
set /p choice="  Your choice: "

if "%choice%"=="1" (
  echo  Launching Windows 10...
  call npx electron . --os=win10
) else if "%choice%"=="2" (
  echo  Launching Windows 11...
  call npx electron . --os=win11
) else if "%choice%"=="3" (
  exit
) else if "%option%" == 01341(
  color 2
  echo.
  title WinLectron - EXE BUILDER
echo  ================================================
echo    WinLectron - Windows OS Simulator
echo  ================================================
echo.
echo  Select an option for EXE or application.
echo.
echo 1. Windows
echo 2. MacOS
echo 3. Linux

set /p choice="Your choice: "
pause
if "%choice%" == 1 (
    :windows
) else if "%choice%" == 2 (
    :macos
) else if "%choice%" == 3 (
    :linux
) else (
    echo Invalid choice. Please select 1, 2, or 3.
    exit
)
) else (
  echo Invalid choice. Please select 1, 2, or 3.
  exit
)

:windows
cls
echo  Building EXE for Windows...
call npm build:win
pause
exit

:macos
cls
echo  Building Application for MacOS...
call npm build:mac
pause
exit

:linux
cls
echo Building Application for ^$30(&JD)#
color 4
echo Building Application for Linux...
call npm build:linux
pause
exit