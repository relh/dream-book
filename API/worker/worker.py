''' make sure to configure AWS from the CLI first! 
run this module on workers
it uses caffe via the deepdream module
grabs tokens and such from queue, processes them, then dumps the
results onto S3
'''

import boto3
import PIL.Image
import urllib2
from cStringIO import StringIO
import traceback
import threading
import remotequeue

open('/home/ubuntu/deepdream.py','w').write(urllib2.urlopen('https://raw.githubusercontent.com/relh/dreambook/master/API/worker/deepdream.py').read())

# dreambaby is a generator which yields StringIO buffers containing
# partial deep dreams, until the last one, the full deep dream
# it takes in a PIL Image and template
from deepdream import dreambaby

# grab the queue
AUTH_KEY = 'changeinprod'
QUEUE_IP = '127.0.0.1'

MANAGED_QUEUE = remotequeue.get(QUEUE_IP, AUTH_KEY)

S3 = boto3.resource('s3')
BUCKET_NAME = 'deepdreambook'

NUM_THREADS = 3
# constrained by RAM and GPU

def url_to_image(url):
    ''' takes in a url, returns a PIL.Image '''
    buf = StringIO(urllib2.urlopen(url).read())
    return PIL.Image.open(buf)


def push_buffer(buf, key):
    ''' pushes a StringIO to S3 '''
    S3.Bucket(BUCKET_NAME).put_object(Key=key, Body=buf)


def run_worker():
    ''' runs worker indefinitely '''
    while True:
        try:
            token, layer, iterations, recursions, url = MANAGED_QUEUE.get()
            print url
            if '/' not in url:
             print 'bye';return
            image = url_to_image(url)
        except:
            traceback.print_exc()
            continue
        generator = dreambaby(image, layer, iterations, recursions)
        for counter, partial in enumerate(generator):
            push_buffer(partial, token + str(counter) + '.jpg')

if __name__ == '__main__':
    for k in range(NUM_THREADS):
        threading.Thread(target = run_worker).start()
