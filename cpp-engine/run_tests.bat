@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURATION ---
:: Option B applied: Matches your direct compiler output path
set "ENGINE_EXE=allocator.exe"
set "TEST_DIR=test"
set "OUTPUT_DIR=test_output"

echo ===================================================
echo   Exam Seating Engine - Advanced Regression Tests
echo ===================================================
echo.

if not exist "%ENGINE_EXE%" (
    echo [ERROR] Engine executable not found: %ENGINE_EXE%
    echo Expected file in the current directory. Please run:
    echo g++ src/main.cpp src/*.cpp -Iinclude -o allocator.exe
    exit /b 1
)

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

set "TOTAL_TESTS=0"
set "PASSED_TESTS=0"
set "FAILED_TESTS=0"
set "SUMMARY_LIST="

:: --- ITERATE TEST CASES ---
for %%F in ("%TEST_DIR%\input_*.json") do (
    set /a TOTAL_TESTS+=1
    set "FILENAME=%%~nxF"
    set "OUT_FILE=%OUTPUT_DIR%\out_%%~nF.json"
    set "LOG_FILE=%OUTPUT_DIR%\%%~nF.log"
    
    :: Determine Expected Failure Patterns based on the spec
    set "EXPECT_FAIL=0"
    if "!FILENAME!"=="input_capacity_overflow.json" set "EXPECT_FAIL=1"
    if "!FILENAME!"=="input_duplicate_students.json" set "EXPECT_FAIL=1"
    if "!FILENAME!"=="input_invalid_room.json"       set "EXPECT_FAIL=1"
    if "!FILENAME!"=="input_empty_students.json"     set "EXPECT_FAIL=1"
    if "!FILENAME!"=="input_empty_rooms.json"        set "EXPECT_FAIL=1"

    :: Execute engine and direct stderr/stdout safely to a distinct log file
    "%ENGINE_EXE%" "%%F" "!OUT_FILE!" > "!LOG_FILE!" 2>&1
    set "EXIT_CODE=!errorlevel!"

    set "TEST_PASSED=1"
    set "REASON="

    if "!EXPECT_FAIL!"=="1" (
        :: --- EXPECTED TO FAIL PATH ---
        if !EXIT_CODE! equ 0 (
            set "TEST_PASSED=0"
            set "REASON=Engine returned exit code 0 but should have failed validation"
        ) else if exist "!OUT_FILE!" (
            :: Check if it explicitly serialized "success":false
            findstr /C:"\"success\":false" "!OUT_FILE!" >nul 2>&1
            if !errorlevel! neq 0 (
                set "TEST_PASSED=0"
                set "REASON=Engine failed but did not output explicit '\"success\":false' string"
            )
        )
    ) else (
        :: --- EXPECTED TO SUCCEED PATH ---
        if !EXIT_CODE! neq 0 (
            set "TEST_PASSED=0"
            set "REASON=Engine crashed or exited with error code !EXIT_CODE!"
        ) else if not exist "!OUT_FILE!" (
            set "TEST_PASSED=0"
            set "REASON=Output JSON file was never created"
        ) else (
            :: Verify file size is greater than 0 bytes
            for %%A in ("!OUT_FILE!") do (
                if %%~zA equ 0 (
                    set "TEST_PASSED=0"
                    set "REASON=Output JSON is empty (0 bytes)"
                )
            )
            
            :: Verify internal JSON payload contains true success signature
            if "!TEST_PASSED!"=="1" (
                findstr /C:"\"success\":true" "!OUT_FILE!" >nul 2>&1
                if !errorlevel! neq 0 (
                    set "TEST_PASSED=0"
                    set "REASON=Engine exited with 0 but contract string contains '\"success\":false'"
                )
            )
        )
    )

    :: Record and Log Live Metric Results
    if "!TEST_PASSED!"=="1" (
        set "SUMMARY_LIST=!SUMMARY_LIST! [✓] !FILENAME!!NL!"
        set /a PASSED_TESTS+=1
    ) else (
        set "SUMMARY_LIST=!SUMMARY_LIST! [✗] !FILENAME! - !REASON!!NL!"
        set /a FAILED_TESTS+=1
        echo   -[ALERT] !FILENAME! failed: !REASON!
    )
)

:: --- PRINT GRANULAR TEST SUMMARY ---
echo.
echo ===================================================
echo   DETAILED ANALYSIS RESULTS
echo ===================================================
:: Hacky clean way to echo multi-line batch lists safely
for /f "tokens=* delims=" %%S in ("!SUMMARY_LIST!") do (
    echo %%S
)
echo ===================================================
echo   AGGREGATE METRICS
echo ===================================================
echo  Total Evaluated : %TOTAL_TESTS%
echo  Passed          : %PASSED_TESTS%
echo  Failed          : %FAILED_TESTS%
echo ===================================================

if %FAILED_TESTS% gtr 0 (
    echo [STATUS] Build Regression Detected! See details above.
    exit /b 1
) else (
    echo [STATUS] All functional pipelines stable. Clean pass.
    exit /b 0
)