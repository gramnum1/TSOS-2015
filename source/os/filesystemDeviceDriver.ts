///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
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
            super(this.krnfsDriverEntry);
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
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    var meta=this.getMeta(0,s,b);
                    if(meta.charAt(0)=="0"){
                        var dirLink=this.getFreeSpace();
                        if(dirLink!="na"){
                            sessionStorage.setItem("0"+s+""+b, "1"+dirLink.concat(filename));
                        }
                        Control.updateDiskTable();
                        return true;


                    }

                }
            }
            return false;



        }

        public readFile(filename): String{
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
                            sessionStorage.setItem(MBR, "1"+nextBlock.concat(write));
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
                _MemMan.exchange(filePCB, replacePCB);
                filePCB.base = replacePCB.base;
                filePCB.limit = replacePCB.limit;
                filePCB.location = 0;
                replacePCB.location = 1;
                _Kernel.krnTrace("FSDD>RUNONE replacedpcb location: " + replacePCB.location)
            }else{
                filePCB.base=0;
                filePCB.limit=255;
                filePCB.location = 0;
                _MemMan.retrieve(filePCB);

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







    }

}