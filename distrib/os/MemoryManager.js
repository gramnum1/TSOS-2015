///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
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
            var index = 0;
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
            _PCB = new TSOS.PCB();
            _PCB.init();
            _StdOut.putText("new process, pid= " + _PCB.pid);
            _OsShell.pid++;
            //update memory Table
            TSOS.Control.updateMemoryTable();
            /*

             toMemory=program.charAt(i)+program.charAt(i+1);
             _CPU.memory[_CPU.memory.length]=toMemory;
             _Kernel.krnTrace(toMemory);
             }
             */
        };
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
