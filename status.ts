///<reference path="../globals.ts" />

/* ------------
 Console.ts

 Requires globals.ts

 The OS Console - stdIn and stdOut by default.
 Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
 ------------ */

module TSOS {

    export class Status {
        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize){}

       public init(): void{

       }
        private clearScreen(): void {
            _Bar.value="";
        }



}


    }1