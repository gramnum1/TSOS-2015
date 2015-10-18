///<reference path="../globals.ts" />


/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {



        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public bufferArray=[], //Holds entered buffers for history
                    public bufferIndexer=0) { //maintains current index while using arrows for command recall
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        //clearLine()  clears a whole line on the console
        private clearLine():void{
            _DrawingContext.clearRect( 0,this.currentYPosition-this.currentFontSize , _Canvas.width,this.currentFontSize+5);
            this.currentXPosition=0;
        }

        //remove() allows useer to backspace
        public remove():void{

            var bufferLength=this.buffer.length;
            var lastLetter=bufferLength - 1;
            //honestly forgot to delete var cCode but I'll just comment out for now
            //var cCode = this.buffer.charCodeAt(lastLetter);
            var c = CanvasTextFunctions.letter(this.buffer.charAt(lastLetter));
            this.buffer=this.buffer.substring(0, lastLetter);//returns string without last letter and assigns it as buffer
            _Kernel.krnTrace("Buffer Length ="+bufferLength+" Buffer= "+this.buffer);
            _Kernel.krnTrace("character= "+c.toString());
            this.clearLine();
            this.putText(">"+this.buffer);//displays new string on console
        }
        //autoComplete auto fills command when tab is pressed
        private autoComplete():void {
            //this.clearLine();
            var lastMatch="";
            var matchFound=false;
            for (var i = 0; i < _OsShell.commandList.length; ++i) {
                if ((_OsShell.commandList[i].command.startsWith(this.buffer))&&this.buffer !="") { //check if any commands begin with current buffer
                    matchFound=true;
                    this.advanceLine();
                    this.putText(">"+_OsShell.commandList[i].command); //print all matching commands
                    lastMatch=_OsShell.commandList[i].command;  //last match is final matching command
                }


            }
            if(matchFound) {
                this.buffer = lastMatch; //assign buffer to lastMatch
            }else{//if no matches are found
                this.clearLine();
                this.buffer="";
                this.putText("No Match");
                this.advanceLine();
                this.putText(">");

            }

        }

        //history(chr) implements command recall using up and down arrows
        public history(chr): void{
            if (chr === String.fromCharCode(17)) {//if up arrow
                if (this.bufferIndexer < this.bufferArray.length) {//check for upper bound
                    ++this.bufferIndexer;
                        this.clearLine();
                        this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndexer]);//use buffer indexer to call appropriate command
                        this.buffer=this.bufferArray[this.bufferArray.length - this.bufferIndexer];
                        _Kernel.krnTrace("Index At " + this.bufferIndexer);

                    }
                }
                if (chr === String.fromCharCode(18)) {//if down arrow
                    if(this.bufferIndexer >=2) {//check lower bound
                        --this.bufferIndexer;
                        this.clearLine();
                        this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndexer]);
                        _Kernel.krnTrace("Index At "+this.bufferIndexer);
                        this.buffer=this.bufferArray[this.bufferArray.length - this.bufferIndexer];
                    }
                }
            }

        //scroll() allows console to scroll
        public scroll():void{
            //capture existing text
            var myImageData = _DrawingContext.getImageData(0,this.currentFontSize+7,_Canvas.width, _Canvas.height);
            _Kernel.krnTrace("EXTEND!!!!!");
            this.clearScreen();
            this.currentYPosition -= _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            //increase canvas height by 500
            //_Canvas.height+=21;
            //restore previous text
            _DrawingContext.putImageData(myImageData, 0,0);
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
                    this.bufferArray[this.bufferArray.length]=this.buffer;//add buffer to bufferArray on enter
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                    this.bufferIndexer=0; //reset bufferIndex

                }else if(chr===String.fromCharCode(8)){//backspace

                    this.remove();//remove last character

                }else if(chr===String.fromCharCode(9)){//tab
                    this.autoComplete();
                }else if(chr===String.fromCharCode(17)||chr===String.fromCharCode(18)){//arrows
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
           // _Kernel.krnTrace("Y Position: "+this.currentYPosition);

            if(this.currentYPosition >_Canvas.height){//check if we need more space on console
                _Kernel.krnTrace("WEVE REACHED THE END");
                this.scroll();


            }
            // TODO: Handle scrolling. (iProject 1)

        }
    }
 }
