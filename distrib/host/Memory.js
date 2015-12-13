///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(coreM, coreBase, coreLimit) {
            if (coreM === void 0) { coreM = [MAX_MEM]; }
            if (coreBase === void 0) { coreBase = 0; }
            if (coreLimit === void 0) { coreLimit = 768; }
            this.coreM = coreM;
            this.coreBase = coreBase;
            this.coreLimit = coreLimit;
        }
        Memory.prototype.init = function () {
            this.coreM = [MAX_MEM];
            this.coreBase = 0;
            this.coreLimit = 768;
            for (var i = 0; i < 768; i++) {
                this.coreM[i] = "00";
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
