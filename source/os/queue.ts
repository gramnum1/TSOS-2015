/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue {
        constructor(public q = new Array()) {
        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty(){
            return (this.q.length == 0);
        }

        public enqueue(element) {
            //_Kernel.krnTrace("enqueue "+element.toString());
            this.q.push(element);
        }

        public dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
                //_Kernel.krnTrace("dequeue "+retVal);
            }
            return retVal;
        }

        public toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }

        public getObj(index){
            var element=this.q[index];
            return element;
        }

        public remove(pid){
            for (var i=0; i<this.getSize(); i++){
                if(this.q[i].pid==pid){
                    this.swap(this.q,0, i);
                    this.dequeue();
                }
            }

        }
        private swap(array, A, B ){
            var temp=array[B];
            array[B]=array[A];
            array[A]=temp;


        }
    }
}
