/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static decToHex(d: number): string{
            var hex=d.toString(16).toUpperCase();
            return hex;

        }
        public static hexToDec(hex: string):number{
            var dec=parseInt(hex, 16);
            return dec;
        }
        public static stringToHex(str: string): string{
            var hexString="";

            for(var i=0; i<str.toString().length;i++){
                var temp=this.decToHex(str.toString().charCodeAt(i));
              if(temp.length<2){
                  temp="0"+temp;
              }

              hexString+=temp;

            }
            return hexString;
        }
        public static hexToString(hex: string):string{
            var str="";



            for(var i=0; i<hex.length-1;i++){
                var c=String.fromCharCode(this.hexToDec(hex.charAt(i)+hex.charAt(i+1)));
                _Kernel.krnTrace("UT>H2S Character "+c+" code: "+this.hexToDec(hex.charAt(i)+hex.charAt(i+1)));
                str+=c;
                i++;

            }
            return str;
        }
    }
}
