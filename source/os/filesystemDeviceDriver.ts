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
                        _Kernel.krnTrace("MBR: "+MBR);
                        do{
                            _Kernel.krnTrace("in do");
                            read+=sessionStorage.getItem(MBR).substr(4);
                            _Kernel.krnTrace("Read: "+read);
                            nextRead=sessionStorage.getItem(MBR).substr(1,3);
                            _Kernel.krnTrace("nextRead: "+nextRead);
                            MBR=nextRead;



                        }while(MBR!="000");
                        _Kernel.krnTrace("after do");





                      return read;


                    }
                }

                }
            _StdOut.putText("File "+filename+" not found");

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
                            _Kernel.krnTrace(write);
                            _Kernel.krnTrace(pointer.toString());
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