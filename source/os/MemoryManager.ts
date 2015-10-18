///<reference path="../globals.ts" />

module TSOS {

    export class MemoryManager {


        constructor(){}


        public loadProgram(program: string):void {
            var toMemory;
            var index=0;
            for (var i = 0; i < program.length; i++) {


                toMemory = program.slice(i, i + 2);
                _Mem.coreM[index] = toMemory;
                _Kernel.krnTrace("Index: " + index + " value: " + _Mem.coreM[index].toString());
                i++;
                index++;


            }
            _PCB = new PCB();
            _PCB.init();
            _StdOut.putText("new process, pid= " + _PCB.pid);
            _OsShell.pid++;

            Control.updateMemoryTable();

            /*

             toMemory=program.charAt(i)+program.charAt(i+1);
             _CPU.memory[_CPU.memory.length]=toMemory;
             _Kernel.krnTrace(toMemory);
             }
             */


        }


        public toAddress(): number{
            var index;
            _CPU.PC++;
            var b=_Mem.coreM[_CPU.PC];
            _CPU.PC++;
            var a=_Mem.coreM[_CPU.PC];
            var address=a.concat(b);
            index=parseInt(address,16);
            return index



        }





    }

}