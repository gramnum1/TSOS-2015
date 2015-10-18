///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.loadProgram = function (program) {
            var toMemory;
            var index = 0;
            for (var i = 0; i < program.length; i++) {
                toMemory = program.slice(i, i + 2);
                _Mem.coreM[index] = toMemory;
                _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;
            }
            _PCB = new TSOS.PCB();
            _PCB.init();
            _StdOut.putText("new process, pid= " + _PCB.pid);
            _OsShell.pid++;
            TSOS.Control.updateMemoryTable();
            /*

             toMemory=program.charAt(i)+program.charAt(i+1);
             _CPU.memory[_CPU.memory.length]=toMemory;
             _Kernel.krnTrace(toMemory);
             }
             */
        };
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
