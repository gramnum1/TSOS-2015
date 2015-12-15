///<reference path="../globals.ts" />

module TSOS {

    export class MemoryManager {


        constructor(
            public block:number=0,
            public bases=[0,256, 512],
            public limits=[255, 511, 767 ]

        ){}


        public clearMem(){

            for(var i=0; i<MAX_MEM; i++){
            _Mem.coreM[i]="00";
            }
            Control.updateMemoryTable();
            this.block=0;
            _StdOut.putText("Resident List size= "+Resident_List.getSize());
            _OsShell.pid=0;
            _PCB=null;
        }

        /*loadProgram(program)
          loads a program into memory and  creates a PCB
          and assigns it a PID
         */
        public loadProgram(program: string, priority: number):void {
            var toMemory;
            var index=this.bases[this.block];

            if(this.block<3 && program.length/2 <=256) {
                for (var i =0; i < program.length; i++) {

                    //pull bytes out of string two char at a time
                    toMemory = program.slice(i, i + 2);

                    //throw byte into memory
                    _Mem.coreM[index] = toMemory;
                   // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                    i++;
                    index++;


                }


                //create new PCB
                var newBase = this.bases[this.block];
                var newLimit = this.limits[this.block];
                 _PCB = new PCB();
                _PCB.init(newBase, newLimit, 0, priority);
                Resident_List.enqueue(_PCB);

                _StdOut.putText("pid= " + _PCB.pid + " base="+_PCB.base+ " Limit="+_PCB.limit+" Priority="+_PCB.priority);
                _OsShell.pid++;
                _PCB=null;
               // _ReadyQ.enqueue(Resident_List[this.block]);


                //update memory Table
                Control.updateMemoryTable();

                this.block++;
                for(var i=0; i<Resident_List.getSize(); i++) {
                    _Kernel.krnTrace("RL " +Resident_List.getObj(i).pid);
                }
            }else if(program.length/2 <=256) {
                newBase=0;
                newLimit=0;
                _PCB = new PCB();
                _PCB.init(newBase, newLimit, 1, priority);
                Resident_List.enqueue(_PCB);
                var filename=_PCB.pid;
                _krnFSDD.createFile(filename);
                _krnFSDD.write(filename, program);
                _StdOut.putText("PCB LOCATION: "+_PCB.location);
                _StdOut.advanceLine();
                _StdOut.putText("pid= " + _PCB.pid + " base="+_PCB.base+ " Limit="+_PCB.limit+" Priority="+_PCB.priority);
                _OsShell.pid++;
                _PCB=null;


            }else{
                _StdOut.putText("error loading into memory");
            }
            }

            /*

             toMemory=program.charAt(i)+program.charAt(i+1);
             _CPU.memory[_CPU.memory.length]=toMemory;
             _Kernel.krnTrace(toMemory);
             }
             */




        /*toAddress()
         takes next two bytes
         after an opode, turns them into a
         decimal address for the memory array
         and returns it
         */
        public toAddress(): number{
            var index;
            _CPU.PC++;
            var b=_Mem.coreM[_CPU.PC];
            _CPU.PC++;
            var a=_Mem.coreM[_CPU.PC];
            var address=a.concat(b);
            index=_CPU.currPCB.base +parseInt(address,16);
            if(index >=_CPU.currPCB.base && index<= _CPU.currPCB.limit){
                return index
            }else{
                _StdOut.putText("Memory allocation "+ index+ " out of bounds. Base= "+ _CPU.currPCB.base+" Limit= "+_CPU.currPCB.limit);
                _StdOut.advanceLine();
                _Kernel.krnTrace("["+_CPU.currPCB.pid+"] MEMALLOC ERROR "+ index+ " out of bounds. Base= "+ _CPU.currPCB.base+" Limit= "+_CPU.currPCB.limit);

                _OsShell.shellKill(_CPU.currPCB.pid);



            }





        }
        public exchange(pcb): void{
           // _CPU.isExecuting = false;
            var currprg="";
            var start=pcb.base;
            var end=pcb.limit;
            var blankcounter=0;
            for(i=start; i<end; i++){
                currprg+=_Mem.coreM[i];

                }


            _Kernel.krnTrace("MM>EX CURRPRG: "+currprg);
            var newPCB=_ReadyQ.dequeue();
            _Kernel.krnTrace("MM>EX offcb "+newPCB.pid+" loc "+newPCB.location);
            newPCB.base=pcb.base;
            newPCB.limit=pcb.limit;
            newPCB.PC=newPCB.base+newPCB.PC;
            newPCB.location=0;
            newPCB.status="running";
            pcb.PC=pcb.PC-pcb.base;
            pcb.base=0;
            pcb.limit=0;
            pcb.location=1;
            pcb.status="waiting";



            var newprg=_krnFSDD.readFile(newPCB.pid).substr(0,509);
            _Kernel.krnTrace("MM>EX NEW PROGRAM: "+newprg);








            var toMemory;
            var index=newPCB.base;
            _Kernel.krnTrace("MM>EX new program length="+newprg.length);


            for (var i =0; i < newprg.length; i++) {

                //pull bytes out of string two char at a time
                toMemory = newprg.slice(i, i + 2);

                //throw byte into memory

                _Mem.coreM[index] = toMemory;
               //_Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());


                index++;
                    i++;
                }
            _krnFSDD.writeSwap(newPCB.pid,currprg,pcb.pid);
            _ReadyQ.enqueue(pcb);



            _CPU.PC = newPCB.PC;
            _CPU.Acc = newPCB.Acc;
            _CPU.Xreg = newPCB.Xreg;
            _CPU.Yreg = newPCB.Yreg;
            _CPU.Zflag = newPCB.Zflag;

            _CPU.currPCB = newPCB;
            //CPU.isExecuting = true;

            //_krnFSDD.writeSwap(currprg, pcb);

            Control.updatePCBTable();
            Control.updateDiskTable();




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
        public swapProgram(oldpcb, program){
            var index=oldpcb.base;
            var toMemory;
            var toDisk="";
            for(var i=oldpcb.base; i<oldpcb.limit; i++){
                toDisk+=_Mem.coreM[index];
                index++;
            }
            _Kernel.krnTrace("MM>SP toDisk: "+toDisk);
            index=oldpcb.base;
            for (var i =0; i < program.length; i++) {

                //pull bytes out of string two char at a time
                toMemory = program.slice(i, i + 2);
                //throw byte into memory

                _Mem.coreM[index] = toMemory;
                // _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;


            }
            _krnFSDD.createFile(oldpcb.pid);
            _krnFSDD.write(oldpcb.pid, toDisk);



        }





    }

}