from multiprocessing.managers import BaseManager
from multiprocessing import Queue

PORT = 8989

def get(ip, authkey):
    print globals()
    print locals()
    ''' gets a remote queue on another ip '''
    class RManager(BaseManager):
        ''' manager which connects to a remote queue '''
        pass
    RManager.register('getQueue')
    current_manager = RManager(address=(ip,PORT), authkey=authkey)
    current_manager.connect()
    return current_manager.getQueue()

def make(authkey, public=True, debug=False):
    ''' makes a remote queue and returns it '''
    class QManager(BaseManager):
        ''' manager of a remote queue '''
        pass
    queue = Queue()
    QManager.register('getQueue', callable=lambda:queue)
    ip = '0.0.0.0' if public else 'localhost'
    qm = QManager(address=(ip, PORT), authkey=authkey)
    qm.start()
    if debug:
        make(authkey)
        #get('localhost', authkey)
    return queue

print 'will work'
make('a', debug=True)
print 'correct, it worked!'

print 'will not work'
make('a')
get('localhost', 'a')
print 'oh wow, it worked!'

print 'yay'
