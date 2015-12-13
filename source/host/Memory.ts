///<reference path="../globals.ts" />

module TSOS {

    export class Memory {

        constructor(public coreM=[MAX_MEM],
                    public coreBase: number=0,
                    public coreLimit: number=768){}

        public init(): void{
            this.coreM=[MAX_MEM];
            this.coreBase=0;
            this.coreLimit=768;
            for(var i=0; i<768; i++){
                this.coreM[i]="00";
            }

        }


    }

}