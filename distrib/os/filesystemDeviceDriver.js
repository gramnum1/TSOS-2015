var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var FSDD = (function (_super) {
        __extends(FSDD, _super);
        function FSDD() {
            // Override the base method pointers.
            _super.call(this, this.krnfsDriverEntry);
            this.tracks = 4;
            this.sections = 8;
            this.blocks = 8;
            this.blockLength = 64;
            this.Meta = "";
            this.emptyData = "";
        }
        FSDD.prototype.krnfsDriverEntry = function () {
            this.status = "loaded";
            this.init();
        };
        FSDD.prototype.init = function () {
            for (var i = 0; i < 60; i++) {
                this.emptyData += "~~";
            }
            this.Meta = "0000";
            for (var t = 0; t < this.tracks; t++) {
                for (var s = 0; s < this.sections; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        var blank = this.Meta.concat(this.emptyData);
                        sessionStorage.setItem(t.toString() + s.toString() + b.toString(), blank);
                    }
                }
            }
        };
        FSDD.prototype.createFile = function (filename) {
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    var meta = this.getMeta(0, s, b);
                    if (meta.charAt(0) == "0") {
                        var dirLink = this.getFreeSpace();
                        if (dirLink != "na") {
                            sessionStorage.setItem("0" + s + "" + b, dirLink.concat(filename));
                        }
                        TSOS.Control.updateDiskTable();
                        return true;
                    }
                }
            }
            return false;
        };
        FSDD.prototype.readFile = function (filename) {
            var temp;
            var MBR;
            var read;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);
                        _Kernel.krnTrace("MBR: " + MBR);
                        read = sessionStorage.getItem(MBR).substr(4);
                        _StdOut.putText("File: " + filename);
                        _StdOut.advanceLine();
                        _StdOut.putText(read);
                        return;
                    }
                }
            }
            _StdOut.putText("File " + filename + " not found");
        };
        FSDD.prototype.write = function (filename, data) {
            var numBlocks = 1;
            if (data.length > 60) {
                numBlocks = data.length / 60;
                _Kernel.krnTrace("Num Blocks: " + numBlocks);
            }
            var temp;
            var MBR;
            var read;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        if (numBlocks == 1) {
                            MBR = this.getMBR(0, s, b);
                            _Kernel.krnTrace("MBR: " + MBR);
                            var meta = this.getMeta(parseInt(MBR.charAt(0)), parseInt(MBR.charAt(1)), parseInt(MBR.charAt(2)));
                            sessionStorage.setItem(MBR, meta.concat(data));
                            TSOS.Control.updateDiskTable();
                            return true;
                        }
                        else {
                            MBR = this.getMBR(0, s, b);
                            var dirLink = this.getFreeSpace();
                            sessionStorage.setItem(MBR, meta.concat(dirLink.concat(data.substr(0, 60))));
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        FSDD.prototype.getMBR = function (t, s, b) {
            var mbr = sessionStorage.getItem(t + "" + s + "" + b).substr(1, 3);
            return mbr;
        };
        FSDD.prototype.getData = function (t, s, b) {
            var data = sessionStorage.getItem(t + "" + s + "" + b).substr(4);
            return data;
        };
        FSDD.prototype.getMeta = function (t, s, b) {
            var meta = sessionStorage.getItem(t + "" + s + "" + b).substr(0, 4);
            return meta;
        };
        FSDD.prototype.getFreeSpace = function () {
            var MBR = "000";
            for (var t = 1; t < this.tracks; t++) {
                for (var s = 0; s < this.sections; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        var meta = this.getMeta(t, s, b);
                        if (meta.charAt(0) == "0") {
                            sessionStorage.setItem(t + "" + s + "" + b, "1" + MBR.concat(this.emptyData));
                            return "1" + t + "" + s + "" + b;
                        }
                    }
                }
            }
            return "na";
        };
        return FSDD;
    })(TSOS.DeviceDriver);
    TSOS.FSDD = FSDD;
})(TSOS || (TSOS = {}));
