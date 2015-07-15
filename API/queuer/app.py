#!/usr/bin/env python
'''
This server manages a queue, which is shared by the workers and
the autoscaler. It also generates tokens.
'''

from Queue import Queue
from bottle import route, response, run, request
import random

# constants
URL_CACHE = {}
MANAGED_QUEUE = Queue()
LETTERS = 'abcefghijklmnopqrstuvwxyz'

def url_test(url):
    ''' tests to see if the str passed is a fb profile image url'''
    # needs significant testing!
    if 'http' not in url:
        return False
    return 'facebook' in url.lower() or 'fb' in url.lower()

def generate_token():
    ''' returns string len 24 of lowercase letters '''
    chars = [random.choice(LETTERS) for _ in range(24)]
    return ''.join(chars)

@route('/dream', method='GET')
def push():
    ''' takes parameter url, returns token if url is good'''
    url = request.params.get('url', '')
    # does url need to be urldecoded
    if not url_test(url):
        response.status = 400
        return 'Error: bad image URL'
    if url in URL_CACHE:
        return URL_CACHE[url]
    URL_CACHE[url] = token = generate_token()
    MANAGED_QUEUE.put((token, url))
    return token

if __name__ == '__main__':
    run(host='0.0.0.0', port=80, server='tornado')
