///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(quantum, counter) {
            if (quantum === void 0) { quantum = 6; }
            if (counter === void 0) { counter = 0; }
            this.quantum = quantum;
            this.counter = counter;
        }
        cpuScheduler.prototype.init = function () {
            _Mode = 0;
            var first = _ReadyQ.dequeue();
            first.state = "running";
            _Kernel.krnTrace("DEQUEUE PID= " + first.pid + " PC= " + first.PC);
            TSOS.Control.updateReadyTable();
            _Mode = 1;
            return first;
        };
        cpuScheduler.prototype.change = function () {
            if (_ReadyQ.getSize() > 0) {
                var on = _CPU.currPCB;
                on.state = "waiting";
                var off = _ReadyQ.dequeue();
                off.state = "running";
                _ReadyQ.enqueue(on);
                //_StdOut.advanceLine();
                _Kernel.krnTrace("ENQUEUE PID= " + on.pid + " PC= " + on.PC);
                //_StdOut.advanceLine();
                _Kernel.krnTrace("DEQUEUE PID= " + off.pid + " PC= " + off.PC);
                _CPU.PC = off.PC;
                _CPU.Acc = off.Acc;
                _CPU.Xreg = off.Xreg;
                _CPU.Yreg = off.Yreg;
                _CPU.Zflag = off.Zflag;
                _CPU.isExecuting = true;
                _CPU.currPCB = off;
                TSOS.Control.updateReadyTable();
            }
            this.counter = 0;
        };
        cpuScheduler.prototype.replace = function () {
            var off = _ReadyQ.dequeue();
            _Kernel.krnTrace("DEQUEUE PID= " + off.pid);
            //_StdOut.advanceLine();
            _CPU.PC = off.PC;
            _CPU.Acc = off.Acc;
            _CPU.Xreg = off.Xreg;
            _CPU.Yreg = off.Yreg;
            _CPU.Zflag = off.Zflag;
            _CPU.isExecuting = true;
            _CPU.currPCB = off;
            this.counter = 0;
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
