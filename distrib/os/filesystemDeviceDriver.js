var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="../utils.ts" />
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var FSDD = (function (_super) {
        __extends(FSDD, _super);
        function FSDD() {
            // Override the base method pointers.
            _super.call(this, this.krnfsDriverEntry, this.diskUse);
            this.tracks = 4;
            this.sections = 8;
            this.blocks = 8;
            this.Meta = "";
            this.emptyData = "";
        }
        FSDD.prototype.krnfsDriverEntry = function () {
            this.status = "loaded";
            this.init();
        };
        FSDD.prototype.init = function () {
            for (var i = 0; i < 60; i++) {
                this.emptyData += "00";
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
            if (this.fileExists(filename)) {
                return false;
            }
            filename = TSOS.Utils.stringToHex(filename);
            var params = new Array(4);
            _Kernel.krnTrace("File name: " + filename);
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    var meta = this.getMeta(0, s, b);
                    if (meta.charAt(0) == "0") {
                        var dirLink = this.getFreeSpace();
                        if (dirLink != "na") {
                            var data = "1" + dirLink.concat(filename);
                            data = this.fillerBlock(data);
                            sessionStorage.setItem("0" + s + "" + b, data);
                        }
                        params[0] = 0;
                        params[1] = s;
                        params[2] = b;
                        params[3] = "blue";
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DVU_IRQ, params));
                        TSOS.Control.updateDiskTable();
                        return true;
                    }
                }
            }
            return false;
        };
        FSDD.prototype.fillerBlock = function (data) {
            //_Kernel.krnTrace("data length: "+data.length);
            var fill = "";
            for (var i = 0; i < (124 - data.length); i++) {
                fill += "0";
            }
            return data.concat(fill);
        };
        FSDD.prototype.fillerData = function (data) {
            //_Kernel.krnTrace("data length: "+data.length);
            var fill = "";
            for (var i = 0; i < (120 - data.length); i++) {
                fill += "0";
            }
            return data.concat(fill);
        };
        /*fileExists
        checks to see if a file exists returns
        true or false
         */
        FSDD.prototype.fileExists = function (filename) {
            filename = this.fillerData(TSOS.Utils.stringToHex(filename));
            var temp;
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        return true;
                    }
                }
            }
            return false;
        };
        FSDD.prototype.readFile = function (filename) {
            filename = this.fillerData(TSOS.Utils.stringToHex(filename));
            var temp;
            var MBR;
            var read = "";
            var pointer = 0;
            var limit = 0;
            var nextRead;
            var lastRead;
            var params = new Array(4);
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        // Control.updateDiskView(0,s);
                        MBR = this.getMBR(0, s, b);
                        //_Kernel.krnTrace("MBR: "+MBR);
                        do {
                            lastRead = MBR;
                            read += sessionStorage.getItem(MBR).substr(4);
                            nextRead = sessionStorage.getItem(MBR).substr(1, 3);
                            MBR = nextRead;
                        } while (MBR != "000");
                        params[0] = parseInt(lastRead.charAt(0));
                        params[1] = parseInt(lastRead.charAt(1));
                        params[2] = parseInt(lastRead.charAt(2));
                        params[3] = "green";
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DVU_IRQ, params));
                        _Kernel.krnTrace("FSDD>RF READ: " + read);
                        return read;
                    }
                }
            }
            _StdOut.putText("File " + TSOS.Utils.hexToString(filename) + " not found");
        };
        FSDD.prototype.writeSwap = function (oldfilename, data, filename) {
            _Kernel.krnTrace("FSDD>WS DELETING " + oldfilename);
            this.delete(oldfilename);
            this.createFile(filename);
            this.write(filename, data);
            TSOS.Control.updateDiskTable();
            return;
        };
        FSDD.prototype.write = function (filename, data) {
            if (!this.fileExists(filename) || data == "") {
                return false;
            }
            //data=Utils.stringToHex(data);
            filename = this.fillerData(TSOS.Utils.stringToHex(filename));
            var numBlocks = Math.ceil(data.length / 120);
            _Kernel.krnTrace("Num Blocks: " + numBlocks);
            var temp;
            var MBR;
            var pointer = 0;
            var write = "";
            var nextBlock;
            var limit = 0;
            var lastBlock;
            var params = new Array(4);
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);
                        for (var i = 0; i < numBlocks; i++) {
                            lastBlock = MBR;
                            nextBlock = "000";
                            if (i != numBlocks - 1) {
                                nextBlock = this.getFreeSpace();
                            }
                            while (pointer < data.length && limit < 120) {
                                write += data.charAt(pointer);
                                pointer++;
                                limit++;
                            }
                            if (write.length < 120 - 1) {
                                write = this.fillerData(write);
                            }
                            var DATA = "1" + nextBlock.concat(write);
                            sessionStorage.setItem(MBR, DATA);
                            write = "";
                            limit = 0;
                            MBR = nextBlock;
                        }
                        params[0] = parseInt(lastBlock.charAt(0));
                        params[1] = parseInt(lastBlock.charAt(1));
                        params[2] = parseInt(lastBlock.charAt(2));
                        params[3] = "yellow";
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DVU_IRQ, params));
                        TSOS.Control.updateDiskTable();
                        return true;
                    }
                }
            }
            _Kernel.krnTrace("FSDD>W File " + TSOS.Utils.hexToString(filename) + " not found");
            return false;
        };
        FSDD.prototype.delete = function (filename) {
            if (!this.fileExists(filename)) {
                return false;
            }
            filename = this.fillerData(TSOS.Utils.stringToHex(filename));
            var temp;
            var MBR;
            var nextBlock;
            var lastBlock;
            var params = new Array(4);
            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);
                        sessionStorage.setItem("0" + s + "" + b, "0000" + this.emptyData);
                        do {
                            lastBlock = MBR;
                            nextBlock = sessionStorage.getItem(MBR).substr(1, 3);
                            _Kernel.krnTrace("nextblock: " + nextBlock);
                            sessionStorage.setItem(MBR, "0000" + this.emptyData);
                            MBR = nextBlock;
                        } while (MBR != "000");
                        params[0] = parseInt(lastBlock.charAt(0));
                        params[1] = parseInt(lastBlock.charAt(1));
                        params[2] = parseInt(lastBlock.charAt(2));
                        params[3] = "red";
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DVU_IRQ, params));
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
                        filename = TSOS.Utils.hexToString(filename);
                        _Kernel.krnTrace("file name: " + filename);
                        _StdOut.putText(" " + filename);
                        _StdOut.advanceLine();
                    }
                }
            }
            _StdOut.advanceLine();
        };
        FSDD.prototype.runOne = function (filePCB) {
            _Kernel.krnTrace("FSDD>RUNONE IN RUNONE!!!!!");
            if (Resident_List.getSize() > 0) {
                var replacePCB = Resident_List.getObj(0);
                _Kernel.krnTrace("FSDD>RUNONE Replace pid= " + replacePCB.pid);
                this.exchange(filePCB, replacePCB);
                filePCB.base = replacePCB.base;
                filePCB.limit = replacePCB.limit;
                filePCB.location = 0;
                replacePCB.location = 1;
                _Kernel.krnTrace("FSDD>RUNONE replacedpcb location: " + replacePCB.location);
            }
            else {
                filePCB.base = 0;
                filePCB.limit = 255;
                filePCB.location = 0;
                this.retrieve(filePCB);
            }
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
        /*exchange for runone

         */
        FSDD.prototype.exchange = function (fspcb, mempcb) {
            _Kernel.krnTrace("MEMMAN>EX IN EXCH pid in= " + fspcb.pid + " pid out= " + mempcb.pid);
            _Kernel.krnTrace("MEMMAN>EX mempcb [base,limit] [" + mempcb.base + "," + mempcb.limit + "]");
            var start = mempcb.base;
            var end = mempcb.limit;
            var out = "";
            var into = _krnFSDD.readFile(fspcb.pid);
            var toMemory;
            var index = mempcb.base;
            for (i = start; i < end; i++) {
                out += _Mem.coreM[i];
            }
            _Kernel.krnTrace("MEMMAN>EX INTO: " + into);
            _Kernel.krnTrace("MEMMAN>EX OUT: " + out);
            _krnFSDD.writeReplace(fspcb.pid, out, mempcb);
            for (var i = 0; i < into.length; i++) {
                //pull bytes out of string two char at a time
                toMemory = into.slice(i, i + 2);
                //throw byte into memory
                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;
            }
        };
        /*
        retrieve for runone
         */
        FSDD.prototype.retrieve = function (pcb) {
            var program = _krnFSDD.readFile(pcb.pid);
            var index = pcb.base;
            var toMemory;
            _krnFSDD.delete(pcb.pid);
            for (var i = 0; i < program.length; i++) {
                //pull bytes out of string two char at a time
                toMemory = program.slice(i, i + 2);
                //throw byte into memory
                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;
            }
        };
        FSDD.prototype.diskUse = function (params) {
            var action = params[0];
            var filename = params[1];
            var data = params[2];
            switch (action) {
                case 0 /*create*/:
                    _Kernel.krnTrace("FSDD>DU>CREATE filename: " + filename);
                    if (_krnFSDD.createFile(filename)) {
                        _StdOut.putText("File " + filename + " Created Succesfully");
                        _StdOut.advanceLine();
                        _StdOut.putText(">");
                    }
                    else {
                        _StdOut.putText("File " + filename + " Not Created");
                        _StdOut.advanceLine();
                        _StdOut.putText(">");
                    }
                    break;
                case 1:
                    _Kernel.krnTrace("FSDD>DU>READ filename: " + filename);
                    var read = _krnFSDD.readFile(filename);
                    read = TSOS.Utils.hexToString(read);
                    _StdOut.putText("File: " + filename);
                    _StdOut.advanceLine();
                    _StdOut.putText(read);
                    _StdOut.advanceLine();
                    _StdOut.putText(">");
                    break;
            }
        };
        return FSDD;
    })(TSOS.DeviceDriver);
    TSOS.FSDD = FSDD;
})(TSOS || (TSOS = {}));
