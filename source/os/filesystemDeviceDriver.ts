///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="../utils.ts" />
module TSOS {

    // Extends DeviceDriver
    export class FSDD extends DeviceDriver {
        public tracks=4;
        public sections=8;
        public blocks=8;
        public blockLength=64;

        public Meta="";
        public emptyData="";
        constructor() {
            // Override the base method pointers.
            super(this.krnfsDriverEntry, this.diskUse);
        }
        public krnfsDriverEntry(): void{
            this.status="loaded";
            this.init();


        }

        public init():void{
            for(var i=0; i<60; i++){
                this.emptyData+="~~";

            }
            this.Meta="0000";



            for(var t=0; t<this.tracks; t++){
                for(var s=0; s<this.sections; s++){
                    for(var b=0; b<this.blocks; b++){

                        var blank=this.Meta.concat(this.emptyData);
                        sessionStorage.setItem(t.toString()+s.toString()+b.toString(), blank);







                    }
                }
            }






        }

        public createFile(filename): boolean{
            filename=Utils.stringToHex(filename);
            _Kernel.krnTrace("File name: "+filename);
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    var meta=this.getMeta(0,s,b);
                    if(meta.charAt(0)=="0"){
                        var dirLink=this.getFreeSpace();
                        if(dirLink!="na"){
                            var data="1"+dirLink.concat(filename);
                            data=this.fillerBlock(data);
                            sessionStorage.setItem("0"+s+""+b, data);
                        }
                        Control.updateDiskTable();
                        return true;


                    }

                }
            }
            return false;



        }
        private fillerBlock(data): string{
            _Kernel.krnTrace("data length: "+data.length);
            var fill="";
            for(var i=0; i<(124-data.length); i++){
                fill+="0";
            }
            return data.concat(fill);

        }private fillerData(data): string{
        _Kernel.krnTrace("data length: "+data.length);
        var fill="";
        for(var i=0; i<(120-data.length); i++){
            fill+="0";
        }
        return data.concat(fill);

    }


        public readFile(filename): String{
            filename=this.fillerData(Utils.stringToHex(filename));
            var temp;
            var MBR;
            var read="";
            var pointer=0;
            var limit=0;
            var nextRead;
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    temp=this.getData(0,s,b);
                    if(temp==filename){
                        MBR=this.getMBR(0,s,b);
                        //_Kernel.krnTrace("MBR: "+MBR);
                        do{
                            //_Kernel.krnTrace("in do");
                            read+=sessionStorage.getItem(MBR).substr(4);
                           // _Kernel.krnTrace("Read: "+read);
                            nextRead=sessionStorage.getItem(MBR).substr(1,3);
                            //_Kernel.krnTrace("nextRead: "+nextRead);
                            MBR=nextRead;



                        }while(MBR!="000");
                        read=Utils.hexToString(read);
                        _Kernel.krnTrace("FSDD>RF READ: "+read);





                      return read;


                    }
                }

                }
            _StdOut.putText("File "+filename+" not found");

        }
        public writeReplace(filename, data, pcb): void{
           _Kernel.krnTrace("FSDD>WR data length: "+data.length);
            var numBlocks=Math.ceil(data.length/60);
            _Kernel.krnTrace("FSDD>WR Num Blocks: "+numBlocks);
            var temp;
            var MBR;
            var pointer=0;
            var write="";
            var nextBlock;
            var limit=0;
            var newfilename;


            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    temp = this.getData(0, s, b);
                    if (temp == filename) {

                        MBR = this.getMBR(0, s, b);
                        newfilename="1"+MBR.concat(pcb.pid);
                        _Kernel.krnTrace("FSDD>WR new filename: "+newfilename);
                        sessionStorage.setItem("0"+s+""+b, newfilename );


                        for(var i=0; i<numBlocks; i++){
                            nextBlock="000";
                            if(i!=numBlocks-1){
                                nextBlock=this.getMBR(parseInt(MBR.charAt(0)),parseInt(MBR.charAt(1)),parseInt(MBR.charAt(2)));
                                if(nextBlock=="000"){
                                    nextBlock=this.getFreeSpace();
                                }
                            }
                            while(pointer<data.length && limit<60 ){
                                write+=data.charAt(pointer);
                                pointer++;
                                limit++
                            }
                            //_Kernel.krnTrace(write);
                            //_Kernel.krnTrace(pointer.toString());
                            sessionStorage.setItem(MBR, "1"+nextBlock.concat(write));
                            write="";
                            limit=0;
                            MBR=nextBlock;




                        }
                        _Kernel.krnTrace("FSDD>WR Write: "+write);
                        _Kernel.krnTrace("FSDD>WR updating disk table");

                        Control.updateDiskTable();
                        return;









                    }
                }

            }



        }

        public write(filename, data): boolean {
            data=Utils.stringToHex(data);
            filename=this.fillerData(Utils.stringToHex(filename));



               var numBlocks=Math.ceil(data.length/60);
                _Kernel.krnTrace("Num Blocks: "+numBlocks);

            var temp;
            var MBR;
            var pointer=0;
            var write="";
            var nextBlock;
            var limit=0;

            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {

                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        MBR = this.getMBR(0, s, b);

                        for(var i=0; i<numBlocks; i++){
                            nextBlock="000";
                            if(i!=numBlocks-1){
                                nextBlock=this.getFreeSpace();
                            }
                            while(pointer<data.length && limit<60 ){
                                write+=data.charAt(pointer);
                                pointer++;
                                limit++
                            }
                            //_Kernel.krnTrace(write);
                            //_Kernel.krnTrace(pointer.toString());

                            var DATA=this.fillerBlock("1"+nextBlock.concat(write));
                            sessionStorage.setItem(MBR, DATA);
                            write="";
                            limit=0;
                            MBR=nextBlock;




                            }
                        Control.updateDiskTable();
                        return true;








                        }
                    }

                }

            return false;
        }
        public delete(filename): boolean{
            filename=this.fillerData(Utils.stringToHex(filename));
            var temp;
            var MBR;
            var nextBlock;
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    temp = this.getData(0, s, b);
                    if(temp==filename){
                        MBR = this.getMBR(0, s, b);
                        sessionStorage.setItem("0"+s+""+b, "0000"+this.emptyData);
                        do{
                            nextBlock=sessionStorage.getItem(MBR).substr(1,3);
                            _Kernel.krnTrace("nextblock: "+nextBlock);
                            sessionStorage.setItem(MBR, "0000"+this.emptyData );
                            MBR=nextBlock;
                        }while(MBR!="000");
                        Control.updateDiskTable();
                        return true;


                    }

                }
            }
            return false;

        }
        public list():void{
            var filename;
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    filename=this.getData(0,s,b);

                    if(filename!=this.emptyData){
                        filename=Utils.hexToString(filename);
                        _Kernel.krnTrace("file name: "+filename);
                        _StdOut.putText(" "+filename);
                        _StdOut.advanceLine();
                    }
                }
            }
            _StdOut.advanceLine();
        }

        public runOne(filePCB): void{
            _Kernel.krnTrace("FSDD>RUNONE IN RUNONE!!!!!");

            if(Resident_List.getSize()>0) {
                var replacePCB = Resident_List.getObj(0);
                _Kernel.krnTrace("FSDD>RUNONE Replace pid= " + replacePCB.pid);
                this.exchange(filePCB, replacePCB);
                filePCB.base = replacePCB.base;
                filePCB.limit = replacePCB.limit;
                filePCB.location = 0;
                replacePCB.location = 1;
                _Kernel.krnTrace("FSDD>RUNONE replacedpcb location: " + replacePCB.location)
            }else{
                filePCB.base=0;
                filePCB.limit=255;
                filePCB.location = 0;
                this.retrieve(filePCB);

            }
        }



        public getMBR(t,s,b): String{
            var mbr=sessionStorage.getItem(t+""+s+""+b).substr(1,3);
            return mbr;

        }
        public getData(t,s,b): String{
            var data=sessionStorage.getItem(t + "" + s + "" + b).substr(4);
            return data;
        }
        public getMeta(t,s,b): String{
            var meta=sessionStorage.getItem(t+""+s+""+b).substr(0,4);
            return meta;
        }
        public getFreeSpace(): String{
            var MBR="000";
            for(var t=1; t<this.tracks; t++){
                for(var s=0; s<this.sections; s++){
                    for(var b=0; b<this.blocks; b++){
                        var meta=this.getMeta(t,s,b);
                        if(meta.charAt(0)=="0"){
                            sessionStorage.setItem(t+""+s+""+b,"1"+MBR.concat(this.emptyData));
                            return t+""+s+""+b;
                        }
                    }
                }
            }
            return "na";
        }

        public exchange(fspcb, mempcb): void{
            _Kernel.krnTrace("MEMMAN>EX IN EXCH pid in= "+fspcb.pid+" pid out= "+mempcb.pid);
            _Kernel.krnTrace("MEMMAN>EX mempcb [base,limit] ["+mempcb.base+","+mempcb.limit+"]");

            var start=mempcb.base;
            var end=mempcb.limit;
            var out="";
            var into=_krnFSDD.readFile(fspcb.pid);
            var toMemory;
            var index=mempcb.base;
            for(i=start; i<end; i++){
                out+=_Mem.coreM[i];

            }
            _Kernel.krnTrace("MEMMAN>EX INTO: "+into);
            _Kernel.krnTrace("MEMMAN>EX OUT: "+out);

            _krnFSDD.writeReplace(fspcb.pid, out, mempcb);
            for (var i =0; i < into.length; i++) {

                //pull bytes out of string two char at a time
                toMemory = into.slice(i, i + 2);
                //throw byte into memory
                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;


            }

        }

        public retrieve(pcb): void{
            var program=_krnFSDD.readFile(pcb.pid);
            var index=pcb.base;
            var toMemory;
            _krnFSDD.delete(pcb.pid);
            for (var i =0; i < program.length; i++) {

                //pull bytes out of string two char at a time
                toMemory = program.slice(i, i + 2);
                //throw byte into memory
                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;


            }







        }
        public diskUse(params){
            var action=params[0];
            var param1=params[1];
            var param2;
            switch (action){
                case 0 /*create*/:

                    _Kernel.krnTrace("FSDD>DU>CREATE filename: "+param1);
                    if(_krnFSDD.createFile(param1)){
                        _StdOut.putText("File "+param1+" Created Succesfully");
                        _StdOut.advanceLine();
                    }else{
                        _StdOut.putText("File "+param1+" Not Created");
                        _StdOut.advanceLine();
                    }
                    break;
                case 1: /*read*/
                    _Kernel.krnTrace("FSDD>DU>READ filename: "+param1);
                    var read=_krnFSDD.readFile(param1);
                    _StdOut.putText("File: "+param1);
                    _StdOut.advanceLine();
                    _StdOut.putText(read);

            }




            }









    }


}