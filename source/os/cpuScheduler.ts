///<reference path="../globals.ts" />
module TSOS {

    export class cpuScheduler {
        constructor(
            public quantum: number=6,
            public counter: number=0


        ){}

        /*init()
        inits round robin scheduler
        by throwing first item in ReadyQ
        into the CPU
         */
        public init(): void{

            var first=_ReadyQ.dequeue();
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
        public change(): void{
            if(_ReadyQ.getSize()>0) {

                var on=_CPU.currPCB;
                on.state="waiting";

                var off = _ReadyQ.dequeue();
                off.state="running";
                _ReadyQ.enqueue(on);
                //_StdOut.advanceLine();
                _Kernel.krnTrace("cpuched ENQUEUE PID= " + on.pid+ " PC= "+on.PC);
                //_StdOut.advanceLine();


                _Kernel.krnTrace("cpusched DEQUEUE PID= " + off.pid+" PC= "+off.PC);




                _CPU.PC = off.PC;
                _CPU.Acc = off.Acc;
                _CPU.Xreg = off.Xreg;
                _CPU.Yreg = off.Yreg;
                _CPU.Zflag = off.Zflag;
                _CPU.isExecuting = true;
                _CPU.currPCB = off;
                Control.updatePCBTable();





            }
            this.counter=0;






        }
        /*replace()
        used when executing process finishes
        simply dequeues off of
        ready q and places
        pcb on CPU
         */
        public replace(): void{
            var off = _ReadyQ.dequeue();
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
