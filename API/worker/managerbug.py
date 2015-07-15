from multiprocessing.managers import BaseManager
from multiprocessing import Queue
import traceback
import time
import gc
gc.disable()

def make(debug=1):
    ''' makes a remote queue and returns it '''
    class QManager(BaseManager):
        ''' manager of a remote queue '''
        pass
    queue = Queue()
    QManager.register('getQueue', callable=lambda:queue)
    qm = QManager(address=('localhost', 8989), authkey='abc')
    qm.start()
    if debug == 0:
        return
    if debug == 1:
        try:
            make()
        except:
            print traceback.print_exc()
    if debug == 2:
        raise Exception
    if debug == 3:
        return qm

make(0) # creates qm; upon return qm goes away
make(3) # the server stops running because it wasn't put somewhere
make(0) # showing that make(3) does nothing

f = make(3) # the server keeps running because it was put in f
try:
 make(0) # tries using the same ip,port to show server is running
 print 'not expected'
except:
 print 'expected'
f.shutdown() # gets rid of server

make(1) # running make inside make fails; we have reference to qm

try:
 make(2) # exit using an exception; the server doesn't stop!
except:
 pass
try:
 make(0) # should not work because ip,port in use
 print 'not expected'
except:
 print 'expected'

