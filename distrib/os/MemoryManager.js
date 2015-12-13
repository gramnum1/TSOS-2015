///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(block, bases, limits) {
            if (block === void 0) { block = 0; }
            if (bases === void 0) { bases = [0, 256, 512]; }
            if (limits === void 0) { limits = [255, 511, 767]; }
            this.block = block;
            this.bases = bases;
            this.limits = limits;
        }
        MemoryManager.prototype.clearMem = function () {
            for (var i = 0; i < MAX_MEM; i++) {
                _Mem.coreM[i] = "00";
            }
            TSOS.Control.updateMemoryTable();
            this.block = 0;
            _StdOut.putText("Resident List size= " + Resident_List.getSize());
            _OsShell.pid = 0;
            _PCB = null;
        };
        /*loadProgram(program)
          loads a program into memory and  creates a PCB
          and assigns it a PID
         */
        MemoryManager.prototype.loadProgram = function (program) {
            var toMemory;
            var index = this.bases[this.block];
            if (this.block < 3 && program.length / 2 <= 256) {
                for (var i = 0; i < program.length; i++) {
                    //pull bytes out of string two char at a time
                    toMemory = program.slice(i, i + 2);
                    //throw byte into memory
                    _Mem.coreM[index] = toMemory;
                    _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                    i++;
                    index++;
                }
                //create new PCB
                var newBase = this.bases[this.block];
                var newLimit = this.limits[this.block];
                _PCB = new TSOS.PCB();
                _PCB.init(newBase, newLimit, 0);
                Resident_List.enqueue(_PCB);
                _StdOut.putText("pid= " + _PCB.pid + " base=" + _PCB.base + " Limit=" + _PCB.limit);
                _OsShell.pid++;
                _PCB = null;
                // _ReadyQ.enqueue(Resident_List[this.block]);
                //update memory Table
                TSOS.Control.updateMemoryTable();
                this.block++;
                for (var i = 0; i < Resident_List.getSize(); i++) {
                    _Kernel.krnTrace("RL " + Resident_List.getObj(i).pid);
                }
            }
            else if (program.length / 2 <= 256) {
                newBase = 0;
                newLimit = 0;
                _PCB = new TSOS.PCB();
                _PCB.init(newBase, newLimit, 1);
                Resident_List.enqueue(_PCB);
                var filename = _PCB.pid;
                _krnFSDD.createFile(filename);
                _krnFSDD.write(filename, program);
                _StdOut.putText("PCB LOCATION: " + _PCB.location);
                _StdOut.advanceLine();
                _StdOut.putText("pid= " + _PCB.pid + " base=" + _PCB.base + " Limit=" + _PCB.limit);
                _OsShell.pid++;
                _PCB = null;
            }
            else {
                _StdOut.putText("error loading into memory");
            }
        };
        /*

         toMemory=program.charAt(i)+program.charAt(i+1);
         _CPU.memory[_CPU.memory.length]=toMemory;
         _Kernel.krnTrace(toMemory);
         }
         */
        /*toAddress()
         takes next two bytes
         after an opode, turns them into a
         decimal address for the memory array
         and returns it
         */
        MemoryManager.prototype.toAddress = function () {
            var index;
            _CPU.PC++;
            var b = _Mem.coreM[_CPU.PC];
            _CPU.PC++;
            var a = _Mem.coreM[_CPU.PC];
            var address = a.concat(b);
            index = _CPU.currPCB.base + parseInt(address, 16);
            if (index >= _CPU.currPCB.base && index <= _CPU.currPCB.limit) {
                return index;
            }
            else {
                _StdOut.putText("Memory allocation " + index + " out of bounds. Base= " + _CPU.currPCB.base + " Limit= " + _CPU.currPCB.limit);
                _StdOut.advanceLine();
                _OsShell.shellKill(_CPU.currPCB.pid);
            }
        };
        MemoryManager.prototype.exchange = function (fspcb, mempcb) {
            _Kernel.krnTrace("MEMMAN>EX IN EXCH pid in= " + fspcb.pid + " pid out= " + mempcb.pid);
            _Kernel.krnTrace("MEMMAN>EX mempcb [base,limit] [" + mempcb.base + "," + mempcb.limit + "]");
            var start = mempcb.base;
            var end = mempcb.limit;
            var out = "";
            var into = _krnFSDD.readFile(fspcb.pid);
            var toMemory;
            var index = mempcb.base;
            for (i = start; i < end; i++) {
                out += _Mem.coreM[i];
            }
            _Kernel.krnTrace("MEMMAN>EX INTO: " + into);
            _Kernel.krnTrace("MEMMAN>EX OUT: " + out);
            _krnFSDD.writeReplace(fspcb.pid, out, mempcb);
            for (var i = 0; i < into.length; i++) {
                //pull bytes out of string two char at a time
                toMemory = into.slice(i, i + 2);
                //throw byte into memory
                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;
            }
        };
        MemoryManager.prototype.retrieve = function (pcb) {
            var program = _krnFSDD.readFile(pcb.pid);
            var index = pcb.base;
            var toMemory;
            _krnFSDD.delete(pcb.pid);
            for (var i = 0; i < program.length; i++) {
                //pull bytes out of string two char at a time
                toMemory = program.slice(i, i + 2);
                //throw byte into memory
                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
