///<reference path="../globals.ts" />

/* ------------
 PCB.ts
 ------------ */

module TSOS {

    export class PCB {

        constructor(public pid:number=0,
                    public state: string="",
                    public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0){

        }

        public init(): void {
            this.pid=_OsShell.pid;
            this.state="new";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;

        }


    }
}
