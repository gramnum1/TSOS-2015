///<reference path="../globals.ts" />
module TSOS {

    export class cpuScheduler {
        constructor(
            public quantum: number=6,
            public counter: number=0


        ){}

        public init(): any{
            _Mode=0;
            var first=_ReadyQ.dequeue();
            first.state="running";
            _Kernel.krnTrace("DEQUEUE PID= " + first.pid+" PC= "+first.PC);
            Control.updateReadyTable();
            _Mode=1;

            return first;

        }

        public change(): void{
            if(_ReadyQ.getSize()>0) {

                var on=_CPU.currPCB;
                on.state="waiting";

                var off = _ReadyQ.dequeue();
                off.state="running";
                _ReadyQ.enqueue(on);
                //_StdOut.advanceLine();
                _Kernel.krnTrace("ENQUEUE PID= " + on.pid+ " PC= "+on.PC);
                //_StdOut.advanceLine();


                _Kernel.krnTrace("DEQUEUE PID= " + off.pid+" PC= "+off.PC);




                _CPU.PC = off.PC;
                _CPU.Acc = off.Acc;
                _CPU.Xreg = off.Xreg;
                _CPU.Yreg = off.Yreg;
                _CPU.Zflag = off.Zflag;
                _CPU.isExecuting = true;
                _CPU.currPCB = off;
                Control.updateReadyTable();


            }
            this.counter=0;




        }
        public replace(): void{
            var off = _ReadyQ.dequeue();
            _Kernel.krnTrace("DEQUEUE PID= " + off.pid);
            //_StdOut.advanceLine();




            _CPU.PC = off.PC;
            _CPU.Acc = off.Acc;
            _CPU.Xreg = off.Xreg;
            _CPU.Yreg = off.Yreg;
            _CPU.Zflag = off.Zflag;
            _CPU.isExecuting = true;
            _CPU.currPCB = off;
            this.counter=0;
        }





    }
}
