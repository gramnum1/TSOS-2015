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

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        //bufferList stores commands entered
        public bufferList=[];
        public pid=0;


        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            //date
            sc= new ShellCommand(this.shellDate,
                "date",
                "displays the current date and time");
            this.commandList[this.commandList.length]=sc;

            //whereami
            sc= new ShellCommand(this.shellWhereami,
                "whereami",
                "displays your location");
            this.commandList[this.commandList.length]=sc;

            //again
            sc= new ShellCommand(this.shellAgain,
                "again",
                "executes previous command");
            this.commandList[this.commandList.length]=sc;

            //hello
            sc = new ShellCommand(this.shellHello,
                "hello",
                "says hello world");
            this.commandList[this.commandList.length]=sc;

            //status
            sc= new ShellCommand(this.shellStatus,
                                "status",
                                "this command displays a status");
            this.commandList[this.commandList.length]=sc;

            //load
            sc= new ShellCommand(this.shellLoad,
                                "load",
                                "Loads from the user program section");
            this.commandList[this.commandList.length]=sc;

            //error
            sc= new ShellCommand(this.shellError,
                                "error",
                                "displays an error");
            this.commandList[this.commandList.length]=sc;

            //run
            sc=new ShellCommand(this.shellRun, "run", "runs program");
            this.commandList[this.commandList.length]=sc;

            //clearmem
            sc=new ShellCommand(this.shellClearMem, "clearmem", "clears memory");
            this.commandList[this.commandList.length]=sc;

            //ps
            sc=new ShellCommand(this.shellPS, "ps", "display active processes");
            this.commandList[this.commandList.length]=sc;

            //runall
            sc=new ShellCommand(this.shellRunAll, "runall", "run all programs");
            this.commandList[this.commandList.length]=sc;

            //quantum
            sc=new ShellCommand(this.shellQuantum, "quantum", "<int> - sets the quantum");
            this.commandList[this.commandList.length]=sc;

            //kill
            sc=new ShellCommand(this.shellKill, "kill", "<int> - kills an active process");
            this.commandList[this.commandList.length]=sc;
            //create <filename>
            sc=new ShellCommand(this.shellCreateFile, "create", "<string> - creates filename");
            this.commandList[this.commandList.length]=sc;
            //read <filename>
            sc=new ShellCommand(this.shellReadFile, "read", "<string> - reads filename");
            this.commandList[this.commandList.length]=sc;
            //write <filename> "data"
            sc=new ShellCommand(this.shellWriteFile, "write", "<String> \"data\" - writes data into filename");
            this.commandList[this.commandList.length]=sc;
            //delete <filename>
            sc=new ShellCommand(this.shellDeleteFile, "delete", "<String>  - deletes filename");
            this.commandList[this.commandList.length]=sc;
            //ls
            sc=new ShellCommand(this.shellLS, "ls", "lists files in file system");
            this.commandList[this.commandList.length]=sc;
            //format
            sc=new ShellCommand(this.shellFormat, "format", "formats the disk");
            this.commandList[this.commandList.length]=sc;














            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                    //puts the buffer into bufferList
                    _OsShell.bufferList[_OsShell.bufferList.length]=buffer;

                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver Displays the version number");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown turns off the os");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen");
                        break;
                    case "man":
                        _StdOut.putText("man displays the manual for given topic");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 does rot13 obfuscation on <string>");
                        break;
                    case "trace":
                        _StdOut.putText("Trace [on \\ off] turns trace on and off");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt sets the prompt string");
                        break;
                    case "date":
                        _StdOut.putText("date displays the current date.");
                        break;
                    case "whereami":
                        _StdOut.putText("whereami displays your location");
                        break;
                    case "again":
                        _StdOut.putText("again executes the last command");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        //shellDate()  Outputs the date onto the console
        public shellDate(args) {
            var theDate=new Date();
            var month= theDate.getUTCMonth()+1;
            _StdOut.putText(month+"/"+theDate.getUTCDate()+"/"+theDate.getUTCFullYear()+" "+theDate.getHours()+":"+theDate.getMinutes()+":"+theDate.getSeconds());
        }
        //shellWhereami() outputs your location to the console
        public shellWhereami(args){
            _StdOut.putText("Slaving away at OS in some dark corner");
        }
        //shellAgain(args) executes the last executed command once more
        public shellAgain(args){
            //output the command to the console
            _StdOut.putText(_OsShell.bufferList[_OsShell.bufferList.length-2]);
            //re execute the command
            _OsShell.handleInput(_OsShell.bufferList[_OsShell.bufferList.length-2]);
        }
        //shellHello()  outputs hello world.
        public shellHello(args){
            _StdOut.putText("Hello World");

        }
        //shelStatus(args)  puts date in the status bar and some information depending on a topic
        public shellStatus(args){
            var theDate=new Date();
            var month= theDate.getUTCMonth()+1;
            var date2=month+"/"+theDate.getUTCDate()+"/"+theDate.getUTCFullYear()+" "+theDate.getHours()+":"+theDate.getMinutes()+":"+theDate.getSeconds();
            _Bar.value=date2;
            if (args.length > 0) {


                var topic = args[0];
                switch (topic) {
                    case "canvas": //gives canvas height
                        _Bar.value+=" Canvas Height is "+_Canvas.height;
                        break;
                    case "buffer": //gives number of commands in bufferList[]
                        _Bar.value+=" There are "+_OsShell.bufferList.length+" Commands stored in history";
                        break;
                    default:
                        _Bar.value+=" please enter [canvas || buffer]";

                }

        }
    }
        //shellLoad()  takes value of user program input and if its valid prints program is good, if invalid outputs program is invalid
        public shellLoad(args){
            var program=_Program.value;
            if(program!=""){
            program=program.replace(/\s+/g, '').toUpperCase();
            //_StdOut.putText(program);
            var toMemory="";
            var pass=true;
            var i=0;
            var index=0;


            var pcb;

            for(var i = 0; i < program.length; i++){
                if(program.charAt(i).match(/[0-9A-F]/g)==null){
                    pass=false;

                }
            }
            if(pass){
                _StdOut.putText("Program is good");
                _StdOut.advanceLine();

                _MemMan.loadProgram(program);
                var wind = new Audio("wind.mp3");
                wind.play();




        }else {
                _StdOut.putText("program is invalid");

            }}else{

            _StdOut.putText("User Program Input is empty");
            }
        }

        public shellError(args){
            _Kernel.krnTrapError("a random error");
        }

        /*shellRun(args)
        checks to see if number after run
        matches number in PCB.pid,
        turns on isExecuting
        resets PC back to 0
         */
        public shellRun(args){
            var found=false;
            var nQ;
            for(var i=0; i< Resident_List.getSize(); i++) {
                if (args == Resident_List.getObj(i).pid) {
                    found=true;
                    nQ=Resident_List.remove(Resident_List.getObj(i).pid);

                    nQ.state="ready";
                    nQ.PC=nQ.base;



                    _ReadyQ.enqueue(nQ);
                    _CPU.isExecuting = true;
                }
            }if(!found) {
                _StdOut.putText("not a valid pid "+ args);
            }


        }

        /*shellClearMem(args)
        calls clearMem() in memory manager
        clears memory, resident list, and
        resets load resources
         */
        public shellClearMem(args){
            _MemMan.clearMem();

        }

        /*shellPS(args)
        displays list of
        running and waiting
        processes
         */
        public shellPS(args){
            if(_CPU.isExecuting) {
                _StdOut.putText("Running Process pid=" + _CPU.currPCB.pid);
                _StdOut.advanceLine();

                for (var i = 0; i < _ReadyQ.getSize(); i++) {
                    _StdOut.putText("Waiting Process pid=" + _ReadyQ.getObj(i).pid);
                    _StdOut.advanceLine();
                }
            }else{
                _StdOut.putText("No Active Processes");
                _StdOut.advanceLine();
            }
        }

        /*shellRunAll(args)
        runs all programs currently in the
        Resident_List
         */
        public shellRunAll(args){
            var nQ;
            while(Resident_List.isEmpty()==false) {
                _Kernel.krnTrace("Process pid="+Resident_List.getObj(0).pid);
                nQ=Resident_List.dequeue();
                nQ.state="ready";

                _ReadyQ.enqueue(nQ);



            }

            _CPU.isExecuting = true;

        }

        /*shellQuantum(args)
        allows user to change
        the quantum value
        for round robin
         */
        public shellQuantum(args){
            var q;
            if(isNaN(args) || ( q=parseInt(args))<=0 ){
                _StdOut.putText("Please set the quantum to an INT > 0");
                _StdOut.advanceLine();

            }else{
                 //q=parseInt(args);

                    _CPUSCHED.quantum=q;
                    _StdOut.putText("Quantum set to "+q);
                    _StdOut.advanceLine();

                }
            }
        /*shellKill(args)
        kills a running or
         waiting process
         */
        public shellKill(args){
            var pid;
            var found=false;
            if(_CPU.isExecuting) {
                // if args invalid
                if (isNaN(args) || ( pid = parseInt(args)) < 0) {
                    _StdOut.putText("Please enter a valid pid");
                    _StdOut.advanceLine();

                }else{
                    // if process to kill is running
                    if(pid==_CPU.currPCB.pid){

                        if(_ReadyQ.isEmpty()==false) {

                                _KernelInterruptQueue.enqueue(new Interrupt(CPUSCHED_REPLACE_IRQ,0));


                        }else{
                            _CPU.terminate();

                        }
                        found=true;
                        _StdOut.putText("Process "+pid+" killed.");
                        _StdOut.advanceLine();
                    }else{
                        for (var i = 0; i < _ReadyQ.getSize(); i++) {
                            if(pid==_ReadyQ.getObj(i).pid){
                                _ReadyQ.remove(pid);
                                _StdOut.putText("Process "+pid+" killed.");
                                _StdOut.advanceLine();
                                found=true;
                                break;

                            }


                        }

                    }
                    if(!found){
                        _StdOut.putText("No matching pid found.");
                        _StdOut.advanceLine();

                    }else{
                        //play sound
                        var audio = new Audio("processKilled.mp3");
                        audio.play();

                    }

                }

            }

        }
        public shellCreateFile(args){
            var filename=args;
            if(_krnFSDD.createFile(filename)){
                _StdOut.putText("File "+filename+" Created Succesfully");
                _StdOut.advanceLine();
            }else{
                _StdOut.putText("File "+filename+" Not Created");
                _StdOut.advanceLine();
            }

        }

        public shellReadFile(args){
            var filename=args;
            var read=_krnFSDD.readFile(filename);
            _StdOut.putText("File: "+filename);
            _StdOut.advanceLine();
            _StdOut.putText(read);

            }

        public shellWriteFile(args){


            var i=0;
            var input=args.toString();
            //args=args.toString().replace(/,/g, " ");
           // _Kernel.krnTrace("input: "+args);
            var filename="";
            var data="";
            while(i<args.length || args.toString().charAt(i)!=String.fromCharCode(44)){
                filename+=args.toString().charAt(i);
                //_Kernel.krnTrace(filename);
                i++;




            }
            //_Kernel.krnTrace("i: "+i);
            var j = i+2;
            while(j<args.length||args.toString().charAt(j)!=String.fromCharCode(34)){
               // _Kernel.krnTrace("j: "+j);
                data+=args.toString().charAt(j);
                //_Kernel.krnTrace(data);
                j++;
            }
            filename=filename.trim();
            _StdOut.putText("filename= "+filename+" data= "+data);
            if(_krnFSDD.write(filename, data)){
                _StdOut.putText("file "+filename+" written successfully");
                _StdOut.advanceLine();
            }else{
                _StdOut.putText("error writing to file "+filename);
                _StdOut.advanceLine();
            }

}
        public shellDeleteFile(args){
            var filename=args;
            if(_krnFSDD.delete(filename)){
                _StdOut.putText("File "+filename+" deleted successfully");
                _StdOut.advanceLine();
            }else{
                _StdOut.putText("Error Deleting File "+filename);
                _StdOut.advanceLine();

            }
        }
        public shellLS(args){
            _krnFSDD.list();
        }
        public shellFormat(args){
            _krnFSDD.init();
            Control.updateDiskTable();
            _StdOut.putText("Disk Formatted Successfully");
            _StdOut.advanceLine();
        }


}}
