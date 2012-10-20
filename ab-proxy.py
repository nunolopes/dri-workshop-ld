"""
The Authors N' Books back-end. 

Copyright (c) 2012 The Apache Software Foundation, Licensed under the Apache License, Version 2.0.

@author: Michael Hausenblas, http://mhausenblas.info/#i
@author: Nuno Lopes, http://nunolopes.org/
@since: 2012-10-17
@status: init
"""

import sys, logging, datetime, urllib, urllib2, json, requests, urlparse
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler

# configuration
DEBUG = True
DEFAULT_PORT = 8998

if DEBUG:
	FORMAT = '%(asctime)-0s %(levelname)s %(message)s [at line %(lineno)d]'
	logging.basicConfig(level=logging.DEBUG, format=FORMAT, datefmt='%Y-%m-%dT%I:%M:%S')
else:
	FORMAT = '%(asctime)-0s %(message)s'
	logging.basicConfig(level=logging.INFO, format=FORMAT, datefmt='%Y-%m-%dT%I:%M:%S')


class B2BServer(BaseHTTPRequestHandler):

	def do_GET(self):
		parsed_path = urlparse.urlparse(self.path)
		target_url = parsed_path.path[1:]
		
		# API calls
		if self.path.startswith('/europeana/'):
			self.exec_query('http://europeana-triplestore.isti.cnr.it/sparql/', self.path.split('/')[-1])
		elif self.path.startswith('/dydra/'):
			self.exec_query('http://dydra.com/mhausenblas/realising-opportunities-digital-humanities/sparql', self.path.split('/')[-1])
		# static stuff (for standalone mode - typically served by Apache or nginx)
		elif self.path == '/':
			self.serve_content('index.html')
		elif self.path.endswith('.ico'):
			self.serve_content(target_url, media_type='image/x-icon')
		elif self.path.endswith('.html'):
			self.serve_content(target_url, media_type='text/html')
		elif self.path.endswith('.js'):
			self.serve_content(target_url, media_type='application/javascript')
		elif self.path.endswith('.css'):
			self.serve_content(target_url, media_type='text/css')
		elif self.path.startswith('/img/'):
			if self.path.endswith('.gif'):
				self.serve_content(target_url, media_type='image/gif')
			elif self.path.endswith('.png'):
				self.serve_content(target_url, media_type='image/png')
			else:
				self.send_error(404,'File Not Found: %s' % target_url)
		else:
			self.send_error(404,'File Not Found: %s' % target_url)
		return

	# changes the default behavour of logging everything - only in DEBUG mode
	def log_message(self, format, *args):
		if DEBUG:
			try:
				BaseHTTPRequestHandler.log_message(self, format, *args)
			except IOError:
				pass
		else:
			return

	# serves static content from file system
	def serve_content(self, p, media_type='text/html'):
		try:
			f = open(curdir + sep + p)
			self.send_response(200)
			self.send_header('Content-type', media_type)
			self.end_headers()
			self.wfile.write(f.read())
			f.close()
			return
		except IOError:
			self.send_error(404,'File Not Found: %s' % self.path)

	# executes the SPARQL query remotely and returns JSON results
	def exec_query(self, endpoint, query):
		query = urllib2.unquote(query)
		lower = query.lower()
		if "select" in lower or "construct" in lower or "ask" in lower or "describe" in lower:
			try:
				p = {"query": query } 
				headers = { 'Accept': 'application/sparql-results+json', 'Access-Control-Allow-Origin': '*' }
				logging.debug('Query to endpoint %s with query\n%s' %(endpoint, query))
				request = requests.get(endpoint, params=p, headers=headers)
				logging.debug('Request:\n%s' %(request.url))
				logging.debug('Result:\n%s' %(json.dumps(request.json, sort_keys=True, indent=4)))
				self.send_response(200)
				self.send_header('Content-type', 'application/json')
				self.end_headers()
				self.wfile.write(json.dumps(request.json))
			except:
				self.send_error(500, 'Something went wrong here on the server side.')
		else:
			self.send_error(500, 'Please provide a valid SPARQL query!')

if __name__ == '__main__':
	try:
		from BaseHTTPServer import HTTPServer
		server = HTTPServer(('', DEFAULT_PORT), B2BServer)
		logging.info('AB server started, use {Ctrl+C} to shut-down ...')
		server.serve_forever()
	except Exception, e:
		logging.error(e)
		sys.exit(2)
