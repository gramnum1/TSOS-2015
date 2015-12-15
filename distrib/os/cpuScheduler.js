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
            var first = _ReadyQ.dequeue();
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
            var off = _ReadyQ.dequeue();
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
