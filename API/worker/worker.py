# make sure to configure AWS from the CLI first!
import boto3
import PIL.Image
import urllib2
from cStringIO import StringIO
from multiprocessing import Queue
from multiprocessing.managers import BaseManager

# dreambaby is a generator which yields StringIO buffers containing 
# partial deep dreams, until the last one, the full deep dream
# it takes in a PIL Image and template
from deepdream import dreambaby

# grab the queue
AUTH_KEY = 'changeinprod'
QUEUE_IP = '127.0.0.1'


class Manager(BaseManager):
    ''' manager which connects to a remote queue '''
    pass


Manager.register('getQueue')
MANAGER = Manager(address=(QUEUE_IP, 6200), authkey=AUTH_KEY)
MANAGER.connect()
MANAGED_QUEUE = MANAGER.getQueue()


S3 = boto3.resource('s3')
BUCKET_NAME = 'deepdreambook'


def url_to_image(url):
    ''' takes in a url, returns a PIL.Image '''
    buffer = StringIO(urllib2.urlopen(url).read())
    return PIL.Image.open(buffer)


def push_buffer(buffer, key):
    ''' pushes a StringIO to S3 '''
    S3.Bucket(BUCKET_NAME).put_object(Key=key, Body=buffer)


if __name__ == '__main__':
    while True:
        token, template, url = MANAGED_QUEUE.get()
        image = url_to_image(url)
        generator = dreambaby(image, template)
        for counter, partial in enumerate(generator):
            push_buffer(partial, token + str(counter))
