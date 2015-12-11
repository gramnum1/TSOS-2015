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
module TSOS {

    export class Control {




        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');
            _Bar=<HTMLTextAreaElement>document.getElementById('sbar');  //Status Bar HTML TextArea
            _Program=<HTMLTextAreaElement>document.getElementById('taProgramInput');  //User Program Input TextArea
            _MemTable=<HTMLTableElement>document.getElementById('mTable');    //Memory Table
            _CPUTable=<HTMLTableElement>document.getElementById('cpuTable');  //CPU Table
            _PCBTable=<HTMLTableElement>document.getElementById('pcbTable');  //PCBTable
            _ReadyTable=<HTMLTableElement>document.getElementById('readyQTable');
            _DiskTable=<HTMLTableElement>document.getElementById("diskTable");
            _Light=<HTMLSpanElement>document.getElementById('light');         //Ligt to show whether cpu is executing or not
            HUM.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
            HUM.volume=.2;



            this.initMemoryTable();

            //Create the date string and put it in _Bar
            var theDate = new Date();
            var month=theDate.getUTCMonth()+1;
            var date=month+"/"+theDate.getUTCDate()+"/"+theDate.getUTCFullYear()+" "+theDate.getHours()+":"+theDate.getMinutes()+":"+theDate.getSeconds();
            _Bar.value=date+" enter 'status canvas' or 'status buffer'";

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;
            

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "clock:"+clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " "  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            HUM.play();

            var start=new Audio("start.mp3");
            start.play();
            _Light.style.color="red";
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Mem= new Memory(); //initialize memory
            _Mem.init();
            _MemMan=new MemoryManager();  //initialize memory manager
            this.initCPUTable();          //initialize CPU Table
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Mode=1;
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
            _Kernel.krnTrace("Tracks: "+_krnFSDD.tracks);
            this.initDiskTable();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }



        /*singleStepToggle(tog)
        Manages turning on and off
        single step mode with the toggle
         */
        public static singleStepToggle(tog): void{
            var btnStep=document.getElementById('step');
            var t=new Audio("switch.mp3");
            t.play();
            var on=new Audio("sson.mp3");
            var off=new Audio ("ssoff.mp3");


            if(_StepMode==false){
                _StepMode=true;
                btnStep.disabled=false;
                btnStep.style.display="inline";
                on.play();



            }else{
                _StepMode=false;
                btnStep.disabled=true;
                btnStep.style.display="none";
                off.play();


            }


        }


        /*step(btn)
        turns makes _Step true when
        step button is pressed
         */
        public static step(btn): void{
            _Step=true;
        }


        /*initCPUTable()
        initializes and updates the
        CPUTable
         */
        public static initCPUTable():void{

            _CPUTable.rows[1].cells[0].innerHTML=_CPU.PC;
            _CPUTable.rows[1].cells[1].innerHTML=_CPU.op;
            _CPUTable.rows[1].cells[2].innerHTML=_CPU.Acc;
            _CPUTable.rows[1].cells[3].innerHTML=_CPU.Xreg;
            _CPUTable.rows[1].cells[4].innerHTML=_CPU.Yreg;
            _CPUTable.rows[1].cells[5].innerHTML=_CPU.Zflag;


        }


        /*initMemoryTable()
        initializes the Memory Table
         */
        public static initMemoryTable():void{
            //create new rows
            for(var i=0; i<MAX_MEM/8; ++i){
                var row=_MemTable.insertRow(i);
                //create cells in these new rows
                for(var j=0; j<9; ++j){
                    var cell=row.insertCell(j);
                    //first col
                    if(j==0) {
                        //label marks the first address in a row
                        var label = (i * 8).toString(16).toLocaleUpperCase();
                        cell.innerHTML = "0x" + label;
                    }else{
                        cell.innerHTML="00";
                    }
                }
            }
        }
        public static initDiskTable(): void{
            var i=1;

            for(var t=0; t<_krnFSDD.tracks; t++){
                for(var s=0; s<_krnFSDD.sections; s++){
                    for(var b=0; b<_krnFSDD.blocks; b++){
                        var tsb=t+":"+s+":"+b;
                        var meta=sessionStorage.getItem(t+""+s+""+b).substr(0,4);
                        var data=sessionStorage.getItem(t+""+s+""+b).substr(4);




                        var row=_DiskTable.insertRow(i);
                        for(var j=0; j<3; j++){
                            var cell=row.insertCell(j);
                        }






                        _DiskTable.rows[i].cells[0].innerHTML= tsb;
                        _DiskTable.rows[i].cells[1].innerHTML=meta;
                        _DiskTable.rows[i].cells[2].innerHTML=data;

                        i++;

                    }
                }
            }
        }

        public static updateDiskTable(): void{
            var i=1;
            for(var t=0; t<_krnFSDD.tracks; t++) {
                for (var s = 0; s < _krnFSDD.sections; s++) {
                    for (var b = 0; b < _krnFSDD.blocks; b++) {
                        var tsb = t + ":" + s + ":" + b;
                        var meta = sessionStorage.getItem(t + "" + s + "" + b).substr(0, 4);
                        var data = sessionStorage.getItem(t + "" + s + "" + b).substr(4);
                        _DiskTable.rows[i].cells[0].innerHTML = tsb;
                        _DiskTable.rows[i].cells[1].innerHTML = meta;
                        _DiskTable.rows[i].cells[2].innerHTML = data;
                        i++;
                    }
                }
            }

        }




        /*updateMemoryTable
        Updates the memory Table
        durring runtime
         */
        public static updateMemoryTable(): void{
            var memoryIndex=0;
            var rowIndex;
            var colIndex;
            //grab existing row
            for(var i=0; i<MAX_MEM/8; ++i){
                rowIndex=i;
                //grab existing cell
                for(var j=0; j<9; ++j){
                    colIndex=j;
                    if(colIndex==0) {
                       //do nothing!!!!!!!!!!!
                    }else{
                        if(_Mem.coreM[memoryIndex]==null){
                            _MemTable.rows[rowIndex].cells[colIndex].innerHTML ="00";
                            memoryIndex++;
                        }else {
                            _MemTable.rows[rowIndex].cells[colIndex].innerHTML = _Mem.coreM[memoryIndex];
                            memoryIndex++;
                        }
                    }

                    }
                }



            }
        /*
        updatePCBTable()
        updates the PCBTable after process terminates
         */
        public static updatePCBTable(): void{


            _PCBTable.rows[1].cells[0].innerHTML = _CPU.currPCB.pid;
            _PCBTable.rows[1].cells[1].innerHTML = _CPU.currPCB.state;
            _PCBTable.rows[1].cells[2].innerHTML = _CPU.currPCB.PC;
            _PCBTable.rows[1].cells[3].innerHTML = _CPU.currPCB.Acc;
            _PCBTable.rows[1].cells[4].innerHTML = _CPU.currPCB.Xreg;
            _PCBTable.rows[1].cells[5].innerHTML = _CPU.currPCB.Yreg;
            _PCBTable.rows[1].cells[6].innerHTML = _CPU.currPCB.Zflag;

        }


       /*updateReadyTable()
       dynamically updates the Ready Table with
       the current contents of the ReadyQ
       durring runtime
        */
        public static updateReadyTable():void{

            var currPCB;
           //clear the ready table
            while(_ReadyTable.rows.length!=1){
               _ReadyTable.deleteRow(1);
           }

            //for every object in the readyq inseert a row with 5 cells
            for(var i =1; i<=_ReadyQ.getSize(); ++i) {
                //set currPCB to an item in ready q
                currPCB = _ReadyQ.getObj(i-1);
                var row=_ReadyTable.insertRow(i);
                for(var j=0; j<5; ++j){
                    var cell= row.insertCell(j);

                }


                //fill cells with data
                _ReadyTable.rows[i].cells[0].innerHTML = currPCB.pid;
                _ReadyTable.rows[i].cells[1].innerHTML = currPCB.state;
                _ReadyTable.rows[i].cells[2].innerHTML = currPCB.base;
                _ReadyTable.rows[i].cells[3].innerHTML = currPCB.limit;
                _ReadyTable.rows[i].cells[4].innerHTML = currPCB.PC;

            }

        }


        /*checkExe()
        if CPU is executing light is green
        if CPU is not executing light is red
        usefull for nowing whether cpu is done
        executing or is in an infinite loop
        or is done executing
         */
        public static checkExe():void{
            if(_CPU.isExecuting){
                _Light.style.color="green";


            }else{
                _Light.style.color="red";
            }
        }

        }
    }

