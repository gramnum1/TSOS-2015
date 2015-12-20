///<reference path="../globals.ts" />
module TSOS {

    export class cpuScheduler {
        constructor(
            public quantum: number=6,
            public counter: number=0,
            public algorithm: string="rr"


        ){}

        /*init()
        inits round robin scheduler
        by throwing first item in ReadyQ
        into the CPU
         */
        public init(): void{
            var oldprogram;
            var found=false;
            var i=0;
            var temp;
            var replace;
            var first=_ReadyQ.dequeue();
            if(first.location==1){
                var program=_krnFSDD.readFile(first.pid);
                _krnFSDD.delete(first.pid);
                while( i<_ReadyQ.getSize() && !found){
                    temp=_ReadyQ.getObj(i);
                    _Kernel.krnTrace("SCHED>INIT temp "+temp.pid+" location "+temp.location);
                    if(temp.location==0){
                        found=true;

                    }
                }
                replace=_ReadyQ.remove(temp.pid);
                _MemMan.swapProgram(replace, program );
                first.base=replace.base;
                first.limit=replace.limit;
                first.location=0;
                first.PC=first.base;

                replace.base=0;
                replace.limit=0;
                replace.PC=0;
                replace.location=1;

                _ReadyQ.enqueue(replace);
                if(this.algorithm=="priority"){
                    _ReadyQ.quicksort(0,_ReadyQ.getSize()-1);
                }



            }
            first.state="running";
            _CPU.currPCB = first;
            _CPU.PC=first.base;
            _Kernel.krnTrace("SCHED>iNIT pcb "+first.pid+" b, l, pc "+first.base+" "+first.limit+" "+first.PC)









        }

        /*change()
        takes running process off of cpu
        enqueues it to ready q
        dequeues of of ready q
        places dequeued pcb onto
        cpu

         */
        public change(): void {
            if (_ReadyQ.getSize() > 0) {
                if (_ReadyQ.getObj(0).location == 1) {
                    _Kernel.krnTrace("CPUSCHED>CHANGE Swap from memory");
                    _KernelInterruptQueue.enqueue(new Interrupt(SWAP_IRQ, 0));
                } else {


                var on = _CPU.currPCB;
                on.state = "waiting";

                var off = _ReadyQ.dequeue();

                    off.state = "running";
                    //if(off.location==1){

                    /*
                     off.location=0;
                     off.base=on.base;
                     off.limit=on.limit;
                     off.PC=off.base+off.PC;
                     on.PC=on.PC-on.base;
                     on.base=0;
                     on.limit=0;



                     on.location=1;
                     _MemMan.exchange(off,on);
                     */
                    // }
                    _ReadyQ.enqueue(on);
                    //_StdOut.advanceLine();
                    _Kernel.krnTrace("cpuched ENQUEUE PID= " + on.pid + " PC= " + on.PC);
                    //_StdOut.advanceLine();


                    _Kernel.krnTrace("cpusched DEQUEUE PID= " + off.pid + " PC= " + off.PC);


                    _CPU.PC = off.PC;
                    _CPU.Acc = off.Acc;
                    _CPU.Xreg = off.Xreg;
                    _CPU.Yreg = off.Yreg;
                    _CPU.Zflag = off.Zflag;

                    _CPU.currPCB = off;
                    Control.updatePCBTable();
                    Control.updateDiskTable();
                    _CPU.isExecuting = true;
                }
            }


                this.counter = 0;
            }








        /*replace()
        used when executing process finishes
        simply dequeues off of
        ready q and places
        pcb on CPU
         */
        public replace(): void{
            _Kernel.krnTrace("CPUSCHED>REPLACE[currpcb] deleting "+_CPU.currPCB.pid);
            _krnFSDD.delete(_CPU.currPCB.pid);

            var off = _ReadyQ.dequeue();
            if(off.location==1){
                off.base=_CPU.currPCB.base;
                off.limit=_CPU.currPCB.limit;
                off.location=0;
                off.PC=off.PC+off.base;
                var program=_krnFSDD.readFile(off.pid).substr(0,509);
                var index=off.base;
                var toMemory;
                _Kernel.krnTrace("CPUSCHED>REPLACE[disk] deleting "+off.pid);

                _krnFSDD.delete(off.pid);
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
            //_Kernel.krnTrace("DEQUEUE PID= " + off.pid);
            //_StdOut.advanceLine();
            off.state="running";




            _CPU.PC = off.PC;
            _CPU.Acc = off.Acc;
            _CPU.Xreg = off.Xreg;
            _CPU.Yreg = off.Yreg;
            _CPU.Zflag = off.Zflag;
            _CPU.isExecuting = true;
            _CPU.currPCB = off;
            this.counter=0;
            Control.updatePCBTable();



        }








    }
}
