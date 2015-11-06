///<reference path="../globals.ts" />
/* ------------
 PCB.ts
 ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(pid, state, PC, Acc, Xreg, Yreg, Zflag, base, limit) {
            if (pid === void 0) { pid = 0; }
            if (state === void 0) { state = ""; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            this.pid = pid;
            this.state = state;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.base = base;
            this.limit = limit;
        }
        PCB.prototype.init = function (newBase, newLimit) {
            this.pid = _OsShell.pid;
            this.state = "new";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.base = newBase;
            this.limit = newLimit;
            this.PC = this.base;
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
