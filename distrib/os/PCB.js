///<reference path="../globals.ts" />
/* ------------
 PCB.ts
 ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(pid, PC, Acc, Xreg, Yreg, Zflag) {
            if (pid === void 0) { pid = 0; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            this.pid = pid;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
        PCB.prototype.init = function () {
            this.pid = _OsShell.pid;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
