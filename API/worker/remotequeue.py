from multiprocessing.managers import BaseManager
from multiprocessing import Queue

PORT = 6200

def get(ip, authkey):
    ''' gets a remote queue on another ip '''
    class RManager(BaseManager):
        ''' manager which connects to a remote queue '''
        pass
    RManager.register('getQueue')
    current_manager = RManager(address=(ip,PORT), authkey=authkey)
    current_manager.connect()
    return current_manager.getQueue()

def make(authkey, public=True):
    ''' makes a remote queue and returns it '''
    class QManager(BaseManager):
        ''' manager of a remote queue '''
        pass
    queue = Queue()
    QManager.register('getQueue', callable=lambda:queue)
    ip = '' if public else 'localhost'
    QManager(address=(ip, PORT), authkey=authkey).start()
    return queue
