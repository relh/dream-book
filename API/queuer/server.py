#!/usr/bin/env python
#!/usr/bin/env python
'''
This server manages a queue, which is shared by the workers and
the autoscaler. It also generates tokens. The queue is on port
6200.
'''

import remotequeue
from bottle import route, response, run, request
import random

# set up queue manager
AUTH_KEY = 'changeinprod'
MANAGED_QUEUE = remotequeue.make(AUTH_KEY, public=True)


# constants
LETTERS = 'abcefghijklmnopqrstuvwxyz'
URL_CACHE = {}


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
    ''' also takes parameters layer, iterations, and recursions which are numbers'''
    url = request.params.get('url', '')
    try:
        layer      = int(request.params.get('layer', ''))
        iterations = int(request.params.get('iterations', ''))
        recursions = int(request.params.get('recursions', ''))
        assert(0 <= layer <= 82 and 0 <= iterations and 0 <= recursions and 0 <= iterations*recursions <= 100) # dependent on network
    except:
        layer = 10
        iterations = 30
        recursions = 1
    # does url need to be urldecoded
    if not url_test(url):
        response.status = 400
        return 'Error: bad image URL'
    if url in URL_CACHE:
        return URL_CACHE[url]
    URL_CACHE[url] = token = generate_token()
    MANAGED_QUEUE.put((token, layer, iterations, recursions, url))
    response.body = token
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


if __name__ == '__main__':
    run(host='0.0.0.0', port=80, server='tornado')
