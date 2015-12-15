///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(quantum, counter, algorithm) {
            if (quantum === void 0) { quantum = 6; }
            if (counter === void 0) { counter = 0; }
            if (algorithm === void 0) { algorithm = "rr"; }
            this.quantum = quantum;
            this.counter = counter;
            this.algorithm = algorithm;
        }
        /*init()
        inits round robin scheduler
        by throwing first item in ReadyQ
        into the CPU
         */
        cpuScheduler.prototype.init = function () {
            var oldprogram;
            var found = false;
            var i = 0;
            var temp;
            var replace;
            var first = _ReadyQ.dequeue();
            if (first.location == 1) {
                var program = _krnFSDD.readFile(first.pid);
                _krnFSDD.delete(first.pid);
                while (i < _ReadyQ.getSize() && !found) {
                    temp = _ReadyQ.getObj(i);
                    _Kernel.krnTrace("SCHED>INIT temp " + temp.pid + " location " + temp.location);
                    if (temp.location == 0) {
                        found = true;
                    }
                }
                replace = _ReadyQ.remove(temp.pid);
                _MemMan.swapProgram(replace, program);
                first.base = replace.base;
                first.limit = replace.limit;
                first.location = 0;
                first.PC = first.base;
                replace.base = 0;
                replace.limit = 0;
                replace.PC = 0;
                replace.location = 1;
                _ReadyQ.enqueue(replace);
                if (this.algorithm == "priority") {
                    _ReadyQ.quicksort(0, _ReadyQ.getSize() - 1);
                }
            }
            first.state = "running";
            _CPU.currPCB = first;
            _CPU.PC = first.base;
            _Kernel.krnTrace("SCHED>iNIT pcb " + first.pid + " b, l, pc " + first.base + " " + first.limit + " " + first.PC);
        };
        /*change()
        takes running process off of cpu
        enqueues it to ready q
        dequeues of of ready q
        places dequeued pcb onto
        cpu

         */
        cpuScheduler.prototype.change = function () {
            if (_ReadyQ.getSize() > 0) {
                if (_ReadyQ.getObj(0).location == 1) {
                    _Kernel.krnTrace("Swap from memory");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SWAP_IRQ, 0));
                }
                else {
                    var on = _CPU.currPCB;
                    on.state = "waiting";
                    var off = _ReadyQ.dequeue();
                    off.state = "running";
                    //if(off.location==1){
                    /*
                     off.location=0;
                     off.base=on.base;
                     off.limit=on.limit;
                     off.PC=off.base+off.PC;
                     on.PC=on.PC-on.base;
                     on.base=0;
                     on.limit=0;



                     on.location=1;
                     _MemMan.exchange(off,on);
                     */
                    // }
                    _ReadyQ.enqueue(on);
                    //_StdOut.advanceLine();
                    _Kernel.krnTrace("cpuched ENQUEUE PID= " + on.pid + " PC= " + on.PC);
                    //_StdOut.advanceLine();
                    _Kernel.krnTrace("cpusched DEQUEUE PID= " + off.pid + " PC= " + off.PC);
                    _CPU.PC = off.PC;
                    _CPU.Acc = off.Acc;
                    _CPU.Xreg = off.Xreg;
                    _CPU.Yreg = off.Yreg;
                    _CPU.Zflag = off.Zflag;
                    _CPU.currPCB = off;
                    TSOS.Control.updatePCBTable();
                    TSOS.Control.updateDiskTable();
                    _CPU.isExecuting = true;
                }
            }
            this.counter = 0;
        };
        /*replace()
        used when executing process finishes
        simply dequeues off of
        ready q and places
        pcb on CPU
         */
        cpuScheduler.prototype.replace = function () {
            _krnFSDD.delete(_CPU.currPCB.pid);
            var off = _ReadyQ.dequeue();
            if (off.location == 1) {
                off.base = 0;
                off.limit = 255;
                var program = _krnFSDD.readFile(off.pid).substr(0, 509);
                var index = off.base;
                var toMemory;
                _krnFSDD.delete(off.pid);
                for (var i = 0; i < program.length; i++) {
                    //pull bytes out of string two char at a time
                    toMemory = program.slice(i, i + 2);
                    //throw byte into memory
                    _Mem.coreM[index] = toMemory;
                    // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                    i++;
                    index++;
                }
            }
            //_Kernel.krnTrace("DEQUEUE PID= " + off.pid);
            //_StdOut.advanceLine();
            off.state = "running";
            _CPU.PC = off.PC;
            _CPU.Acc = off.Acc;
            _CPU.Xreg = off.Xreg;
            _CPU.Yreg = off.Yreg;
            _CPU.Zflag = off.Zflag;
            _CPU.isExecuting = true;
            _CPU.currPCB = off;
            this.counter = 0;
            TSOS.Control.updatePCBTable();
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
