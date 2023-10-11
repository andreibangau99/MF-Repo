$resultsContent='<testsuites xmlns:xsi="http:\\www.w3.org\2001\XMLSchema-instance" xmlns:xsd="http:\\www.w3.org\2001\XMLSchema" name="uftRunnerRoot">
<testsuite tests="1" failures="0" errors="0" skipped="0" package="FTToolsLauncher"> report="test_sources\source_control_2018\jars\GUITest3\Report1" status="error"
</testsuites>
del'
$newResultContent= $resultsContent  -replace('/','\') -replace ($WORKSPACE_PATH, '') -replace ('file:\\\\\\', '') -replace ('<\\','</') -replace('xmlns:xsi="[^"]*"','') -replace('xmlns:xsd="[^"]*"','') -replace ('package=\"FTToolsLauncher\"','') -replace ('status=\"([^"]*)\"','status="$1" package="FTToolsLauncher"')
Write-Output $newResultContent