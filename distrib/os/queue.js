/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */
var TSOS;
(function (TSOS) {
    var Queue = (function () {
        function Queue(q) {
            if (q === void 0) { q = new Array(); }
            this.q = q;
        }
        Queue.prototype.getSize = function () {
            return this.q.length;
        };
        Queue.prototype.isEmpty = function () {
            return (this.q.length == 0);
        };
        Queue.prototype.enqueue = function (element) {
            //_Kernel.krnTrace("enqueue "+element.toString());
            this.q.push(element);
        };
        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };
        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        Queue.prototype.getObj = function (index) {
            var element = this.q[index];
            return element;
        };
        Queue.prototype.remove = function (pid) {
            var element;
            for (var i = 0; i < this.getSize(); i++) {
                if (this.q[i].pid == pid) {
                    this.swap(this.q, 0, i);
                    element = this.dequeue();
                }
            }
            return element;
        };
        Queue.prototype.swap = function (array, A, B) {
            var temp = array[B];
            array[B] = array[A];
            array[A] = temp;
        };
        return Queue;
    })();
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
