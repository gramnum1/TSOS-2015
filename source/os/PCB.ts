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
                    public Zflag: number = 0,
                    public base:number=0,
                    public limit: number=0,
                    public location: number=0,
                    public priority: number=0) //0 if memory 1 if disk
                    {

        }

        public init(newBase, newLimit, location, priority): void {
            this.pid=_OsShell.pid;
            this.state="new";

            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.base=newBase;
            this.limit=newLimit;
            this.location=location;
            this.priority=priority;
            this.PC = this.base;

        }


    }
}
