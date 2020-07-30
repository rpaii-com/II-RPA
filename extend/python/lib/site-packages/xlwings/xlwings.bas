Attribute VB_Name = "xlwings"
#Const App = "Microsoft Excel" 'Adjust when using outside of Excel
'Version: 0.15.8

'xlwings is distributed under a BSD 3-clause license.
'
'Copyright (C) 2014-2019, Zoomer Analytics LLC.
'All rights reserved.
'
'Redistribution and use in source and binary forms, with or without modification,
'are permitted provided that the following conditions are met:
'
'* Redistributions of source code must retain the above copyright notice, this
'  list of conditions and the following disclaimer.
'
'* Redistributions in binary form must reproduce the above copyright notice, this
'  list of conditions and the following disclaimer in the documentation and/or
'  other materials provided with the distribution.
'
'* Neither the name of the copyright holder nor the names of its
'  contributors may be used to endorse or promote products derived from
'  this software without specific prior written permission.
'
'THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
'ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
'WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
'DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
'ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
'(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
'LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
'ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
'(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
'SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'Attribute VB_Name = "Main"


#If VBA7 Then
    #If Mac Then
        Private Declare PtrSafe Function system Lib "libc.dylib" (ByVal Command As String) As Long
    #End If
    #If Win64 Then
        Const XLPyDLLName As String = "xlwings64-0.15.8.dll"
        Declare PtrSafe Function XLPyDLLActivateAuto Lib "xlwings64-0.15.8.dll" (ByRef result As Variant, Optional ByVal Config As String = "", Optional ByVal mode As Long = 1) As Long
        Declare PtrSafe Function XLPyDLLNDims Lib "xlwings64-0.15.8.dll" (ByRef src As Variant, ByRef dims As Long, ByRef transpose As Boolean, ByRef dest As Variant) As Long
        Declare PtrSafe Function XLPyDLLVersion Lib "xlwings64-0.15.8.dll" (tag As String, VERSION As Double, arch As String) As Long
    #Else
        Private Const XLPyDLLName As String = "xlwings32-0.15.8.dll"
        Declare PtrSafe Function XLPyDLLActivateAuto Lib "xlwings32-0.15.8.dll" (ByRef result As Variant, Optional ByVal Config As String = "", Optional ByVal mode As Long = 1) As Long
        Private Declare PtrSafe Function XLPyDLLNDims Lib "xlwings32-0.15.8.dll" (ByRef src As Variant, ByRef dims As Long, ByRef transpose As Boolean, ByRef dest As Variant) As Long
        Private Declare PtrSafe Function XLPyDLLVersion Lib "xlwings32-0.15.8.dll" (tag As String, VERSION As Double, arch As String) As Long
    #End If
    Private Declare PtrSafe Function LoadLibrary Lib "kernel32" Alias "LoadLibraryA" (ByVal lpLibFileName As String) As Long
#Else
    #If Mac Then
        Private Declare Function system Lib "libc.dylib" (ByVal Command As String) As Long
    #End If
    Private Const XLPyDLLName As String = "xlwings32-0.15.8.dll"
    Private Declare Function XLPyDLLActivateAuto Lib "xlwings32-0.15.8.dll" (ByRef result As Variant, Optional ByVal Config As String = "", Optional ByVal mode As Long = 1) As Long
    Private Declare Function XLPyDLLNDims Lib "xlwings32-0.15.8.dll" (ByRef src As Variant, ByRef dims As Long, ByRef transpose As Boolean, ByRef dest As Variant) As Long
    Private Declare Function LoadLibrary Lib "kernel32" Alias "LoadLibraryA" (ByVal lpLibFileName As String) As Long
    Declare Function XLPyDLLVersion Lib "xlwings32-0.15.8.dll" (tag As String, VERSION As Double, arch As String) As Long
#End If

Public Const XLWINGS_VERSION As String = "0.15.8"

Public Function RunPython(PythonCommand As String)
    ' Public API: Runs the Python command, e.g.: to run the function foo() in module bar, call the function like this:
    ' RunPython ("import bar; bar.foo()")

    Dim INTERPRETER As String, PYTHONPATH As String, LOG_FILE As String
    Dim OPTIMIZED_CONNECTION As Boolean

    INTERPRETER = GetConfig("INTERPRETER", "python")
    PYTHONPATH = GetDirectoryPath() & ";" & GetBaseName(ThisWorkbook.FullName) & ".zip;" & GetConfig("PYTHONPATH")
    LOG_FILE = GetConfig("LOG FILE")
    OPTIMIZED_CONNECTION = GetConfig("USE UDF SERVER", False)
    

    ' Call Python platform-dependent
    #If Mac Then
            Application.StatusBar = "Running..."  ' Non-blocking way of giving feedback that something is happening
        #If MAC_OFFICE_VERSION >= 15 Then
            ExecuteMac PythonCommand, INTERPRETER, LOG_FILE, PYTHONPATH
        #Else
            ExcecuteMac2011 PythonCommand, INTERPRETER, LOG_FILE, PYTHONPATH
        #End If
    #Else
        If OPTIMIZED_CONNECTION = True Then
            Py.SetAttr Py.Module("xlwings._xlwindows"), "BOOK_CALLER", ThisWorkbook
            Py.Exec "" & PythonCommand & ""
        Else
            ExecuteWindows False, PythonCommand, INTERPRETER, LOG_FILE, PYTHONPATH
        End If
    #End If
End Function

Sub ExcecuteMac2011(PythonCommand As String, PYTHON_MAC As String, LOG_FILE As String, Optional PYTHONPATH As String)
    #If Mac Then
    ' Run Python with the "-c" command line switch: add the path of the python file and run the
    ' Command as first argument, then provide the WORKBOOK_FULLNAME and "from_xl" as 2nd and 3rd arguments.
    ' Finally, redirect stderr to the LOG_FILE and run as background process.

    Dim PythonInterpreter As String, RunCommand As String, WORKBOOK_FULLNAME As String, Log, Arguments As String
    Dim CondaCmd As String, CondaBase As String, CondaEnv As String
    Dim Res As Integer

    If LOG_FILE = "" Then
        LOG_FILE = "/tmp/xlwings.log"
    Else
        LOG_FILE = ToPosixPath(LOG_FILE)
    End If

    ' Delete Log file just to make sure we don't show an old error
    On Error Resume Next
        KillFileOnMac ToMacPath(LOG_FILE)
    On Error GoTo 0

    ' Transform from MacOS Classic path style (":") and Windows style ("\") to Bash friendly style ("/")
    PYTHONPATH = ToPosixPath(PYTHONPATH)
    If PYTHON_MAC <> "" Then
        If PYTHON_MAC <> "python" And PYTHON_MAC <> "pythonw" Then
            PythonInterpreter = ToPosixPath(PYTHON_MAC)
        Else
            PythonInterpreter = PYTHON_MAC
        End If
    Else
        PythonInterpreter = "python"
    End If
    WORKBOOK_FULLNAME = ToPosixPath(ThisWorkbook.Path & ":" & ThisWorkbook.Name) 'ThisWorkbook.FullName doesn't handle unicode on Excel 2011

    ' Build the command (ignore warnings to be in line with Windows where we only show the popup if the ExitCode <> 0
    ' -u is needed because on PY3 stderr is buffered by default and so wouldn't be available on time for the pop-up to show
    RunCommand = PythonInterpreter & " -u -B -W ignore -c ""import sys, os; sys.path[0:0]=os.path.normcase(os.path.expandvars(r'" & PYTHONPATH & "')).split(';'); " & PythonCommand & """ "

    ' Send the command to the shell. Courtesy of Robert Knight (http://stackoverflow.com/a/12320294/918626)
    ' Since Excel blocks AppleScript as long as a VBA macro is running, we have to excecute the call as background call
    ' so it can do its magic after this Function has terminated. Python calls ClearUp via the atexit handler.

    'Check if .bash_profile is existing and source it
    Res = system("source ~/.bash_profile")
    Arguments = " ""--wb=" & WORKBOOK_FULLNAME & """ ""--from_xl=1""" & " ""--app=" & ToPosixPath(Application.Path) & "/" & Application.Name & Chr(34) & "> /dev/null 2>" & Chr(34) & LOG_FILE & Chr(34)
    If Res = 0 Then
        Res = system("source ~/.bash_profile;" & RunCommand & Arguments & " &")
    Else
        Res = system(RunCommand & Arguments & " &")
    End If

    ' If there's a log at this point (normally that will be from the shell only, not Python) show it and reset the StatusBar
    On Error Resume Next
        Log = ReadFile(LOG_FILE)
        If Log = "" Then
            Exit Sub
        Else
            ShowError (LOG_FILE)
            Application.StatusBar = False
        End If
    On Error GoTo 0
    #End If
End Sub

Sub ExecuteMac(PythonCommand As String, PYTHON_MAC As String, LOG_FILE As String, Optional PYTHONPATH As String)
    #If Mac Then
    Dim PythonInterpreter As String, RunCommand As String, WORKBOOK_FULLNAME As String, Log As String
    Dim ParameterString As String, ExitCode As String, CondaCmd As String, CondaBase As String, CondaEnv As String

    ' Transform paths
    PYTHONPATH = ToPosixPath(PYTHONPATH)

    If PYTHON_MAC <> "" Then
        If PYTHON_MAC <> "python" And PYTHON_MAC <> "pythonw" Then
            PythonInterpreter = ToPosixPath(PYTHON_MAC)
        Else
            PythonInterpreter = PYTHON_MAC
        End If
    Else
        PythonInterpreter = "python"
    End If

    WORKBOOK_FULLNAME = ToPosixPath(ThisWorkbook.FullName)
    If LOG_FILE = "" Then
        ' Sandbox location that requires no file access confirmation
        LOG_FILE = Environ("HOME") + "/xlwings.log" '/Users/<User>/Library/Containers/com.microsoft.Excel/Data/xlwings_log.txt
    Else
        LOG_FILE = ToPosixPath(LOG_FILE)
    End If

    ' Delete Log file just to make sure we don't show an old error
    On Error Resume Next
        Kill LOG_FILE
    On Error GoTo 0

    ' ParameterSting with all paramters (AppleScriptTask only accepts a single parameter)
    ParameterString = PYTHONPATH + ";"
    ParameterString = ParameterString + "|" + PythonInterpreter
    ParameterString = ParameterString + "|" + PythonCommand
    ParameterString = ParameterString + "|" + ThisWorkbook.FullName
    ParameterString = ParameterString + "|" + Left(Application.Path, Len(Application.Path) - 4)
    ParameterString = ParameterString + "|" + LOG_FILE

    On Error GoTo AppleScriptErrorHandler
        ExitCode = AppleScriptTask("xlwings.applescript", "VbaHandler", ParameterString)
    On Error GoTo 0

    ' If there's a log at this point (normally that will be from the shell only, not Python) show it and reset the StatusBar
    On Error Resume Next
        Log = ReadFile(LOG_FILE)
        If Log = "" Then
            Exit Sub
        Else
            ShowError (LOG_FILE)
            Application.StatusBar = False
        End If
        Exit Sub
    On Error GoTo 0

AppleScriptErrorHandler:
    MsgBox "To enable RunPython, please run 'xlwings runpython install' in a terminal once and try again.", vbCritical
    #End If
End Sub

Sub ExecuteWindows(IsFrozen As Boolean, PythonCommand As String, PYTHON_WIN As String, LOG_FILE As String, _
                   Optional PYTHONPATH As String, Optional FrozenArgs As String)
    ' Call a command window and change to the directory of the Python installation or frozen executable
    ' Note: If Python is called from a different directory with the fully qualified path, pywintypesXX.dll won't be found.
    ' This seems to be a general issue with pywin32, see http://stackoverflow.com/q/7238403/918626

    Dim Wsh As Object
    Dim WaitOnReturn As Boolean: WaitOnReturn = True
    Dim WindowStyle As Integer: WindowStyle = 0
    Set Wsh = CreateObject("WScript.Shell")
    Dim DriveCommand As String, RunCommand As String, WORKBOOK_FULLNAME As String
    Dim PythonInterpreter As String, PythonDir As String, CondaCmd As String, CondaBase As String, CondaEnv As String
    Dim ExitCode As Integer

    If LOG_FILE = "" Then
        LOG_FILE = Environ("APPDATA") + "\xlwings.log"
    End If

    If Not IsFrozen And (PYTHON_WIN <> "python" And PYTHON_WIN <> "pythonw") Then
        If FileExists(PYTHON_WIN) Then
            PythonDir = ParentFolder(PYTHON_WIN)
        Else
            MsgBox "Could not find Interpreter!", vbCritical
            Exit Sub
        End If
    Else
        PythonDir = ""  ' TODO: hack
    End If

    If Left$(PYTHON_WIN, 2) Like "[A-Za-z]:" Then
        ' If Python is installed on a mapped or local drive, change to drive, then cd to path
        DriveCommand = Left$(PYTHON_WIN, 2) & " & cd """ & PythonDir & """ & "
    ElseIf Left$(PYTHON_WIN, 2) = "\\" Then
        ' If Python is installed on a UNC path, temporarily mount and activate a drive letter with pushd
        DriveCommand = "pushd """ & PythonDir & """ & "
    End If

    ' Run Python with the "-c" command line switch: add the path of the python file and run the
    ' Command as first argument, then provide the WORKBOOK_FULLNAME and "from_xl" as 2nd and 3rd arguments.
    ' Then redirect stderr to the LOG_FILE and wait for the call to return.
    WORKBOOK_FULLNAME = ThisWorkbook.FullName

    If PYTHON_WIN <> "python" And PYTHON_WIN <> "pythonw" Then
        PythonInterpreter = Chr(34) & PYTHON_WIN & Chr(34)
    Else
        PythonInterpreter = "python"
    End If
    
    CondaBase = GetConfig("CONDA BASE")
    CondaEnv = GetConfig("CONDA ENV")
    
    If CondaBase <> "" And CondaEnv <> "" Then
        CondaCmd = CondaBase & "\condabin\conda activate " & CondaEnv & " && "
    Else
        CondaCmd = ""
    End If

    If IsFrozen = False Then
        RunCommand = CondaCmd & PythonInterpreter & " -B -c ""import sys, os; sys.path[0:0]=os.path.normcase(os.path.expandvars(r'" & PYTHONPATH & "')).split(';'); " & PythonCommand & """ "
    ElseIf IsFrozen = True Then
        RunCommand = Chr(34) & PythonCommand & Chr(34) & " " & FrozenArgs & " "
    End If

    ExitCode = Wsh.Run("cmd.exe /C " & DriveCommand & _
                   RunCommand & _
                   " --wb=" & """" & WORKBOOK_FULLNAME & """ --from_xl=1" & " --app=" & Chr(34) & _
                   Application.Path & "\" & Application.Name & Chr(34) & " --hwnd=" & Chr(34) & Application.Hwnd & Chr(34) & _
                   " 2> """ & LOG_FILE & """ ", _
                   WindowStyle, WaitOnReturn)

    'If ExitCode <> 0 then there's something wrong
    If ExitCode <> 0 Then
        Call ShowError(LOG_FILE)
    End If

    ' Delete file after the error message has been shown
    On Error Resume Next
        'Kill LOG_FILE
    On Error GoTo 0

    ' Clean up
    Set Wsh = Nothing
End Sub

Public Function RunFrozenPython(Executable As String, Optional Args As String)
    ' Runs a Python executable that has been frozen by PyInstaller and the like. Call the function like this:
    ' RunFrozenPython "C:\path\to\frozen_executable.exe", "arg1 arg2". Currently not implemented for Mac.

    Dim LOG_FILE As String

    LOG_FILE = GetConfig("LOG FILE")

    ' Call Python
    #If Mac Then
        MsgBox "This functionality is not yet supported on Mac." & vbNewLine & _
               "Please run your scripts directly in Python!", vbCritical + vbOKOnly, "Unsupported Feature"
    #Else
        ExecuteWindows True, Executable, ParentFolder(Executable), LOG_FILE, , Args
    #End If
End Function

Function GetUdfModules() As String
    Dim UDF_MODULES As String

    UDF_MODULES = GetConfig("UDF MODULES")

    If UDF_MODULES = "" Then
        GetUdfModules = Left$(ThisWorkbook.Name, Len(ThisWorkbook.Name) - 5) ' assume that it ends in .xlsm
    Else
        GetUdfModules = UDF_MODULES
    End If
End Function

Private Sub CleanUp()
    'On Mac only, this function is being called after Python is done (using Python's atexit handler)
    Dim LOG_FILE As String

    LOG_FILE = GetConfig("LOG FILE")

    If LOG_FILE = "" Then
        #If MAC_OFFICE_VERSION >= 15 Then
            LOG_FILE = Environ("HOME") + "/xlwings.log" '~/Library/Containers/com.microsoft.Excel/Data/xlwings_log.txt
        #Else
            LOG_FILE = "/tmp/xlwings.log"
        #End If
    Else
        LOG_FILE = ToPosixPath(LOG_FILE)
    End If

    'Show the LOG_FILE as MsgBox if not empty
    On Error Resume Next
    If ReadFile(LOG_FILE) <> "" Then
        Call ShowError(LOG_FILE)
    End If
    On Error GoTo 0

    'Clean up
    Application.StatusBar = False
    Application.ScreenUpdating = True
    On Error Resume Next
        #If MAC_OFFICE_VERSION >= 15 Then
            Kill LOG_FILE
        #Else
            KillFileOnMac ToMacPath(ToPosixPath(LOG_FILE))
        #End If
    On Error GoTo 0
End Sub

Function XLPyCommand()
    Dim PYTHON_WIN As String, PYTHONPATH As String, LOG_FILE As String, tail As String
    Dim CondaCmd As String, CondaBase As String, CondaEnv As String
    Dim DEBUG_UDFS As Boolean
    
    If GetDirectoryPath() <> "" Then
        PYTHONPATH = GetDirectoryPath() & ";" & GetBaseName(ThisWorkbook.FullName) & ".zip;" & GetConfig("PYTHONPATH")
    Else
        PYTHONPATH = GetConfig("PYTHONPATH")
    End If
    
    
    PYTHON_WIN = GetConfig("INTERPRETER", "pythonw")
    DEBUG_UDFS = GetConfig("DEBUG UDFS", False)


    CondaBase = GetConfig("CONDA BASE")
    CondaEnv = GetConfig("CONDA ENV")
    
    If (PYTHON_WIN = "python" Or PYTHON_WIN = "pythonw") And (CondaBase <> "" And CondaEnv <> "") Then
        CondaCmd = CondaBase & "\condabin\conda activate " & CondaEnv & " && "
        PYTHON_WIN = "cmd.exe /K " & CondaCmd & PYTHON_WIN
    End If

    If DEBUG_UDFS = True Then
        XLPyCommand = "{506e67c3-55b5-48c3-a035-eed5deea7d6d}"
    Else
        tail = " -B -c ""import sys, os;sys.path[0:0]=os.path.normcase(os.path.expandvars(r'" & PYTHONPATH & "')).split(';');import xlwings.server; xlwings.server.serve('$(CLSID)')"""
        XLPyCommand = PYTHON_WIN & tail
    End If
End Function

Private Sub XLPyLoadDLL()
    Dim PYTHON_WIN As String, CondaCmd As String, CondaBase As String, CondaEnv As String

    PYTHON_WIN = GetConfig("INTERPRETER", "pythonw")
    CondaBase = GetConfig("CONDA BASE")
    CondaEnv = GetConfig("CONDA ENV")
    
    If (PYTHON_WIN = "python" Or PYTHON_WIN = "pythonw") And (CondaBase <> "" And CondaEnv <> "") Then
        ' This only works if the envs are in their default location
        ' Otherwise you'll have to add the full path for the interpreter in addition to the conda infos
        PYTHON_WIN = CondaBase & "\envs\" & CondaEnv & "\" & PYTHON_WIN
    End If

    If (PYTHON_WIN <> "python" And PYTHON_WIN <> "pythonw") Or (CondaBase <> "" And CondaEnv <> "") Then
        If LoadLibrary(ParentFolder(PYTHON_WIN) + "\" + XLPyDLLName) = 0 Then  ' Standard installation
            If LoadLibrary(ParentFolder(ParentFolder(PYTHON_WIN)) + "\" + XLPyDLLName) = 0 Then  ' Virtualenv
                Err.Raise 1, Description:= _
                    "Could not load " + XLPyDLLName + " from either of the following folders: " _
                    + vbCrLf + ParentFolder(PYTHON_WIN) _
                    + vbCrLf + ", " + ParentFolder(ParentFolder(PYTHON_WIN))
            End If
        End If
    End If
End Sub

Function NDims(ByRef src As Variant, dims As Long, Optional transpose As Boolean = False)
    XLPyLoadDLL
    If 0 <> XLPyDLLNDims(src, dims, transpose, NDims) Then Err.Raise 1001, Description:=NDims
End Function

Function Py()
    XLPyLoadDLL
    If 0 <> XLPyDLLActivateAuto(Py, XLPyCommand, 1) Then Err.Raise 1000, Description:=Py
End Function

Sub KillPy()
    XLPyLoadDLL
    Dim unused
    If 0 <> XLPyDLLActivateAuto(unused, XLPyCommand, -1) Then Err.Raise 1000, Description:=unused
End Sub

Sub ImportPythonUDFs()
    Dim tempPath As String, errorMsg As String
    On Error GoTo ImportError
        tempPath = Py.Str(Py.Call(Py.Module("xlwings"), "import_udfs", Py.Tuple(GetUdfModules, ThisWorkbook)))
    Exit Sub
ImportError:
    errorMsg = Err.Description & " " & Err.Number
    MsgBox errorMsg, vbCritical, "Error"
End Sub

Private Sub GetDLLVersion()
    ' Currently only for testing
    Dim tag As String, arch As String
    Dim ver As Double
    XLPyDLLVersion tag, ver, arch
    Debug.Print tag
    Debug.Print ver
    Debug.Print arch
End Sub




'Attribute VB_Name = "Config"



Function GetDirectoryPath() As String
    ' Leaving this here for now because we currently don't have #Const App in Utils
    Dim Path As String
    #If App = "Microsoft Excel" Then
        On Error Resume Next 'On Mac, this is called when exiting the Python interpreter
            Path = ThisWorkbook.Path
        On Error GoTo 0
    #ElseIf App = "Microsoft Word" Then
        Path = ThisDocument.Path
    #ElseIf App = "Microsoft Access" Then
        Path = CurrentProject.Path ' Won't be transformed for standalone module as ThisProject doesn't exit
    #ElseIf App = "Microsoft PowerPoint" Then
        Path = ActivePresentation.Path ' Won't be transformed for standalone module ThisPresentation doesn't exist
    #Else
        Exit Function
    #End If
    GetDirectoryPath = Path
End Function

Function GetConfigFilePath() As String
    #If Mac Then
        #If MAC_OFFICE_VERSION >= 15 Then
            ' ~/Library/Containers/com.microsoft.Excel/Data/xlwings.conf
            GetConfigFilePath = GetMacDir("Home") & "/" & "xlwings.conf"
        #Else
            ' True home dir
            GetConfigFilePath = GetMacDir("Home") & "/" & ".xlwings/xlwings.conf"
        #End If
    #Else
        GetConfigFilePath = Environ("USERPROFILE") & "\.xlwings\" & "xlwings.conf"
    #End If
End Function

Function GetDirectoryConfigFilePath() As String
    Dim pathSeparator As String
    
    #If Mac Then ' Application.PathSeparator doesn't seem to exist in Access...
        pathSeparator = "/"
    #Else
        pathSeparator = "\"
    #End If
    
    GetDirectoryConfigFilePath = GetDirectoryPath() & pathSeparator & "xlwings.conf"
End Function

Function GetConfigFromSheet()
    Dim lastCell As Range, cell As Range
    #If Mac Then
    Dim d As Dictionary
    Set d = New Dictionary
    #Else
    Dim d As Object
    Set d = CreateObject("Scripting.Dictionary")
    #End If
    Dim sht As Worksheet
    Set sht = ThisWorkbook.Sheets("xlwings.conf")

    If sht.Range("A2") = "" Then
        Set lastCell = sht.Range("A1")
    Else
        Set lastCell = sht.Range("A1").End(xlDown)
    End If

    For Each cell In Range(sht.Range("A1"), lastCell)
        d.Add UCase(cell.Value), cell.Offset(0, 1).Value
    Next cell
    Set GetConfigFromSheet = d
End Function

Function GetConfig(configKey As String, Optional default As String = "") As Variant
    ' An entry in xlwings.conf sheet overrides the config file/ribbon
    Dim configValue As String
    
    If Application.Name = "Microsoft Excel" Then
    
        If SheetExists("xlwings.conf") = True Then
            GetConfig = GetConfigFromSheet.Item(configKey)
        End If
    End If

    ' An entry in the workbook directory's optional xlwings.conf file overrides the config file/ribbon
    If GetConfig = "" And FileExists(GetDirectoryConfigFilePath()) = True Then
        If GetConfigFromFile(GetDirectoryConfigFilePath(), configKey, configValue) Then
            GetConfig = configValue
        End If
    End If

    ' Global Config
    If GetConfig = "" And FileExists(GetConfigFilePath()) = True Then
        If GetConfigFromFile(GetConfigFilePath(), configKey, configValue) Then
            GetConfig = configValue
        End If
    End If

    ' Defaults
    If GetConfig = "" Then
        GetConfig = default
    End If
    
    ' Expand environment variables
    GetConfig = ExpandEnvironmentStrings(GetConfig)
End Function

Function SaveConfigToFile(sFileName As String, sName As String, Optional sValue As String) As Boolean
'Adopted from http://peltiertech.com/save-retrieve-information-text-files/

  Dim iFileNumA As Long, iFileNumB As Long, lErrLast As Long
  Dim sFile As String, sXFile As String, sVarName As String, sVarValue As String
    
  #If Mac Then
    #If MAC_OFFICE_VERSION < 15 Then
      sFileName = ToMacPath(sFileName)
    #End If
  #End If
      
    
  #If Mac Then
    If Not FileOrFolderExistsOnMac(ParentFolder(sFileName)) Then
  #Else
    If Len(Dir(ParentFolder(sFileName), vbDirectory)) = 0 Then
  #End If
     MkDir ParentFolder(sFileName)
  End If

  ' assume false unless variable is successfully saved
  SaveConfigToFile = False

  ' temporary file
  sFile = sFileName
  sXFile = sFileName & "_temp"

  ' open text file to read settings
  If FileExists(sFile) Then
    'replace existing settings file
    iFileNumA = FreeFile
    Open sFile For Input As iFileNumA
    iFileNumB = FreeFile
    Open sXFile For Output As iFileNumB
      Do While Not EOF(iFileNumA)
        Input #iFileNumA, sVarName, sVarValue
        If sVarName <> sName Then
          Write #iFileNumB, sVarName, sVarValue
        End If
      Loop
      Write #iFileNumB, sName, sValue
      SaveConfigToFile = True
    Close #iFileNumA
    Close #iFileNumB
    FileCopy sXFile, sFile
    Kill sXFile
  Else
    ' make new file
    iFileNumB = FreeFile
    Open sFile For Output As iFileNumB
      Write #iFileNumB, sName, sValue
      SaveConfigToFile = True
    Close #iFileNumB
  End If

End Function

Function GetConfigFromFile(sFile As String, sName As String, Optional sValue As String) As Boolean
'Adopted from http://peltiertech.com/save-retrieve-information-text-files/

  Dim iFileNum As Long, lErrLast As Long
  Dim sVarName As String, sVarValue As String

  #If Mac Then
    #If MAC_OFFICE_VERSION < 15 Then
      sFile = ToMacPath(sFile)
    #End If
  #End If

  ' assume false unless variable is found
  GetConfigFromFile = False

  ' open text file to read settings
  If FileExists(sFile) Then
    iFileNum = FreeFile
    Open sFile For Input As iFileNum
      Do While Not EOF(iFileNum)
        Input #iFileNum, sVarName, sVarValue
        If sVarName = sName Then
          sValue = sVarValue
          GetConfigFromFile = True
          Exit Do
        End If
      Loop
    Close #iFileNum
  End If

End Function

'Attribute VB_Name = "Extensions"
Function sql(query, ParamArray tables())
        If TypeOf Application.Caller Is Range Then On Error GoTo failed
        ReDim argsArray(1 To UBound(tables) - LBound(tables) + 2)
        argsArray(1) = query
        For K = LBound(tables) To UBound(tables)
        argsArray(2 + K - LBound(tables)) = tables(K)
        Next K
        sql = Py.CallUDF("xlwings.ext", "sql", argsArray, ThisWorkbook, Application.Caller)
        Exit Function
failed:
        sql = Err.Description
End Function

'Attribute VB_Name = "Utils"


Function IsFullName(sFile As String) As Boolean
  ' if sFile includes path, it contains path separator "\" or "/"
  IsFullName = InStr(sFile, "\") + InStr(sFile, "/") > 0
End Function

Function FileExists(ByVal FileSpec As String) As Boolean
    #If Mac Then
        FileExists = FileOrFolderExistsOnMac(FileSpec)
    #Else
        FileExists = FileExistsOnWindows(FileSpec)
    #End If
End Function

Function FileExistsOnWindows(ByVal FileSpec As String) As Boolean
   ' by Karl Peterson MS MVP VB
   Dim Attr As Long
   ' Guard against bad FileSpec by ignoring errors
   ' retrieving its attributes.
   On Error Resume Next
   Attr = GetAttr(FileSpec)
   If Err.Number = 0 Then
      ' No error, so something was found.
      ' If Directory attribute set, then not a file.
      FileExistsOnWindows = Not ((Attr And vbDirectory) = vbDirectory)
   End If
End Function


Function FileOrFolderExistsOnMac(FileOrFolderstr As String) As Boolean
'Ron de Bruin : 26-June-2015
'Function to test whether a file or folder exist on a Mac in office 2011 and up
'Uses AppleScript to avoid the problem with long names in Office 2011,
'limit is max 32 characters including the extension in 2011.
    Dim ScriptToCheckFileFolder As String
    Dim TestStr As String
    
    #If Mac Then
    If Val(Application.VERSION) < 15 Then
        ScriptToCheckFileFolder = "tell application " & Chr(34) & "System Events" & Chr(34) & _
         "to return exists disk item (" & Chr(34) & FileOrFolderstr & Chr(34) & " as string)"
        FileOrFolderExistsOnMac = MacScript(ScriptToCheckFileFolder)
    Else
        On Error Resume Next
        TestStr = Dir(FileOrFolderstr, vbDirectory)
        On Error GoTo 0
        If Not TestStr = vbNullString Then FileOrFolderExistsOnMac = True
    End If
    #End If
End Function

Function ParentFolder(ByVal Folder)
  #If Mac Then
      ParentFolder = Left$(Folder, InStrRev(Folder, "/") - 1)
  #Else
      ParentFolder = Left$(Folder, InStrRev(Folder, "\") - 1)
  #End If
End Function

Function GetDirectory(Path)
    #If Mac Then
    GetDirectory = Left(Path, InStrRev(Path, "/"))
    #Else
    GetDirectory = Left(Path, InStrRev(Path, "\"))
    #End If
End Function

Function KillFileOnMac(Filestr As String)
    'Ron de Bruin
    '30-July-2012
    'Delete files from a Mac.
    'Uses AppleScript to avoid the problem with long file names (on 2011 only)

    Dim ScriptToKillFile As String
    
    #If Mac Then
    ScriptToKillFile = "tell application " & Chr(34) & "Finder" & Chr(34) & Chr(13)
    ScriptToKillFile = ScriptToKillFile & "do shell script ""rm "" & quoted form of posix path of " & Chr(34) & Filestr & Chr(34) & Chr(13)
    ScriptToKillFile = ScriptToKillFile & "end tell"

    On Error Resume Next
        MacScript (ScriptToKillFile)
    On Error GoTo 0
    #End If
End Function

Function ToMacPath(PosixPath As String) As String
    ' This function transforms a Posix Path into a MacOS Path
    ' E.g. "/Users/<User>" --> "MacintoshHD:Users:<User>"
    #If Mac Then
    ToMacPath = MacScript("set mac_path to POSIX file " & Chr(34) & PosixPath & Chr(34) & " as string")
    #End If
End Function

Function GetMacDir(dirName As String) As String
    ' Get Mac special folders. Protetcted so they don't exectue on Windows.

    Dim Path As String

    #If Mac Then
        Select Case dirName
            Case "Home"
                Path = MacScript("return (path to home folder) as string")
             Case "Desktop"
                Path = MacScript("return (path to desktop folder) as string")
            Case "Applications"
                Path = MacScript("return (path to applications folder) as string")
            Case "Documents"
                Path = MacScript("return (path to documents folder) as string")
        End Select
            GetMacDir = Left$(Path, Len(Path) - 1) ' get rid of trailing "/"
            GetMacDir = ToPosixPath(GetMacDir)
    #Else
        GetMacDir = ""
    #End If
End Function

Function ToPosixPath(ByVal MacPath As String) As String
    'This function accepts relative paths with backward and forward slashes: ThisWorkbook & "\test"
    ' E.g. "MacintoshHD:Users:<User>" --> "/Users/<User>"

    Dim s As String
    Dim LeadingSlash As Boolean
    
    #If Mac Then
    If MacPath = "" Then
        ToPosixPath = ""
    Else
        #If MAC_OFFICE_VERSION < 15 Then
            If Left$(MacPath, 1) = "/" Then
                LeadingSlash = True
            End If
            MacPath = Replace(MacPath, "\", ":")
            MacPath = Replace(MacPath, "/", ":")
            s = "tell application " & Chr(34) & "Finder" & Chr(34) & Chr(13)
            s = s & "POSIX path of " & Chr(34) & MacPath & Chr(34) & Chr(13)
            s = s & "end tell" & Chr(13)
            If LeadingSlash = True Then
                ToPosixPath = "/" + MacScript(s)
            Else
                ToPosixPath = MacScript(s)
            End If
            If Left$(ToPosixPath, 2) = "/$" Then
                ' If it starts with an env variables, it's otherwise not correctly returned
                ToPosixPath = Right$(ToPosixPath, Len(ToPosixPath) - 1)
            End If

        #Else
            ToPosixPath = Replace(MacPath, "\", "/")
            ToPosixPath = MacScript("return POSIX path of (" & Chr(34) & MacPath & Chr(34) & ") as string")
        #End If
    End If
    #End If
End Function

Sub ShowError(FileName As String)
    ' Shows a MsgBox with the content of a text file

    Dim Content As String
    Dim objShell

    Const OK_BUTTON_ERROR = 16
    Const AUTO_DISMISS = 0

    Content = ReadFile(FileName)
    #If Mac Then
        MsgBox Content, vbCritical, "Error"
    #Else
        Content = Content & vbCrLf
        Content = Content & "Press Ctrl+C to copy this message to the clipboard."

        Set objShell = CreateObject("Wscript.Shell")
        objShell.Popup Content, AUTO_DISMISS, "Error", OK_BUTTON_ERROR
    #End If

End Sub

Function ExpandEnvironmentStrings(ByVal s As String)
    ' Expand environment variables under Windows
    #If Mac Then
        ExpandEnvironmentStrings = s
    #Else
        Dim objShell As Object
        Set objShell = CreateObject("WScript.Shell")
        ExpandEnvironmentStrings = objShell.ExpandEnvironmentStrings(s)
        Set objShell = Nothing
    #End If
End Function

Function ReadFile(ByVal FileName As String)
    ' Read a text file

    Dim Content As String
    Dim Token As String
    Dim FileNum As Integer
    Dim objShell As Object

    #If Mac Then
        FileName = ToMacPath(FileName)
    #Else
        FileName = ExpandEnvironmentStrings(FileName)
    #End If

    FileNum = FreeFile
    Content = ""

    ' Read Text File
    Open FileName For Input As #FileNum
        Do While Not EOF(FileNum)
            Line Input #FileNum, Token
            Content = Content & Token & vbCrLf
        Loop
    Close #FileNum

    ReadFile = Content
End Function

Function SheetExists(sheetName As String) As Boolean
    Dim sht As Worksheet
    On Error Resume Next
        Set sht = ThisWorkbook.Sheets(sheetName)
    On Error GoTo 0
    SheetExists = Not sht Is Nothing
End Function

Function GetBaseName(wb As String) As String
    Dim extension As String
    extension = LCase$(Right$(wb, 4))
    If extension = ".xls" Or extension = ".xla" Or extension = ".xlt" Then
        GetBaseName = Left$(wb, Len(wb) - 4)
    Else
        GetBaseName = Left$(wb, Len(wb) - 5)
    End If
End Function