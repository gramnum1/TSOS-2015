///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            _Bar = document.getElementById('sbar'); //Status Bar HTML TextArea
            _Program = document.getElementById('taProgramInput'); //User Program Input TextArea
            _MemTable = document.getElementById('mTable'); //Memory Table
            _CPUTable = document.getElementById('cpuTable'); //CPU Table
            _PCBTable = document.getElementById('pcbTable'); //PCBTable
            _ReadyTable = document.getElementById('readyQTable');
            _Light = document.getElementById('light'); //Ligt to show whether cpu is executing or not
            this.initMemoryTable();
            //Create the date string and put it in _Bar
            var theDate = new Date();
            var month = theDate.getUTCMonth() + 1;
            var date = month + "/" + theDate.getUTCDate() + "/" + theDate.getUTCFullYear() + " " + theDate.getHours() + ":" + theDate.getMinutes() + ":" + theDate.getSeconds();
            _Bar.value = date + " enter 'status canvas' or 'status buffer'";
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " " + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            _Light.style.color = "red";
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Mem = new TSOS.Memory(); //initialize memory
            _Mem.init();
            _MemMan = new TSOS.MemoryManager(); //initialize memory manager
            this.initCPUTable(); //initialize CPU Table
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Mode = 1;
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        /*singleStepToggle(tog)
        Manages turning on and off
        single step mode with the toggle
         */
        Control.singleStepToggle = function (tog) {
            var btnStep = document.getElementById('step');
            if (_StepMode == false) {
                _StepMode = true;
                btnStep.disabled = false;
                btnStep.style.display = "inline";
            }
            else {
                _StepMode = false;
                btnStep.disabled = true;
                btnStep.style.display = "none";
            }
        };
        /*step(btn)
        turns makes _Step true when
        step button is pressed
         */
        Control.step = function (btn) {
            _Step = true;
        };
        /*initCPUTable()
        initializes and updates the
        CPUTable
         */
        Control.initCPUTable = function () {
            _CPUTable.rows[1].cells[0].innerHTML = _CPU.PC;
            _CPUTable.rows[1].cells[1].innerHTML = _CPU.op;
            _CPUTable.rows[1].cells[2].innerHTML = _CPU.Acc;
            _CPUTable.rows[1].cells[3].innerHTML = _CPU.Xreg;
            _CPUTable.rows[1].cells[4].innerHTML = _CPU.Yreg;
            _CPUTable.rows[1].cells[5].innerHTML = _CPU.Zflag;
        };
        /*initMemoryTable()
        initializes the Memory Table
         */
        Control.initMemoryTable = function () {
            //create new rows
            for (var i = 0; i < MAX_MEM / 8; ++i) {
                var row = _MemTable.insertRow(i);
                //create cells in these new rows
                for (var j = 0; j < 9; ++j) {
                    var cell = row.insertCell(j);
                    //first col
                    if (j == 0) {
                        //label marks the first address in a row
                        var label = (i * 8).toString(16).toLocaleUpperCase();
                        cell.innerHTML = "0x" + label;
                    }
                    else {
                        cell.innerHTML = "00";
                    }
                }
            }
        };
        /*updateMemoryTable
        Updates the memory Table
        durring runtime
         */
        Control.updateMemoryTable = function () {
            var memoryIndex = 0;
            var rowIndex;
            var colIndex;
            //grab existing row
            for (var i = 0; i < MAX_MEM / 8; ++i) {
                rowIndex = i;
                //grab existing cell
                for (var j = 0; j < 9; ++j) {
                    colIndex = j;
                    if (colIndex == 0) {
                    }
                    else {
                        if (_Mem.coreM[memoryIndex] == null) {
                            _MemTable.rows[rowIndex].cells[colIndex].innerHTML = "00";
                            memoryIndex++;
                        }
                        else {
                            _MemTable.rows[rowIndex].cells[colIndex].innerHTML = _Mem.coreM[memoryIndex];
                            memoryIndex++;
                        }
                    }
                }
            }
        };
        /*
        updatePCBTable()
        updates the PCBTable after process terminates
         */
        Control.updatePCBTable = function () {
            _PCBTable.rows[1].cells[0].innerHTML = _PCB.pid;
            _PCBTable.rows[1].cells[1].innerHTML = _PCB.state;
            _PCBTable.rows[1].cells[2].innerHTML = _PCB.PC;
            _PCBTable.rows[1].cells[3].innerHTML = _PCB.Acc;
            _PCBTable.rows[1].cells[4].innerHTML = _PCB.Xreg;
            _PCBTable.rows[1].cells[5].innerHTML = _PCB.Yreg;
            _PCBTable.rows[1].cells[6].innerHTML = _PCB.Zflag;
        };
        Control.addToReadyTable = function () {
            //var rownum=numPCBs;
            var currPCB;
            _StdOut.putText(_ReadyQ.getSize().toString());
            for (var i = 0; i < _ReadyQ.getSize(); i++) {
                currPCB = _ReadyQ.getObj(i);
                var row = _ReadyTable.insertRow(i + 1);
                var rownum = i + 1;
                for (var j = 0; j < 5; j++) {
                    var cell = row.insertCell(j);
                }
                _ReadyTable.rows[rownum].cells[0].innerHTML = currPCB.pid;
                _ReadyTable.rows[rownum].cells[1].innerHTML = currPCB.state;
                _ReadyTable.rows[rownum].cells[2].innerHTML = currPCB.base;
                _ReadyTable.rows[rownum].cells[3].innerHTML = currPCB.limit;
                _ReadyTable.rows[rownum].cells[4].innerHTML = currPCB.PC;
            }
        };
        Control.updateReadyTable = function () {
            var currPCB;
            for (var i = 0; i < _ReadyQ.getSize(); i++) {
                currPCB = _ReadyQ.getObj(i);
                var rownum = i + 1;
                _ReadyTable.rows[rownum].cells[0].innerHTML = currPCB.pid;
                _ReadyTable.rows[rownum].cells[1].innerHTML = currPCB.state;
                _ReadyTable.rows[rownum].cells[2].innerHTML = currPCB.base;
                _ReadyTable.rows[rownum].cells[3].innerHTML = currPCB.limit;
                _ReadyTable.rows[rownum].cells[4].innerHTML = currPCB.PC;
            }
        };
        /*checkExe()
        if CPU is executing light is green
        if CPU is not executing light is red
        usefull for nowing whether cpu is done
        executing or is in an infinite loop
        or is done executing
         */
        Control.checkExe = function () {
            if (_CPU.isExecuting) {
                _Light.style.color = "green";
            }
            else {
                _Light.style.color = "red";
            }
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
