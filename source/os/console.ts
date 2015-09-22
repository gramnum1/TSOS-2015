///<reference path="../globals.ts" />


/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {
        //Properties


        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public bufferArray=[],
                    public bufferIndexer=0) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private clearLine():void{
            _DrawingContext.clearRect( 0,this.currentYPosition-this.currentFontSize , _Canvas.width,this.currentFontSize+5);
            this.currentXPosition=0;
        }


        public remove():void{



            var bufferLength=this.buffer.length;
            var lastLetter=bufferLength - 1;
            var cCode = this.buffer.charCodeAt(lastLetter);
            var c = CanvasTextFunctions.letter(this.buffer.charAt(lastLetter));
            this.buffer=this.buffer.substring(0, lastLetter);
            _Kernel.krnTrace("Buffer Length ="+bufferLength+" Buffer= "+this.buffer);
            _Kernel.krnTrace("character= "+c.toString());
            this.clearLine();
            this.putText(">"+this.buffer);






        }

        private autoComplete():void {
            //this.clearLine();
            var lastMatch="";
            var matchFound=false;
            for (var i = 0; i < _OsShell.commandList.length; ++i) {
                if ((_OsShell.commandList[i].command.startsWith(this.buffer))&&this.buffer !="") {
                    matchFound=true;
                    this.advanceLine();



                    this.putText(">"+_OsShell.commandList[i].command);
                    lastMatch=_OsShell.commandList[i].command;
                }


            }
            if(matchFound) {
                this.buffer = lastMatch;
            }else{
                this.clearLine();
                this.buffer="";
                this.putText("No Match");
                this.advanceLine();
                this.putText(">");

            }

        }


        public history(chr): void{





                if (chr === String.fromCharCode(17)) {
                    if (this.bufferIndexer < this.bufferArray.length) {
                        ++this.bufferIndexer;
                        this.clearLine();
                        this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndexer]);
                        this.buffer=this.bufferArray[this.bufferArray.length - this.bufferIndexer];
                        _Kernel.krnTrace("Index At " + this.bufferIndexer);

                    }
                }
                if (chr === String.fromCharCode(18)) {
                    if(this.bufferIndexer >=2) {
                        --this.bufferIndexer;
                        this.clearLine();
                        this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndexer]);
                        _Kernel.krnTrace("Index At "+this.bufferIndexer);
                        this.buffer=this.bufferArray[this.bufferArray.length - this.bufferIndexer];
                    }
                }
            }






        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    this.bufferArray[this.bufferArray.length]=this.buffer;
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                    this.bufferIndexer=0;

                }else if(chr===String.fromCharCode(8)){//backspace

                    this.remove();

                }else if(chr===String.fromCharCode(9)){
                    this.autoComplete();
                }else if(chr===String.fromCharCode(17)||chr===String.fromCharCode(18)){
                    this.history(chr);
                }else {



                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)
        }
    }
 }
