import cherrypy
from script import dreambaby
import PIL.ImageOps
import PIL.Image
import urllib2
import StringIO

def tryURL(input):
 im = PIL.Image.open(StringIO.StringIO(urllib2.urlopen(input).read()))
 return dreambaby(im)

def testURL(url):
 tryURL(input).save('hello.jpg')

if __name__ == '__main__':

 cherrypy.server.socket_host = '0.0.0.0'

 class HelloWorld(object):
  @cherrypy.expose
  def index(self, input):
   cherrypy.response.headers['Content-Type'] = 'image/jpeg'
   im = PIL.Image.open(StringIO.StringIO(urllib2.urlopen(input).read()))
   return dreambaby(PIL.ImageOps.invert(im))
 
 cherrypy.quickstart(HelloWorld())
