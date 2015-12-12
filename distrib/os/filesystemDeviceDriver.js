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
                            sessionStorage.setItem("0" + s + "" + b, "1" + dirLink.concat(filename));
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
            var read = "";
            var pointer = 0;
            var limit = 0;
            var nextRead;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);
                        _Kernel.krnTrace("MBR: " + MBR);
                        do {
                            _Kernel.krnTrace("in do");
                            read += sessionStorage.getItem(MBR).substr(4);
                            _Kernel.krnTrace("Read: " + read);
                            nextRead = sessionStorage.getItem(MBR).substr(1, 3);
                            _Kernel.krnTrace("nextRead: " + nextRead);
                            MBR = nextRead;
                        } while (MBR != "000");
                        _Kernel.krnTrace("after do");
                        return read;
                    }
                }
            }
            _StdOut.putText("File " + filename + " not found");
        };
        FSDD.prototype.write = function (filename, data) {
            var numBlocks = Math.ceil(data.length / 60);
            _Kernel.krnTrace("Num Blocks: " + numBlocks);
            var temp;
            var MBR;
            var pointer = 0;
            var write = "";
            var nextBlock;
            var limit = 0;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);
                        for (var i = 0; i < numBlocks; i++) {
                            nextBlock = "000";
                            if (i != numBlocks - 1) {
                                nextBlock = this.getFreeSpace();
                            }
                            while (pointer < data.length && limit < 60) {
                                write += data.charAt(pointer);
                                pointer++;
                                limit++;
                            }
                            _Kernel.krnTrace(write);
                            _Kernel.krnTrace(pointer.toString());
                            sessionStorage.setItem(MBR, "1" + nextBlock.concat(write));
                            write = "";
                            limit = 0;
                            MBR = nextBlock;
                        }
                        TSOS.Control.updateDiskTable();
                        return true;
                    }
                }
            }
            return false;
        };
        FSDD.prototype.delete = function (filename) {
            var temp;
            var MBR;
            var nextBlock;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);
                        sessionStorage.setItem("0" + s + "" + b, "0000" + this.emptyData);
                        do {
                            nextBlock = sessionStorage.getItem(MBR).substr(1, 3);
                            _Kernel.krnTrace("nextblock: " + nextBlock);
                            sessionStorage.setItem(MBR, "0000" + this.emptyData);
                            MBR = nextBlock;
                        } while (MBR != "000");
                        TSOS.Control.updateDiskTable();
                        return true;
                    }
                }
            }
            return false;
        };
        FSDD.prototype.list = function () {
            var filename;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    filename = this.getData(0, s, b);
                    if (filename != this.emptyData) {
                        _StdOut.putText(" " + filename);
                        _StdOut.advanceLine();
                    }
                }
            }
            _StdOut.advanceLine();
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
                            return t + "" + s + "" + b;
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
