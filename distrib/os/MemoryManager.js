///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(block, bases, limits) {
            if (block === void 0) { block = 0; }
            if (bases === void 0) { bases = [0, 256, 512]; }
            if (limits === void 0) { limits = [256, 512, 768]; }
            this.block = block;
            this.bases = bases;
            this.limits = limits;
        }
        MemoryManager.prototype.clearMem = function () {
            for (var i = 0; i < MAX_MEM; i++) {
                _Mem.coreM[i] = "00";
            }
            TSOS.Control.updateMemoryTable();
        };
        /*loadProgram(program)
          loads a program into memory and  creates a PCB
          and assigns it a PID
         */
        MemoryManager.prototype.loadProgram = function (program) {
            var toMemory;
            var index = this.bases[this.block];
            if (this.block < 3 && program.length < 256) {
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
                _PCB.init(newBase, newLimit);
                _StdOut.putText("pid= " + _PCB.pid + " base=" + _PCB.base + " Limit=" + _PCB.limit);
                _OsShell.pid++;
                //update memory Table
                TSOS.Control.updateMemoryTable();
                this.block++;
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
            index = parseInt(address, 16);
            return index;
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
