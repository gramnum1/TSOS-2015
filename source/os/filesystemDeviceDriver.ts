///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="../utils.ts" />
module TSOS {

    // Extends DeviceDriver
    export class FSDD extends DeviceDriver {
        public tracks=4;
        public sections=8;
        public blocks=8;


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
                this.emptyData+="00";

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
            var params=new Array(4);
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
                        params[0]=0;
                        params[1]=s;
                        params[2]=b;
                        params[3]="blue";
                        _KernelInterruptQueue.enqueue(new Interrupt(DVU_IRQ, params ));
                        //Control.updateDiskView(0,s,b,"green");
                        Control.updateDiskTable();
                        return true;


                    }

                }
            }
            return false;



        }
        private fillerBlock(data): string{
            //_Kernel.krnTrace("data length: "+data.length);
            var fill="";
            for(var i=0; i<(124-data.length); i++){
                fill+="0";
            }
            return data.concat(fill);

        }private fillerData(data): string{
        //_Kernel.krnTrace("data length: "+data.length);
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
            var lastRead;
            var params=new Array(4);
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    temp=this.getData(0,s,b);
                    if(temp==filename){
                       // Control.updateDiskView(0,s);
                        MBR=this.getMBR(0,s,b);
                        //_Kernel.krnTrace("MBR: "+MBR);
                        do{

                          lastRead=MBR;
                           params[0]= parseInt(lastRead.charAt(0));
                           params[1]=parseInt(lastRead.charAt(1));
                            params[2]=parseInt(lastRead.charAt(2));
                            params[3]="green";


                            _KernelInterruptQueue.enqueue(new Interrupt(DVU_IRQ, params ));
                            //Control.updateDiskView(parseInt(lastRead.charAt(0)),parseInt(lastRead.charAt(1)),parseInt(lastRead.charAt(2)), "yellow");


                            //_Kernel.krnTrace("in do");
                            read+=sessionStorage.getItem(MBR).substr(4);
                           // _Kernel.krnTrace("Read: "+read);
                            nextRead=sessionStorage.getItem(MBR).substr(1,3);
                            //_Kernel.krnTrace("nextRead: "+nextRead);
                            MBR=nextRead;



                        }while(MBR!="000");
                        /*
                        var track =parseInt(lastRead.charAt(0));
                        var sector=parseInt(lastRead.charAt(1));
                        var block=parseInt(lastRead.charAt(2));
                       // track =parseInt(MBR.charAt(0));
                        //sector=parseInt(MBR.charAt(1));
                        _Kernel.krnTrace("track:"+track+" Sector: "+sector);
                        Control.updateDiskView(track,sector, block, "green");
                        */
                        //read=Utils.hexToString(read);
                        _Kernel.krnTrace("FSDD>RF READ: "+read);





                      return read;


                    }
                }

                }
            _StdOut.putText("File "+filename+" not found");

        }

        public writeSwap(oldfilename,data, filename): void{


            this.delete(oldfilename);
            this.createFile(filename);
            this.write(filename,data);






            Control.updateDiskTable();
            return;









        }





        public write(filename, data): boolean {
            //data=Utils.stringToHex(data);
            filename=this.fillerData(Utils.stringToHex(filename));



               var numBlocks=Math.ceil(data.length/120);
                _Kernel.krnTrace("Num Blocks: "+numBlocks);

            var temp;
            var MBR;
            var pointer=0;
            var write="";
            var nextBlock;
            var limit=0;
            var lastBlock;
            var params=new Array(4);

            for (var s = 0; s < this.sections; s++) {
                for (var b = 0; b < this.blocks; b++) {

                    temp = this.getData(0, s, b);
                    if (temp == filename) {
                        //Control.updateDiskView(0,s);
                        MBR = this.getMBR(0, s, b);

                        for(var i=0; i<numBlocks; i++){
                            lastBlock=MBR;
                            params[0]= parseInt(lastBlock.charAt(0));
                            params[1]=parseInt(lastBlock.charAt(1));
                            params[2]=parseInt(lastBlock.charAt(2));
                            params[3]="yellow";


                            _KernelInterruptQueue.enqueue(new Interrupt(DVU_IRQ, params ));


                            nextBlock="000";
                            if(i!=numBlocks-1){
                                nextBlock=this.getFreeSpace();
                            }
                            while(pointer<data.length && limit<120 ){
                                write+=data.charAt(pointer);
                                pointer++;
                                limit++
                            }
                            //_Kernel.krnTrace(write);
                            //_Kernel.krnTrace(pointer.toString());
                            //write=this.fillerData(write);
                            //var DATA=this.fillerBlock("1"+nextBlock.concat(write));
                            if(write.length<120-1){
                                write=this.fillerData(write);
                            }

                            var DATA="1"+nextBlock.concat(write);
                            sessionStorage.setItem(MBR, DATA);
                            write="";
                            limit=0;
                            MBR=nextBlock;




                            }
                        //Control.updateDiskView(parseInt(lastBlock.charAt(0)),parseInt(lastBlock.charAt(1)),parseInt(lastBlock.charAt(2)), "yellow");
                        Control.updateDiskTable();
                        return true;








                        }
                    }

                }
            _Kernel.krnTrace("FSDD>W File "+filename+" not found");

            return false;
        }
        public delete(filename): boolean{
            filename=this.fillerData(Utils.stringToHex(filename));
            var temp;
            var MBR;
            var nextBlock;
            var lastBlock;
            var params=new Array(4);
            for(var s=0; s<this.sections; s++){
                for(var b=0; b<this.blocks; b++){
                    temp = this.getData(0, s, b);
                    if(temp==filename){
                        MBR = this.getMBR(0, s, b);
                        sessionStorage.setItem("0"+s+""+b, "0000"+this.emptyData);
                        do{

                            lastBlock=MBR;
                            params[0]= parseInt(lastBlock.charAt(0));
                            params[1]=parseInt(lastBlock.charAt(1));
                            params[2]=parseInt(lastBlock.charAt(2));
                            params[3]="red";
                            nextBlock=sessionStorage.getItem(MBR).substr(1,3);
                            _KernelInterruptQueue.enqueue(new Interrupt(DVU_IRQ, params ));
                            _Kernel.krnTrace("nextblock: "+nextBlock);
                            sessionStorage.setItem(MBR, "0000"+this.emptyData );

                                MBR = nextBlock;

                        }while(MBR!="000");
                       // sessionStorage.setItem(nextBlock, "0000"+this.emptyData );

                        //Control.updateDiskView(parseInt(lastBlock.charAt(0)),parseInt(lastBlock.charAt(1)),parseInt(lastBlock.charAt(1)),"red");
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
            var filename=params[1];
            var data=params[2];
            switch (action){
                case 0 /*create*/:

                    _Kernel.krnTrace("FSDD>DU>CREATE filename: "+filename);
                    if(_krnFSDD.createFile(filename)){
                        _StdOut.putText("File "+filename+" Created Succesfully");
                        _StdOut.advanceLine();
                    }else{
                        _StdOut.putText("File "+filename+" Not Created");
                        _StdOut.advanceLine();
                    }
                    break;
                case 1: /*read*/
                    _Kernel.krnTrace("FSDD>DU>READ filename: "+filename);
                    var read=_krnFSDD.readFile(filename);
                    read=Utils.hexToString(read);
                    _StdOut.putText("File: "+filename);
                    _StdOut.advanceLine();
                    _StdOut.putText(read);
                    break;
                case 2: /*read return */
                    var read=_krnFSDD.readFile(filename);

                    _PROGRAM=read;
                    _Kernel.krnTrace("FSDD>RR _PROGRAM: "+_PROGRAM);
                    break;







            }




            }









    }


}