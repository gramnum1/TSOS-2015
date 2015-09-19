///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.bufferList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "displays the current date and time");
            this.commandList[this.commandList.length] = sc;
            //whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "displays your location");
            this.commandList[this.commandList.length] = sc;
            //again
            sc = new TSOS.ShellCommand(this.shellAgain, "again", "repeats last command");
            this.commandList[this.commandList.length] = sc;
            //sprint
            sc = new TSOS.ShellCommand(this.shellSprint, "sprint", "print to status bar");
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                    _OsShell.bufferList[_OsShell.bufferList.length] = buffer;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
    execute(fn, args ?  : );
    {
        // We just got a command, so advance the line...
        _StdOut.advanceLine();
        // ... call the command function passing in the args with some über-cool functional programming ...
        fn(args);
        // Check to see if we need to advance the line again
        if (_StdOut.currentXPosition > 0) {
            _StdOut.advanceLine();
        }
        // ... and finally write the prompt again.
        this.putPrompt();
    }
    parseInput(buffer);
    TSOS.UserCommand;
    {
        var retVal = new TSOS.UserCommand();
        // 1. Remove leading and trailing spaces.
        buffer = TSOS.Utils.trim(buffer);
        // 2. Lower-case it.
        buffer = buffer.toLowerCase();
        // 3. Separate on spaces so we can determine the command and command-line args, if any.
        var tempList = buffer.split(" ");
        // 4. Take the first (zeroth) element and use that as the command.
        var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
        // 4.1 Remove any left-over spaces.
        cmd = TSOS.Utils.trim(cmd);
        // 4.2 Record it in the return value.
        retVal.command = cmd;
        // 5. Now create the args array from what's left.
        for (var i in tempList) {
            var arg = TSOS.Utils.trim(tempList[i]);
            if (arg != "") {
                retVal.args[retVal.args.length] = tempList[i];
            }
        }
        return retVal;
    }
    shellInvalidCommand();
    {
        _StdOut.putText("Invalid Command. ");
        if (_SarcasticMode) {
            _StdOut.putText("Unbelievable. You, [subject name here],");
            _StdOut.advanceLine();
            _StdOut.putText("must be the pride of [subject hometown here].");
        }
        else {
            _StdOut.putText("Type 'help' for, well... help.");
        }
    }
    shellCurse();
    {
        _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
        _StdOut.advanceLine();
        _StdOut.putText("Bitch.");
        _SarcasticMode = true;
    }
    shellApology();
    {
        if (_SarcasticMode) {
            _StdOut.putText("I think we can put our differences behind us.");
            _StdOut.advanceLine();
            _StdOut.putText("For science . . . You monster.");
            _SarcasticMode = false;
        }
        else {
            _StdOut.putText("For what?");
        }
    }
    shellVer(args);
    {
        _StdOut.putText(APP_NAME + " version " + APP_VERSION);
    }
    shellHelp(args);
    {
        _StdOut.putText("Commands:");
        for (var i in _OsShell.commandList) {
            _StdOut.advanceLine();
            _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
        }
    }
    shellShutdown(args);
    {
        _StdOut.putText("Shutting down...");
        // Call Kernel shutdown routine.
        _Kernel.krnShutdown();
    }
    shellCls(args);
    {
        _StdOut.clearScreen();
        _StdOut.resetXY();
    }
    shellMan(args);
    {
        if (args.length > 0) {
            var topic = args[0];
            switch (topic) {
                case "help":
                    _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                    break;
                // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                case "ver":
                    _StdOut.putText("ver displays the current version data.");
                    break;
                case "shutdown":
                    _StdOut.putText("shutdown shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                    break;
                case "cls":
                    _StdOut.putText("cls clears the console screen and adjusts cursor");
                    break;
                case "man":
                    _StdOut.putText("man <topic> displays a manual for the given topic");
                    break;
                case "trace":
                    _StdOut.putText("trace [on || off] turns os trace on or off");
                    break;
                case "rot13":
                    _StdOut.putText("rot13 <string> - Does rot13 obfuscation on <string>.");
                    break;
                case "prompt":
                    _StdOut.putText("prompt <string> - Sets the prompt.");
                    break;
                case "date":
                    _StdOut.putText("date displays the month/day/year and hours:minutes:seconds");
                    break;
                case "whereami":
                    _StdOut.putText("whereami displays your current location");
                    break;
                default:
                    _StdOut.putText("No manual entry for " + args[0] + ".");
            }
        }
        else {
            _StdOut.putText("Usage: man <topic>  Please supply a topic.");
        }
    }
    shellTrace(args);
    {
        if (args.length > 0) {
            var setting = args[0];
            switch (setting) {
                case "on":
                    if (_Trace && _SarcasticMode) {
                        _StdOut.putText("Trace is already on, doofus.");
                    }
                    else {
                        _Trace = true;
                        _StdOut.putText("Trace ON");
                    }
                    break;
                case "off":
                    _Trace = false;
                    _StdOut.putText("Trace OFF");
                    break;
                default:
                    _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
            }
        }
        else {
            _StdOut.putText("Usage: trace <on | off>");
        }
    }
    shellRot13(args);
    {
        if (args.length > 0) {
            // Requires Utils.ts for rot13() function.
            _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
        }
        else {
            _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
        }
    }
    shellPrompt(args);
    {
        if (args.length > 0) {
            _OsShell.promptStr = args[0];
        }
        else {
            _StdOut.putText("Usage: prompt <string>  Please supply a string.");
        }
    }
    shellDate(args);
    {
        var theDate = new Date();
        var month = theDate.getMonth() + 1;
        _StdOut.putText(month + "/" + theDate.getUTCDate() + "/" + theDate.getUTCFullYear() + " " + theDate.getHours() + ":" + theDate.getMinutes() + ":" + theDate.getSeconds());
    }
    shellWhereami(args);
    {
        _StdOut.putText("How should I know? I'm just an operating system.");
    }
    shellAgain(args);
    {
        _StdOut.putText(_OsShell.bufferList[_OsShell.bufferList.length - 2]);
        _OsShell.handleInput(_OsShell.bufferList[_OsShell.bufferList.length - 2]);
    }
})(TSOS || (TSOS = {}));
