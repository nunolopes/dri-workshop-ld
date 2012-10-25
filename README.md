# The *Authors N' Books* Linked Data app

On 25 Oct 2012 we hold a [skills workshop](http://dri.ie/skills-workshops "Skills Workshops | Digital Repository Ireland") on 'Linked Data in the Digital Humanities', part of the 'Realising the Opportunities of Digital Humanities' event, organised by the Digital Repository Ireland ([DRI](http://dri.ie/)), Royal Irish Academy in Dublin.

## Purpose
This little Web application, developed by [Nuno](http://www.dri.ie/nuno-lopes) and [Michael](http://www.dri.ie/michael-hausenblas), demonstrates the power of Linked Data. It is driven by Linked Data we generated ourselves (well, actually [Anna](http://www.deri.ie/about/team/member/anna_dabrowska/) did the heavy lifting) and is served from a dedicated [SPARQL endpoint](http://dydra.com/mhausenblas/realising-opportunities-digital-humanities/sparql).  The Linked Data we used was generated from the data available in a [Google Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Alwfpys1YRkcdDJtN0tMZDBtSGJJUFlxMjlNdTZtNGc#gid=0) and the transformation of this data into RDF is presented in [this screencast](http://www.youtube.com/watch?v=1irwjiUOh_4).

## Installation and Usage

You might need to install the [Requests](http://docs.python-requests.org/en/latest/) library first. To run the proxy that is needed for querying the SPARQL endpoints launch:

	$ python ab-proxy.py
	2012-10-20T03:28:40 INFO AB server started, use {Ctrl+C} to shut-down ...
	
Then, you can open [`http://localhost:8998/`](http://localhost:8998/) in your browser and should see the following:

![Screen shot of the AB app.](https://raw.github.com/nunolopes/dri-workshop-ld/master/doc/ab-app-screenshot-2012-10-20.png "Screen shot of the AB app.")

If you then search for either authors (such as `Goethe`) or book titles (like, `Moby Dick`) you should see something like:

![Screen shot of a result in the AB app.](https://raw.github.com/nunolopes/dri-workshop-ld/master/doc/ab-app-result-screenshot-2012-10-20.png "Screen shot of a result in the AB app.")


## License
All software in this repository is licensed under the [Apache License, Version 2.0 ](http://www.apache.org/licenses/LICENSE-2.0) and all Linked Data is being made available under [CC0](http://creativecommons.org/publicdomain/zero/1.0/ "Creative Commons &mdash; CC0 1.0 Universal").
