/*
*  GBJSTK.js
*  GoodBarber JavaScript ToolKit for Plugins
*
*  Created for Beautiful Apps Plugins by GoodBarber.
*/

/************* Debugging Zone *************/

/* Var : int gbDebuggingMode
*  Sets the debugging mode using a system of code values. 
*  0 : Production mode
*  1 : Alerts before any request
*  2 : Alerts before any request + stop requests
*/
var gbDebuggingMode = 0;

/* Var : BOOL gbDesktopMode
*  Switch the gbRequest method to gbXHRequest - just to develop on a desktop browser.
*  DO NOT USE IN PRODUCTION 
*  true : Development mode
*  false : Production mode
*/
var gbDesktopMode = false;

/************* Helper Functions *************/

/* Function : gbIsEmpty
*  This function tests if an object is empty.
*  @param obj The action of the form
*  @return true if the object is empty, false otherwise 
*/
function gbIsEmpty ( obj )
{
    var name;
    for ( name in obj )
	{
        if ( obj.hasOwnProperty ( name ) )
		{
            return false;
        }
    }
    return true;
}

/* Function : gbConstructQueryString
*  This function construct a query string using the "params" dictionary.
*  @param params The params to construct the query string
*  @return The constructed query string
*/
function gbConstructQueryString ( params )
{
	var queryString = "";
	var first = true;
	for ( var key in params )
	{
		if ( params.hasOwnProperty ( key ) )
		{
			if ( !first )
				queryString += "&";
			first = false;
			queryString += key + "=" + params[key];
		}
	}
	return queryString;
}

/* Function : gbPostRequest
*  This function creates a form in document.body and send a POST request to "path" using "getParams" and "postParams".
*  @param path The action of the form
*  @param params The params to send in the request body 
*/
function gbPostRequest ( path, getParams, postParams )
{
	var formAction = path;
	if ( !gbIsEmpty ( getParams ) )
		formAction += "?" + gbConstructQueryString ( getParams ); 

	var form = document.createElement ( "form" );
	form.setAttribute ( "method", "post" );
	form.setAttribute ( "action", formAction );
	for ( var key in postParams )
	{
		if ( postParams.hasOwnProperty ( key ) )
		{
			var hiddenField = document.createElement ( "input" );
			hiddenField.setAttribute ( "type", "hidden" );
			hiddenField.setAttribute ( "name", key );
			hiddenField.setAttribute ( "value", postParams[key] );
			form.appendChild ( hiddenField );
		}
	}
	document.body.appendChild ( form );
	form.submit ();
}

/* Function : gbGetRequest
*  This function launches a navigation to "path" setting "params" as GET arguments.
*  @param path The destination path
*  @param params (optional) The params to send in the request body 
*/
function gbGetRequest ( path, getParams )
{
	getParams = getParams || {};
	var destination = path;
	if ( !gbIsEmpty ( getParams ) )
		destination += "?" + gbConstructQueryString ( getParams );

	if ( gbDebuggingMode >= 1 )
		alert ( destination );
	
	if ( gbDebuggingMode < 2 )
		document.location.replace ( destination );
}

function gbXHRequest ( requestMethod, tag, path, postParams )
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0))
		{
			gbRequestDidSuccess(tag, xhr.responseText, '');
		}
	};
	xhr.open ( requestMethod, path, true );
	xhr.send ( null );
}

/************* GoodBarber Plugin API Functions *************/

/************* [GB Plugin API] Basic Methods *************/

/* Function : gbMailto
*  Launches the mail Composer.
*  @param to The destination address
*  @param subject (optional) The mail subject
*  @param body The (optional) mail content 
*/
function gbMailto ( to, subject, body )
{
	to = to || "";
	subject = subject || "";
	body = body || "";
	gbGetRequest ( "mailto:" + to, { "subject":encodeURIComponent(subject), "body":encodeURIComponent(body) } );
}

/* Function : gbTel
*  Launches a call.
*  @param phoneNumber The number to call 
*/
function gbTel ( phoneNumber )
{
	gbGetRequest ( "tel:" + phoneNumber );
}

/* Function : gbSms
*  Launches the SMS composer.
*  @param phoneNumber The number to text 
*/
function gbSms ( phoneNumber )
{
	gbGetRequest ( "sms:" + phoneNumber );
}

/* Function : gbMaps
*  Launches the Maps native application.
*  @param params The parameters to pass in the query string 
*/
function gbMaps ( params )
{
	params = params || {};
	if ( gbIsEmpty ( params ) )
		gbGetRequest ( "goodbarber://maps?q=" );
	else
		gbGetRequest ( "goodbarber://maps", params );
}

/* Function : gbOpenApp
*  Tests if the current device can handle the URL scheme ("scheme" param), if so opens it, or opens the url ("url" param) otherwise.
*  @param scheme The URL scheme to test
*  @param url The URL to launch otherwise
*/
function gbOpenApp ( scheme, linkUrl )
{
	scheme = scheme || "";
	linkUrl = linkUrl || "";
	gbGetRequest ( "goodbarber://openapp", { "scheme":encodeURIComponent(scheme), "url":encodeURIComponent(linkUrl) } );
}

/* Function : gbGoToSection
*  Goes to the section identified by its "id".
*  @param id The id of the destination section
*/
function gbGoToSection ( id )
{
	gbGetRequest ( "goodbarber://gotosection", { "id":id } );
}

/************* [GB Plugin API] Navigation Methods *************/

/* Function : gbNavigatePush
*  Launch a push navigation between two pages of the plugin.
*  @param page The destination page
*  @param postParams The postParams to give to the destination page
*/
function gbNavigatePush ( page, postParams )
{
	gbPostRequest ( "goodbarber://navigate.push", { "page":page }, postParams );
}

/* Function : gbNavigateModal
*  Launch a modal navigation between two pages of the plugin.
*  @param page The destination page
*  @param postParams The postParams to give to the destination page
*/
function gbNavigateModal ( page, postParams )
{
	gbPostRequest ( "goodbarber://navigate.modal", { "page":page }, postParams );
}

/* Function : gbNavigateBack
*  Launch a back navigation between two pages of the plugin.
*/
function gbNavigateBack ()
{
	gbGetRequest ( "goodbarber://navigate.back" );
}

/************* [GB Plugin API] HTTP Request Methods *************/

/* Function : gbRequest
*  Starts a request to the url resource, using the "method" method, and passing the "postParams" params if method==POST.
*  @param resourceUrl The url of the resource to load
*  @param tag A tag to identify the request
*  @param cache YES if you want to use the app's cache mechanism, NO otherwise
*  @param requestMethod The HTTP method you want to use for the request
*  @param postParams If method==POST, you can pass HTTP Post Params in your request
*/
function gbRequest ( resourceUrl, tag, cache, requestMethod, postParams )
{
	postParams = postParams || {};
	requestMethod = requestMethod || "GET";

	if ( gbDesktopMode )
	{
		gbXHRequest ( requestMethod, tag, resourceUrl, postParams );
	}
	else
	{
		if ( requestMethod == "GET" )
		{
			gbGetRequest ( "goodbarber://request", { "url":encodeURIComponent(resourceUrl), "tag":tag, "cache":cache, "method":requestMethod } );
		}
		else
		{
			gbPostRequest ( "goodbarber://request", { "url":encodeURIComponent(resourceUrl), "tag":tag, "cache":cache, "method":requestMethod }, postParams );
		}
	}
}

/************* [GB Plugin API] Other Methods *************/

/* Function : gbAuthenticate
*  Ask the user to authenticate on a social network.
*  @param services The services to use for the authentication | values : [all(default)|facebook|twitter]
*  @param skip Give the user the possibility to skip the authentication process | values : [YES(default)|NO]
*/
function gbAuthenticate ( services, skip )
{
	services = services || "all";
	skip = skip || "YES";
	gbGetRequest ( "goodbarber://authenticate", { "services":services, "skip":skip } );
}

/* Function : gbShare
*  Ask the user to share a content on a social network.
*  @param shareText The text to share
*  @param shareLink The link to share
*/
function gbShare ( shareText, shareLink )
{
	shareText = shareText || "";
	shareLink = shareLink || "";
	gbGetRequest ( "goodbarber://share", { "text":encodeURIComponent(shareText), "link":encodeURIComponent(shareLink) } );
}

/* Function : gbGetMedia
*  Ask the user to take or choose a picture/movie.
*  @param mediaType The type of media that you want the user to take or choose | values : [photo(default)|video]
*  @param mediaSource The source (camera or library) | values : [all(default)|camera|library]
*/
function gbGetMedia ( mediaType, mediaSource )
{
	mediaType = mediaType || "photo";
	mediaSource = mediaSource || "all";
	gbGetRequest ( "goodbarber://getmedia", { "type":mediaType, "source":mediaSource } );
}

/* Function : gbGetLocation
*  Asks for the user geolocation.
*/
function gbGetLocation ()
{
	if ( gbDesktopMode )
	{
		navigator.geolocation.getCurrentPosition ( 
			function (position)
			{  
				gbDidSuccessGetLocation ( position.coords.latitude,position.coords.longitude );
 			},
			function (error)
			{
					switch(error.code) 
					{
						case error.TIMEOUT:
							gbDidFailGetLocation ('Timeout');
							break;
						case error.POSITION_UNAVAILABLE:
							gbDidFailGetLocation ('Position unavailable');
							break;
						case error.PERMISSION_DENIED:
							gbDidFailGetLocation ('Permission denied');
							break;
						case error.UNKNOWN_ERROR:
							gbDidFailGetLocation ('Unknown error');
							break;
					}
			}
		);
	}
	else
	{
		gbGetRequest ( "goodbarber://getlocation" );
	}
}

/* Function : gbSetPreference
*  Stores a preference in User Defaults.
*  @param key The key to store
*  @param valueString The value to store
*/
function gbSetPreference ( key, valueString )
{
	gbGetRequest ( "goodbarber://setpreference", { "key":key, "value":valueString } );
}

/* Function : gbGetPreference
*  Get a preference stored in User Defaults.
*  @param key The key to get
*/
function gbGetPreference ( key )
{
	if ( gbDesktopMode )
		gbDidSuccessGetPreference ( key, "" );

	gbGetRequest ( "goodbarber://getpreference", { "key":key } );
}