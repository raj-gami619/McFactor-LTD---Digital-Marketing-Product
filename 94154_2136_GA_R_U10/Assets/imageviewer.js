/**
 * Angelwatt Image Viewer version 1.3
 * @Author: Kendall Conrad of Angelwatt.com
 * @url: http://www.angelwatt.com/coding/image_viewer.php
 * @Created: 2008-02-16
 * @Updated: 2011-02-07
 * @Description: Takes links to images and makes the links show the image on the page rather than opening a new page.
 * @License:
 * This work is licensed under a Creative Commons Attribution-Share Alike 3.0 United States License http://creativecommons.org/licenses/by-sa/3.0/us/
 */
/*global window, document, Image, setTimeout*/
(function(scope) {
'use strict';
var AngelwattImageViewer = function()
{
	/**** User Settings ****/
	var vars = {
		id:           '',     // id attribute of HTML section to apply this script
		loadImg:     '/graphics/loading.gif', // loading image path
		textColor:   '#fff',  // Text color for loading message
		bgColor:     '#000',  // Background color for the slide
		bgOpacity:    0.8,    // Background opacity: 0-1
		borderSize:   1,      // Border for image, measured in pixels
		borderColor: '#fff',  // Border color
		shrinkFit:    true,   // Shrink image to fit screen
		buffer:       2,      // Padding around shrunken image from edge
		fadeIn:       true,   // If image should fade in to appearance
		zoomIn:       true    // If image should zoom into appearance
	};
	/**** End User Settings ****/

	var slide, slideLoad, sBg,
		img, // the image
		y, yScroll, yPage, x, xScroll, xPage, centerY, centerX,
		regImg = /\.(jpg|jpeg|gif|png|bmp)$/i, // match image types
		startOp = 0,
		currOp = startOp,
		fxTime = 0.3, // time duration of effects in seconds
		dur = 60,
		deltaOp = (dur / fxTime / 1000),
		imgX = 0,
		imgY = 0,
		currX = 0,
		currY = 0,
		doc = document;
	vars.buffer += (vars.borderSize*2);

	var CenterImg = function() {
		var top = centerY - (imgY / 2),
			lef = centerX - (imgX / 2);
		if (top < yScroll) {
			top = yScroll;
		}
		if (lef < xScroll) {
			lef = xScroll;
		}
		img.style.top  = top + 'px';
		img.style.left = lef + 'px';
	};
	var OpacityUp = function() {
		if (currOp >= 1) {
			return;
		}
		currOp += deltaOp;
		img.style.opacity = currOp;
		setTimeout(function() {
			OpacityUp();
		}, dur);
	};
	var ZoomUp = function() {
		if (currX >= imgX && currY >= imgY) {
			return;
		}
		if (currX < imgX) {
			currX += Math.ceil(imgX * deltaOp);
			img.width = currX;
		}
		if (currX > imgX) {
			img.width = currX = imgX;
		}
		if (currY < imgY) {
			currY += Math.ceil(imgY * deltaOp);
			img.height = currY;
		}
		if (currY > imgY) {
			img.height = currY = imgY;
		}
		setTimeout(function() {
			ZoomUp();
		}, dur);
	};
	var ShowImg = function() {
		imgX = img.width;
		imgY = img.height;
		if (vars.shrinkFit) {
			if (imgX > x) {
				imgY = imgY * ((x-vars.buffer*2) / imgX);
				imgX = x - (vars.buffer*2);
			}
			if (imgY > y) {
				imgX = imgX * ((y-vars.buffer*2) / imgY);
				imgY = y - vars.buffer*2;
			}
		}

		currX = Math.ceil(imgX / 4);
		currY = Math.ceil(imgY / 4);
		CenterImg();
		img.style.zIndex = 5;     // bring image to front
		slideLoad.innerHTML = ''; // remove loading message
		if (vars.fadeIn === true) {
			OpacityUp();
		}
		if (vars.zoomIn === true) {
			ZoomUp();
		}
	};
	var HideSlide = function() {
		slide.style.display = 'none';
		if (doc.getElementById('slideImg')) {
			if (vars.fadeIn === true) {
				doc.getElementById('slideImg').style.opacity = 0;
			}
			doc.getElementById('slideImg').parentNode.removeChild(
				doc.getElementById('slideImg'));
		}
	};
	var ChangeSlide = function(target) {
		currOp = startOp;
		img = new Image();
		if (vars.loadImg !== '') {
			slideLoad.innerHTML = ['<img src="', vars.loadImg ,'"',' alt="Loading" width="20" height="20"',' style="position:relative; display:inline; z-index:2;',' margin:0 auto; padding:0; border:none; cursor:default;" />','<br />Loading...'].join('');
		}
		else {
			slideLoad.innerHTML = 'Loading...';
		}
		slide.style.display = 'block'; // put up slide with loading msg

		// Reset width before calculations
		sBg.style.width = 'auto';
		sBg.style.height = 'auto';

		// Get screen height, viewport height
		y = doc.documentElement.clientHeight || doc.body.clientHeight;
		// Find horizontal page position
		yScroll = window.pageYOffset || doc.body.scrollTop || doc.documentElement.scrollTop;
		// Get full height of the page
		yPage = doc.documentElement.scrollHeight || doc.body.scrollHeight || doc.body.offsetHeight;
		// Get page width
		x = doc.documentElement.clientWidth || doc.body.clientWidth;
		// Find horizontal page position
		xScroll = window.pageXOffset || doc.body.scrollLeft || doc.documentElement.scrollLeft;
		// Full page width
		xPage = doc.documentElement.scrollWidth || doc.body.scrollWidth || doc.body.offsetWidth;

		// Set slide background height/width
		sBg.style.height = yPage +'px';
		sBg.style.width  = xPage +'px';

		// Calculate centers
		centerY = Math.floor(y/2) + yScroll;
		centerX = Math.floor(x/2) + xScroll;
		// center loading image
		slideLoad.style.marginTop = centerY-64 +"px";

		img.onload = function()
		{
			/** Create image tag and style it */
			img.id    = 'slideImg';
			img.alt   = '';
			img.title = 'Click to close';
			var imgsty = img.style;
			imgsty.position = 'absolute';
			imgsty.display  = 'block';
			imgsty.margin   = '0 auto';
			imgsty.border   = vars.borderSize +'px solid '+ vars.borderColor;
			imgsty.cursor   = 'pointer';
			imgsty.zIndex   = 0; // hide the image away until loaded
			imgsty.opacity  = (vars.fadeIn === true) ? startOp : 1;
			img.onclick     = HideSlide;

			CenterImg(img); // attempt to center it
			// add slide to page
			slide.insertBefore(img, slide.firstChild);
			ShowImg();
		};
		img.src = target.getAttribute('href');
	};
	var ImageClickHandle = function() {
		ChangeSlide(this);
		return false;
	};
	var FindLinkedImages = function(id) {
		var links;
		if (id !== '' && doc.getElementById(id)) {
			links = doc.getElementById(id).getElementsByTagName('a');
		}
		else {
			links = doc.getElementsByTagName('a');
		}
		for (var a=0, l=links.length; a < l; a++) {
			if (regImg.test(links[a].href)) {
				links[a].onclick = ImageClickHandle;
			}
		}
	};
	// Get any query string on javascript url for any user setting overrides
	var ParseJSArgs = function(vars) {
		var scripts = doc.getElementsByTagName('script');
		for (var x=0, xx=scripts.length; x < xx; x++) {
			// Looking for script with source to this file
			if (!scripts[x].src || !/image\-viewer/.test(scripts[x].src)) {
				continue;
			}
			// Check if any arguments were entered
			if (!/\?.+/.test(scripts[x].src)) {
				continue;
			}
			var args = scripts[x].src.split('?')[1].split('&');
			for (var y=0, yy=args.length; y < yy; y++) {
				var pair = args[y].split('=');
				// skip if not a pair or not a known var
				if (pair.length != 2 || vars[pair[0]] === undefined) {
					continue;
				}
				vars[pair[0]] = pair[1];
			}
		}
	};
	var Init = function() {
		ParseJSArgs(vars);
		// Create slide HTML and assign styling
		slide = doc.createElement('div');
		slide.id       = 'slide';
		var slsty = slide.style;
		slsty.display  = 'none';
		slsty.position = 'absolute';
		slsty.top      = '0px';
		slsty.left     = '0px';
		slsty.width    = '100%';
		slsty.height   = '100%';

		// Create and style background
		sBg = document.createElement('div');
		sBg.id                    = 'slideBG';
		var sbgsty = sBg.style;
		sbgsty.position        = 'absolute';
		sbgsty.top             = '0px';
		sbgsty.left            = '0px';
		sbgsty.margin          = '0 auto';
		sbgsty.width           = '100%';
		sbgsty.textAlign       = 'center';
		sbgsty.backgroundColor = vars.bgColor;
		sbgsty.opacity         = vars.bgOpacity;
		sbgsty.zIndex          = '2';
		sBg.onclick            = HideSlide;

		// Create and style loading message
		slideLoad = doc.createElement('p');
		slideLoad.style.margin   = '0 auto';
		slideLoad.style.fontSize = '2em';
		slideLoad.style.color    = vars.textColor;

		// Build slide
		sBg.appendChild(slideLoad);
		slide.appendChild(sBg);
		var body = doc.getElementsByTagName('body')[0];
		body.appendChild(slide);
		body.style.height = "100%";
		FindLinkedImages(vars.id); // Find links and attach events
	};
	function appendOnLoad(fx) {
		try {
			if (document.addEventListener) {
				document.addEventListener('DOMContentLoaded', fx, false);
			}
			else if (window.attachEvent) {
				window.attachEvent('onload', fx);
			}
		}catch(e){}
	}
	appendOnLoad(Init);
}();

})(window);
