///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(coreM) {
            if (coreM === void 0) { coreM = [256]; }
            this.coreM = coreM;
        }
        Memory.prototype.init = function () {
            this.coreM = [256];
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
