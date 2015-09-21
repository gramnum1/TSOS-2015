///<reference path="../globals.ts" />
/* ------------
 Status.ts

 Requires globals.ts


 Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
 ------------ */
var TSOS;
(function (TSOS) {
    var Status = (function () {
        function Status(currentFont, currentFontSize, currentXPosition, currentYPosition) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
        }
        Status.prototype.init = function () {
        };
        Status.statusLog = function () {
            var theDate = new Date();
            var month = theDate.getUTCMonth();
            var date = month + "/" + theDate.getUTCDate() + "/" + theDate.getUTCFullYear() + " " + theDate.getHours() + ":" + theDate.getMinutes() + ":" + theDate.getSeconds();
            _Bar.value = date + "This is a status";
        };
        return Status;
    })();
    TSOS.Status = Status;
})(TSOS || (TSOS = {}));
1;
