from multiprocessing.managers import BaseManager
from multiprocessing import Queue
import traceback
import time
import gc
gc.disable()

def make(debug=0):
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

print 1
make(0)
make(0)
print 2

try:
 make(2)
except:
 pass
print 3

make(0)
print 4
