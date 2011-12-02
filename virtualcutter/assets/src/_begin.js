/* $Id: _begin.js 267 2011-12-01 16:37:37Z thijs $
 * 
 * @file
 * VirtualCutter
 *
 * A web-based tool for making a virtual "selection" of an existing video and 
 * return a start- and end time for use in HTML5 and/or Flash players that 
 * support the Media Fragments standard.
 *
 * The VirtualCutter is developed by One Shoe (www.oneshoe.nl) for the 
 * University of Groningen (ww.rug.nl), co-funded by SURFnet (www.surfnet.nl)
 * for use in the MediaMosa project (www.mediamosa.org).
 *
 * For more information see http://www.mediamosa.org or contact SURFnet via
 * http://www.surfnet.nl or One Shoe at http://www.oneshoe.nl/contact.
 *
 * This project uses code from VideoJS and Flowplayer. VideoJS is licensed as
 * GNU Lesser General Public License, version 3 (LGPLv3) and Flowplayer is 
 * licensed under GNU General Public License, version 3 (GPLv3). As the latter
 * is more restrictive in embedding into other projects under a different 
 * license, this project is licensed under GPLv3.
 *
 * @author One Shoe - http://www.oneshoe.nl
 */

/*
 * VideoJS - HTML5 Video Player
 * v2.0.2
 * 
 * This project contains code from VideoJS. Copyright 2010 Zencoder, Inc.
 * 
 * VideoJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * VideoJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with VideoJS.  If not, see <http://www.gnu.org/licenses/>.
 */

/* 
 * flowplayer.js 3.2.6. The Flowplayer API
 * 
 * Copyright 2009 Flowplayer Oy
 * 
 * This file is part of Flowplayer.
 * 
 * Flowplayer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Flowplayer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Flowplayer.  If not, see <http://www.gnu.org/licenses/>.
 */
(function($){