///<reference path="../globals.ts" />

/* ------------
 Status.ts

 Requires globals.ts


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
        public static statusLog(): void {

            var theDate=new Date();
            var month= theDate.getUTCMonth();
            var date=month+"/"+theDate.getUTCDate()+"/"+theDate.getUTCFullYear()+" "+theDate.getHours()+":"+theDate.getMinutes()+":"+theDate.getSeconds();
            _Bar.value=date + "This is a status";



        }





}


    }1