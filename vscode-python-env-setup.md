# VSCode Python Environment Setup Guide

To fix the "fastapi" import underlining issue in VSCode, follow these steps:

1. **Select the Correct Python Interpreter**
   - Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P).
   - Type and select `Python: Select Interpreter`.
   - Choose the interpreter from your virtual environment, e.g.:
     ```
     d:/LEGAL_DOCUMENTSUMZ/legal_summarizer_env/Scripts/python.exe
     ```
   - This ensures VSCode uses the Python environment where FastAPI is installed.

2. **Install Python Extension**
   - Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
   - Search for "Python" by Microsoft.
   - Install and enable it if not already done.

3. **Reload VSCode**
   - After selecting the interpreter and installing the extension, reload VSCode to apply changes.

4. **Check Problems Tab**
   - Open the Problems tab (Ctrl+Shift+M or Cmd+Shift+M).
   - The import underlining for `fastapi` should be resolved.

5. **Additional Tips**
   - Ensure your virtual environment is activated in the integrated terminal.
   - Run `pip list` in the terminal to confirm `fastapi` is installed.
   - If issues persist, try restarting VSCode or your computer.

Following these steps will fix the import resolution and linting issues related to FastAPI in VSCode.
