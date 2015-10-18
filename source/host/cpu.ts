///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC:number = 0,
                    public Acc:number = 0,
                    public Xreg:number = 0,
                    public Yreg:number = 0,
                    public Zflag:number = 0,
                    public isExecuting:boolean = false) {

        }

        public init():void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle():void {
            var instruction;
            var holder;
            _Kernel.krnTrace('CPU cycle');
            while (this.isExecuting) {
                instruction = _Mem.coreM[this.PC];
                switch (instruction) {
                    case "00":
                        this.isExecuting = false;
                        //this.PC=0;
                        break;
                    case "A9":
                        this.PC++;
                        this.Acc = this.getConstantNumber(_Mem.coreM[this.PC]);
                        this.PC++;
                        break;
                    case  "A2":
                        this.PC++;
                        this.Xreg=this.getConstantNumber(_Mem.coreM[this.PC]);
                        this.PC++;
                        break;
                    case "A0":
                        this.PC++;
                        this.Yreg=this.getConstantNumber(_Mem.coreM[this.PC]);
                        this.PC++;
                        break;
                }
                Control.initCPUTable();
                Control.updateMemoryTable();


            }

        }


        public getConstantNumber(num:string):number {
            var v = parseInt(num, 16);
            return v;


        }
        public static littleEndianConvert(address: string){
            var holder;
            for

        }
    }
}

