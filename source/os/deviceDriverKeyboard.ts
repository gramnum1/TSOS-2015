///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var wrongAssign= [50,54,55,56,57,48];
            var symbolKey=[189, 187, 192, 186, 222, 188, 190, 191, 219, 221, 220];
            var symbolLower=[45,61,96, 59, 39,44,46,47,91,93,92];
            var symbolUpper=[95,43,126,58,34,60,62,63,123,125,124];
            var symbolHold;
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.




                if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                    ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                    // Determine the character we want to display.
                    // Assume it's lowercase...
                    chr = String.fromCharCode(keyCode + 32);
                    // ... then check the shift key and re-adjust if necessary.
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode);
                        _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                    }
                    // TODO: Check for caps-lock and handle as shifted if so.
                    _KernelInputQueue.enqueue(chr);
                } else if ((keyCode >= 48) && (keyCode <= 57) ||   // digits
                    (keyCode == 32) ||   // space
                    (keyCode == 13) ||
                    (keyCode==8)) {                       // enter
                    if(isShifted){
                        if(wrongAssign.indexOf(keyCode) <= -1) {
                            keyCode = keyCode - 16;
                            _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                            chr = String.fromCharCode(keyCode);
                            _KernelInputQueue.enqueue(chr);
                        }else if(wrongAssign.indexOf(keyCode)>-1){

                            switch(keyCode) {
                                case 50:
                                    keyCode = 64;
                                    break;
                                case 54:
                                    keyCode=94;
                                    break;
                                case 55:
                                    keyCode=38;
                                    break;
                                case 56:
                                    keyCode=42;
                                    break;
                                case 57:
                                    keyCode=40;
                                    break;
                                case 48:
                                    keyCode=41;
                                    break;




                            }
                            _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                            chr = String.fromCharCode(keyCode);
                            _KernelInputQueue.enqueue(chr);

                        }
                    }

                    else{
                        chr = String.fromCharCode(keyCode);

                        _KernelInputQueue.enqueue(chr);

                    }




                }else if(symbolKey.indexOf(keyCode)>-1){
                    symbolHold=symbolKey.indexOf(keyCode);

                    keyCode=symbolLower[symbolHold];
                    if(isShifted){
                        keyCode=symbolUpper[symbolHold];
                    }
                    _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);

                }
            }

}}
