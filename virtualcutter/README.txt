VirtualCutter

A web-based tool for making a virtual "selection" of an existing video and
return a start- and end time for use in HTML5 and/or Flash players that
support the Media Fragments standard.

The VirtualCutter is developed by One Shoe (www.oneshoe.nl) for the
University of Groningen (ww.rug.nl), co-funded by SURFnet (www.surfnet.nl)
for use in the MediaMosa project (www.mediamosa.org).

For more information see http://www.mediamosa.org or contact SURFnet via
http://www.surfnet.nl or One Shoe at http://www.oneshoe.nl/contact.

This project uses code from VideoJS and Flowplayer. VideoJS is licensed as
GNU Lesser General Public License, version 3 (LGPLv3) and Flowplayer is
licensed under GNU General Public License, version 3 (GPLv3). As the latter
is more restrictive in embedding into other projects under a different
license, this project is licensed under GPLv3.

===============================================================================

This virtual cutter makes use of HTML5 video and can fall back to using a Flash
player for playing MP4 (h264, M4V) or Flash Video (FLV).

Explaining all variables concerned with server support for HTML5 video, Media
Fragments, byte-ranges and all different browser request methods would be too
much effort, also because HTML5 video is a "living" standard that might change
on a daily basis. Some examples however are included.

If you use an Apache webserver, there's a chance Apache wouldn't know what to
do with files with webm, mp4 or ogv/ogg extensions. The mime-type mapping might
not be up-to-date enough. If you experience problems with buffering for
example, take a look in the assets folder for an example.htaccess.

===============================================================================

Changing the CSS or Javascript
As you might have seen, the javascript files are built and minified together
into a single file. We've used uglify-js to minify and optimize the javascript
from the different files into one virtualcutter.all.js. Furthermore, to have
some flexibility in changing dimensions, and still keeping a semi-clean CSS
output we've used LESS.

The Makefile in the assets folder can be used to build all of those. Just go to
the assets folder using terminal, and type:
$ make
and hit Enter. That will use lessc for *.less file building and uglify-js for
compressing the javascript. If you just want to build the javascript, type:
$ make js
and hit Enter. If you want to want to edit and automatically build upon save,
you'll need to install watchr and type:
$ make watch
and hit Enter. That will wait for you to update one of the *.less or *.js
files in the current folder.
