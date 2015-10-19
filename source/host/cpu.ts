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
                    public op: string="",
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
            var i;
            var a;
            var b;
            var c;
            var char;
            _Kernel.krnTrace('CPU cycle');
            if (this.isExecuting) {
                instruction = _Mem.coreM[this.PC];
                switch (instruction) {
                    case "00": //end
                        this.op="00";
                        this.isExecuting = false;
                        //this.PC=0;
                        break;
                    case "A9":  //load acc with const
                        this.op="A9";

                        this.PC++;
                        this.Acc =parseInt(_Mem.coreM[this.PC], 16);
                        this.PC++;
                        break;
                    case  "A2":
                        this.op="A2";
                        this.PC++;
                        this.Xreg=parseInt(_Mem.coreM[this.PC],16);
                        this.PC++;
                        break;
                    case "A0":
                        this.op="A0";
                        this.PC++;
                        this.Yreg=parseInt(_Mem.coreM[this.PC],16);
                        this.PC++;
                        break;
                    case "AD":
                        this.op="AD";
                        i=_MemMan.toAddress();
                        this.Acc=parseInt(_Mem.coreM[i],16);
                        this.PC++;
                        break;
                    case "8D":
                        this.op="8d";
                        i=_MemMan.toAddress();
                        _Mem.coreM[i]=this.Acc.toString(16);
                        this.PC++;
                        break;
                    case "6D":
                        this.op="6d";
                        i=_MemMan.toAddress();
                        a=this.getConstantNumber(_Mem.coreM[i]);
                        b=this.getConstantNumber(this.Acc.toString(16));
                        c=a+b;
                        this.Acc=parseInt(c.toString(),16);
                        this.PC++;
                        break;
                    case "AE":
                        this.op="AE";
                        i=_MemMan.toAddress();
                        this.Xreg=parseInt(_Mem.coreM[i], 16);
                        this.PC++;
                        break;
                    case "AC":
                        this.op="AC";
                        i=_MemMan.toAddress();
                        this.Yreg=parseInt(_Mem.coreM[i],16);
                        this.PC++;
                        break;
                    case "EE":
                        this.op="EE";
                        i=_MemMan.toAddress();
                        a=parseInt(_Mem.coreM[i],16);
                        a=a+1;
                        _Mem.coreM[i]=a.toString(16);
                        this.PC++;
                        break;
                    case "EA":
                        this.op="EA";
                        this.PC++;
                        break;
                    case "EC":
                        this.op="EC";
                        i=_MemMan.toAddress();
                        a=this.getConstantNumber(_Mem.coreM[i]);
                        b=this.getConstantNumber(this.Xreg.toString());
                        if(a==b){
                            this.Zflag=0;
                        }else{
                            this.Zflag=1;
                        }
                        this.PC++;
                        break;

                    case "D0":
                        this.op="D0";
                        this.PC++;
                        i=parseInt(_Mem.coreM[this.PC],16);
                        if(this.Zflag==1){
                            this.PC=255-i;


                        }else{
                            this.PC++;
                        }
                        break;
                    case "FF":
                        this.op="FF";

                        if(this.Xreg==01){
                            _StdOut.putText("Number is "+this.Yreg);
                            this.PC++;


                        }else if(this.Xreg==02){


                            this.PC++;

                        }else{
                            _StdOut.putText("Value in Xreg must be 1 or 0");
                            this.isExecuting=false;
                        }
                        break;



                    default:
                        this.isExecuting=false;
                        _StdOut.putText("Error no match found: "+_Mem.coreM[this.PC]);

                }
                Control.initCPUTable();
                Control.updateMemoryTable();
                Control.checkExe();


            }

        }


        public getConstantNumber(num:string):number {
            var v = parseInt(num, 16);
            return v;


        }




        }
    }


