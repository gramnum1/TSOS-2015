///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, op, isExecuting, currPCB, run, done) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (op === void 0) { op = ""; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (currPCB === void 0) { currPCB = null; }
            if (run === void 0) { run = new Audio("executing.mp3"); }
            if (done === void 0) { done = new Audio("ding.mp3"); }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.op = op;
            this.isExecuting = isExecuting;
            this.currPCB = currPCB;
            this.run = run;
            this.done = done;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currPCB = null;
            //enables executing sound to loop
            this.run.addEventListener('ended', function () {
                this.currentTime = 0;
                this.play();
            }, false);
        };
        Cpu.prototype.cycle = function () {
            if (this.isExecuting) {
                //check to see if _CPUSCHED needs to init
                if (this.currPCB == null) {
                    this.run.play();
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPUSCHED_INIT_IRQ, 0));
                    if (this.currPCB != null) {
                        this.PC = this.currPCB.base;
                        this.Acc = 0;
                        this.Xreg = 0;
                        this.Yreg = 0;
                        this.Zflag = 0;
                        TSOS.Control.updatePCBTable();
                    }
                }
                //check if single step mode is on
                if (_StepMode == false) {
                    _Kernel.krnTrace('CPU cycle');
                    this.execute();
                }
                /*If step mode is on and
                 *Step button has been pressed
                 */
                if (_StepMode == true && _Step == true) {
                    _Kernel.krnTrace('CPU cycle');
                    this.execute();
                    //_Kernel.krnTrace("PCB "+this.currPCB.pid+" b,l,pc "+this.currPCB.base+", "+this.currPCB.limit+", "+this.currPCB.PC);
                    _Step = false;
                }
                TSOS.Control.initCPUTable(); //update CPUTable
                TSOS.Control.updateMemoryTable(); //Update memory Table
                TSOS.Control.checkExe(); //manage CPU dashboard light
            }
        };
        Cpu.prototype.execute = function () {
            //Control.memoryPlace();
            var instruction;
            var i;
            var a;
            var b;
            var c;
            var char;
            var store;
            instruction = _Mem.coreM[this.PC];
            if (_CPUSCHED.counter < _CPUSCHED.quantum) {
                switch (instruction) {
                    //End
                    case "00":
                    case "0":
                        this.op = "00";
                        if (_ReadyQ.isEmpty() == false) {
                            this.currPCB.state = "Terminated";
                            this.currPCB.PC = this.PC;
                            this.currPCB.Acc = this.Acc;
                            this.currPCB.Xreg = this.Xreg;
                            this.currPCB.Yreg = this.Yreg;
                            this.currPCB.Zflag = this.Zflag;
                            TSOS.Control.updatePCBTable();
                            //interrupt for replacement
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPUSCHED_REPLACE_IRQ, 0));
                            this.done.play();
                        }
                        else {
                            this.terminate();
                            this.done.play();
                        }
                        break;
                    //load acc with const
                    case "A9":
                        this.op = "A9";
                        this.PC++;
                        this.Acc = parseInt(_Mem.coreM[this.PC], 16);
                        this.PC++;
                        break;
                    //Load X constant
                    case "A2":
                        this.op = "A2";
                        this.PC++;
                        this.Xreg = parseInt(_Mem.coreM[this.PC], 16);
                        this.PC++;
                        break;
                    //load Y Constant
                    case "A0":
                        this.op = "A0";
                        this.PC++;
                        this.Yreg = parseInt(_Mem.coreM[this.PC], 16);
                        _Kernel.krnTrace("PROCESSOR>A0 LOADING Y REG WITH " + this.Yreg + " FROM Mem " + this.PC);
                        this.PC++;
                        break;
                    //load Acc from memory
                    case "AD":
                        this.op = "AD";
                        i = _MemMan.toAddress();
                        this.Acc = parseInt(_Mem.coreM[i], 16);
                        this.PC++;
                        break;
                    //store Acc to memory
                    case "8D":
                        this.op = "8d";
                        i = _MemMan.toAddress();
                        store = this.Acc.toString(16);
                        if (store.length < 2) {
                            store = "0" + store;
                        }
                        _Mem.coreM[i] = store;
                        _Kernel.krnTrace("PROCESSOR>8d> storing " + store + "to Mem " + i);
                        this.PC++;
                        break;
                    //Add to Acc from memory with carry
                    case "6D":
                        this.op = "6d";
                        i = _MemMan.toAddress();
                        a = this.getConstantNumber(_Mem.coreM[i]);
                        b = this.Acc;
                        c = a + b;
                        this.Acc = c;
                        this.PC++;
                        break;
                    //load X from memory
                    case "AE":
                        this.op = "AE";
                        i = _MemMan.toAddress();
                        this.Xreg = parseInt(_Mem.coreM[i], 16);
                        this.PC++;
                        break;
                    //load Y from memory
                    case "AC":
                        this.op = "AC";
                        i = _MemMan.toAddress();
                        this.Yreg = parseInt(_Mem.coreM[i], 16);
                        _Kernel.krnTrace("PROCESSOR>AC LOADING Y REG WITH " + this.Yreg + " FROM _MEM " + i);
                        this.PC++;
                        break;
                    //increment byte
                    case "EE":
                        this.op = "EE";
                        i = _MemMan.toAddress();
                        a = parseInt(_Mem.coreM[i], 16);
                        a = a + 1;
                        store = a.toString(16);
                        if (store.length < 2) {
                            store = "0" + store;
                        }
                        _Mem.coreM[i] = store; //16
                        this.PC++;
                        break;
                    //No op
                    case "EA":
                        this.op = "EA";
                        this.PC++;
                        break;
                    /*if mem addr=xreg, zflag=1
                     if mem addr!=xreg, zflag=0
                     */
                    case "EC":
                        this.op = "EC";
                        i = _MemMan.toAddress();
                        a = this.getConstantNumber(_Mem.coreM[i]);
                        b = this.Xreg;
                        if (a == b) {
                            this.Zflag = 1;
                        }
                        else {
                            this.Zflag = 0;
                        }
                        this.PC++;
                        break;
                    //BNE
                    case "D0":
                        this.op = "D0";
                        ++this.PC;
                        //jump amount=where yuou are + number after D0
                        var branch = this.PC + this.getConstantNumber(_Mem.coreM[this.PC]);
                        if (this.Zflag == 0) {
                            this.PC = branch + 1;
                            //if branch is too large deal with it.
                            if (this.PC > 255 + this.currPCB.base) {
                                this.PC -= 256;
                            }
                        }
                        else {
                            this.PC++;
                        }
                        break;
                    //syscall
                    case "FF":
                        this.op = "FF";
                        //print int
                        if (this.Xreg == 1) {
                            _StdOut.putText(this.Yreg.toString());
                            _Kernel.krnTrace("PROCESSOR>FF " + this.currPCB.pid + " print " + this.Yreg.toString());
                            this.PC++;
                        }
                        else if (this.Xreg == 2) {
                            i = this.Yreg + this.currPCB.base;
                            while (_Mem.coreM[i] != "00") {
                                char = String.fromCharCode(parseInt(_Mem.coreM[i], 16));
                                _StdOut.putText(char);
                                i++;
                            }
                            this.PC++;
                        }
                        else {
                            _StdOut.putText("Value in Xreg must be 1 or 0");
                            this.isExecuting = false;
                        }
                        break;
                    default:
                        this.isExecuting = false;
                        _StdOut.putText("Error no match found: " + _Mem.coreM[this.PC]);
                }
                if (_CPUSCHED.algorithm == "rr") {
                    _CPUSCHED.counter++;
                }
            }
            else {
                this.loadOffPCB();
            }
        };
        /*getConstantNumber(num)
        probably didn't have to be its own method
        but oh well.
        takes a hex string and turns it into a decimal number
         */
        Cpu.prototype.getConstantNumber = function (num) {
            var v = parseInt(num, 16);
            return v;
        };
        /*loadOffPCB()
        at the end of process execution
        load off all cpu info onto
        the PCB and update the
        PCBTable
         */
        Cpu.prototype.loadOffPCB = function () {
            this.currPCB.state = "waiting";
            this.currPCB.PC = this.PC;
            this.currPCB.Acc = this.Acc;
            this.currPCB.Xreg = this.Xreg;
            this.currPCB.Yreg = this.Yreg;
            this.currPCB.Zflag = this.Zflag;
            //interrupt for change
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPUSCHED_CHANGE_IRQ, 0));
        };
        Cpu.prototype.terminate = function () {
            this.isExecuting = false;
            //this.PC=0;
            //this.loadOffPCB();
            if (_StepMode) {
                _Step = false;
            }
            this.currPCB.state = "Terminated";
            this.currPCB.PC = this.PC;
            this.currPCB.Acc = this.Acc;
            this.currPCB.Xreg = this.Xreg;
            this.currPCB.Yreg = this.Yreg;
            this.currPCB.Zflag = this.Zflag;
            TSOS.Control.checkExe();
            TSOS.Control.updatePCBTable();
            //stop executing noise
            this.run.repeat = false;
            this.run.pause();
            //reset cpu
            this.init();
            _Kernel.krnTrace("CPU>Terminate RESIDENT LiST");
            for (var i = 0; i < Resident_List.getSize(); i++) {
                _Kernel.krnTrace("pid:" + Resident_List.getObj(i).pid + " location: " + Resident_List.getObj(i).location);
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
