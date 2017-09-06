'use strict';

/**
 * <ul>
 *   <li>{@link reflexContext.addids}
 *   <li>{@link reflexContext.allocids}
 *   <li>{@link reflexContext.count}
 *   <li>{@link reflexContext.delete}
 *   <li>{@link reflexContext.deleteFolder}
 *   <li>{@link reflexContext.doResponse}
 *   <li>{@link reflexContext.doResponseCsv}
 *   <li>{@link reflexContext.doResponseHtml}
 *   <li>{@link reflexContext.fetch}
 *   <li>{@link reflexContext.getContent}
 *   <li>{@link reflexContext.getContentType}
 *   <li>{@link reflexContext.getCookies}
 *   <li>{@link reflexContext.getCsv}
 *   <li>{@link reflexContext.getEntry}
 *   <li>{@link reflexContext.getFeed}
 *   <li>{@link reflexContext.getHeaders}
 *   <li>{@link reflexContext.getHtml}
 *   <li>{@link reflexContext.getMail}
 *   <li>{@link reflexContext.getPathinfo}
 *   <li>{@link reflexContext.getQueryString}
 *   <li>{@link reflexContext.getRequest}
 *   <li>{@link reflexContext.getSettingValue}
 *   <li>{@link reflexContext.getStatus}
 *   <li>{@link reflexContext.getUriAndQuerystring}
 *   <li>{@link reflexContext.httpmethod}
 *   <li>{@link reflexContext.log}
 *   <li>{@link reflexContext.post}
 *   <li>{@link reflexContext.put}
 *   <li>{@link reflexContext.rangeids}
 *   <li>{@link reflexContext.RXID}
 *   <li>{@link reflexContext.saveFiles}
 *   <li>{@link reflexContext.sendError}
 *   <li>{@link reflexContext.sendMessage}
 *   <li>{@link reflexContext.sendRedirect}
 *   <li>{@link reflexContext.setHeader}
 *   <li>{@link reflexContext.setids}
 *   <li>{@link reflexContext.setStatus}
 *   <li>{@link reflexContext.toPdf}
 *   <li>{@link reflexContext.toXls}
 *   <li>{@link reflexContext.uid}
 * </ul>
 * @constructor
 */
var reflexContext = function() {
};

/**
 * @description fetch provides an interface for fetching resources. Same as Fetch API if used locally. <br/>See : <a>https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API</a>
 * @param  {string} url - target url 
 * @param  {init} init - init parameter object
 * @param  {string} init.method - HTTP method
 * @param  {string} init.body - data body to send
 */
reflexContext.fetch = function(url,init) {

 var Exception = function(status,message) {
    this.status = status;
    this.message = message;
  }

  var handleErrors = function(response) {
    // 4xx系, 5xx系エラーでresponse.ok = false
    if (!response.ok) {
      throw new Exception(response.status,response.statusText);		// TODO detect server response
    }
    return response;
  }

  var context = {};
  context.url = url;
  context.init = init;
  context.then = function(func,func_err) {

	  try {
      var response;
      if (typeof this.init === "undefined"||this.init.method==='GET') {        
            if (this.url.match(/[\?&]e(&.*)?$/)) {
              response = ReflexContext.getEntry(this.url.trim().slice(2));              
            }else {
              response = ReflexContext.getFeed(this.url.trim().slice(2));
            }
            if (!response.feed.title) {
              func(response);
            }else {
              func_err(response);              
            }
      }else if (this.init.method==='POST') {
            var response = ReflexContext.post(this.url.trim().slice(2),this.init.body);
            if (!response.feed.title) {
              func(response);
            }else {
              func_err(response);              
            }
      }else if (this.init.method==='PUT') {
            var response = ReflexContext.put(this.url.trim().slice(2),this.init.body);
            if (!response.feed.title) {
              func(response);
            }else {
              func_err(response);              
            }
      }else if (this.init.method==='DELETE') {
            var response = ReflexContext.deleteFeed(this.url.trim().slice(2));
            if (!response.feed.title) {
              func(response);
            }else {
              func_err(response);              
            }
      } 

    } catch (e) {     
      if (e.message === 'ReflexContext is not defined') {
      this.init.credentials = 'include';
      this.init.headers = this.init.headers ? this.init.headers : {};
      this.init.headers['X-Requested-With'] = 'XMLHttpRequest';
      fetch(this.url,this.init)
              .then(handleErrors)
              .then(function(response) {
                return response.json()
              })
              .then(func)
              .catch(func_err);
        
    } else {
        console.log('reflexcontext.fetch() : ' + e.message);
        const err = { feed: { title: e.message } }
        func_err(err);              
    }
 
   }
}
   return context;

}


/**
 * @description Outputs a message to the Admin Console.
 * @param  {string} message - message to output
 * @param  {string} [title] - title
 * @param  {string} [subtitle] - subtitle
 */
reflexContext.log = function(message,title,subtitle) {

  try {
    if (subtitle) {
      ReflexContext.log(message,title,subtitle);
    } else {
      if (title) {
        ReflexContext.log(message,title);
      } else {
        ReflexContext.log(message);        
      }
    }
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      if (subtitle) {
        console.log(title + ' ' + subtitle + ' ' + message);
      } else {
        if (title) {
          console.log(title + ' ' + message);
        } else {
          console.log(message);        
        }
      }
    } else {
      console.log('reflexcontext.log() : '+e.message);
      throw e;      
    }    
  }
}

/**
 * @description Sends an error response to the client using the specified status.
 * @param  {number} status_code - http status code
 * @param  {string} [message] - message to send
 */
reflexContext.sendError = function(status_code,message) {

  try {
    if (message) {
      ReflexContext.sendError(status_code,message);
    } else {
      ReflexContext.sendError(status_code);      
    }
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.sendError() is called but not executed. outfilename=' + outfilename);
    } else {
      console.log('reflexcontext.sendError() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Sends an feed response(including message) to the client using the specified status.
 * @param  {number} status_code - http status code
 * @param  {string} message - message to send 
 */
reflexContext.sendMessage = function(status_code,message) {

  try {
    ReflexContext.sendMessage(status_code,message);
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.sendMessage() is called but not executed. outfilename=' + outfilename);
    } else {
      console.log('reflexcontext.sendMessage() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Convert to PDF and sends it to the client using the specified data and html.
 * @param  {feed} data - data
 * @param  {string} html - html template 
 * @param  {string} outfilename - output filename
 * @param  {string} [baseurl] - base PDF's url
 */
reflexContext.toPdf = function(data,html,outfilename,baseurl) {

  try {
    if (baseurl) {
      ReflexContext.toPdf(data, html, outfilename,baseurl);
    } else {
      ReflexContext.toPdf(data, html, outfilename);
    }
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.toPdf() is called but not executed. outfilename=' + outfilename);
    } else {
      console.log('reflexcontext.toPdf() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Convert to Xls and sends it to the client using the specified data and inputxls.
 * @param  {feed} data - data
 * @param  {string} inputxls - xls template
 * @param  {string} outfilename - output filename
 */
reflexContext.toXls = function(data,inputxls,outfilename) {
  
  try {
    ReflexContext.toXls(data,inputxls,outfilename);
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.toXls() is called but not executed. outfilename=' + outfilename);
    } else {
      console.log('reflexcontext.toXls() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Sends an content to the client using the specified html.
 * @param  {string} html - output html contents
 */
reflexContext.doResponseHtml = function (html) {

  try {
    ReflexContext.doResponseHtml(html);
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.doResponseHtml() is called but not executed.');
    } else {
      console.log('reflexcontext.doResponseHtml() : '+e.message);
      throw e;      
    }
  }
  
}

/**
 * @description Sets the status code for this response.
 * @param  {number} status_code - http status code
 */
reflexContext.setStatus = function (status_code) {

  try {
    ReflexContext.setStatus(status_code);
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.setStatus() is called but not executed.');
    } else {
      console.log('reflexcontext.setStatus() : '+e.message);
      throw e;      
    }
  }
  
}

/**
 * @description Gets the status code for this response.
 * @returns {number} - http status code
 */
reflexContext.getStatus = function () {

  try {
    return ReflexContext.getStatus();
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getStatus() is called but not executed.');
      return 200;
    } else {
      console.log('reflexcontext.getStatus() : '+e.message);
      throw e;      
    }
  }  
}

/**
 * @description Sends a temporary redirect response to the client using the specified redirect location URL.
 * @param  {string} location - redirect url
 */
reflexContext.sendRedirect = function (location) {

  try {
    ReflexContext.sendRedirect(location);
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.sendRedirect() is called but not executed.');
    } else {
      console.log('reflexcontext.sendRedirect() : '+e.message);
      throw e;      
    }    
  }
}

/**
 * @description Sets a response header with the given name and value.
 * @param  {string} name - header's name
 * @param  {string} value - header's value
 */
reflexContext.setHeader = function (name,value) {

  try {
    ReflexContext.setHeader(name, value);
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.setHeader() is called but not executed.');
    } else {
      console.log('reflexcontext.setHeader() : '+e.message);
      throw e;      
    }        
  }
}

/**
 * @description Returns the query string that is contained in the request URL after the path.
 * @param  {string} [param] - query parameter
 * @returns  {string} - query string
 */
reflexContext.getQueryString = function (param) {

  try {
    if (param) {
      return ReflexContext.parameter(param);
    } else {
      return ReflexContext.querystring();    
    }
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getQueryString() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getQueryString() : '+e.message);
      throw e;      
    }        
  }
}

/**
 * @description Returns the URL path and the query string.
 * @returns  {string} - the URL path and the query string.
 */
reflexContext.getUriAndQuerystring = function () {

  try {
    return ReflexContext.uriquerystring();
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getUriAndQuerystring() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getUriAndQuerystring() : '+e.message);
      throw e;      
    }        
  }
}

/**
 * @description Returns any extra path information associated with the URL the client sent when it made this request.
 * @returns  {string} - pathinfo
 */
reflexContext.getPathinfo = function () {

  try {
    return ReflexContext.pathinfo();
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getPathinfo() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getPathinfo() : '+e.message);
      throw e;      
    }            
  }
  
}

/**
 * @description Gets the content type for this response.
 * @returns  {string} - content type
 */
reflexContext.getContentType = function () {

  try {
    return ReflexContext.contenttype();
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getContentType() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getContentType() : '+e.message);
      throw e;      
    }            
  }
}

/**
 * @description Returns the response feed to the client by the specified url.
 * @param  {string} url - url
 * @returns  {feed} - feed
 */
reflexContext.getFeed = function (url) {

  try {
    return ReflexContext.getFeed(url);
  }catch(e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getFeed() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.getFeed() : '+e.message);
      throw e;      
    }            
  }
}

/**
 * @description Returns the response entry to the client by the specified url.
 * @param  {string} url - url
 * @returns  {entry} - entry
 */
reflexContext.getEntry = function (url) {

  try {
    return ReflexContext.getEntry(url);
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getEntry() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.getEntry() : ' + e.message);
      throw e;
    }
  }
}

/**
 * @description Posts the request feed to the server with the specified url.
 * @param  {feed} request - request feed
 * @param  {string} url - url
 * @param  {boolean} force - Forcibly execute even if it exceeds the upper limit of entries of request feed.
 * @returns  {feed} - result
 */
reflexContext.post = function (request,url,force) {

  try {
      if (force) {
        var cnt = 3000;  // max entry
        for(var ii = 0; ii < Math.ceil(request.feed.entry.length / cnt); ii++) {
          var j = ii * cnt;
          var newrequest = { 'feed' : { 'entry' : [] }};
          newrequest.feed.entry = request.feed.entry.slice(j, j + cnt); 
          if (url) {           
            return ReflexContext.post(newrequest,url);
          }else {
            return ReflexContext.post(newrequest);
          }
        }
      }else {
          if (url) {           
            return ReflexContext.post(request,url);
          }else {
            return ReflexContext.post(request);
          }
      }
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.post() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.post() : '+e.message);
      throw e;      
    }
  }
  
}

/**
 * @description Puts the request feed to the server.
 * @param  {feed} request - request feed
 * @param  {boolean} force - Forcibly execute even if it exceeds the upper limit of entries of request feed.
 * @returns  {feed} result
 */
reflexContext.put = function (request,force) {

  try {
    if (force) {
    	var cnt = 3000;  // max entry
      for(var ii = 0; ii < Math.ceil(request.feed.entry.length / cnt); ii++) {
        var j = ii * cnt;
        var newrequest = { 'feed' : { 'entry' : [] }};
        newrequest.feed.entry = request.feed.entry.slice(j, j + cnt); 
        return ReflexContext.put(newrequest);
      }
    }else {
      return ReflexContext.put(request);
    }

  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.put() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.put() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Deletes the entry data with the specified url.
 * @param  {string} url - url
 * @returns  {feed} result
 */
reflexContext.delete = function (url) {

  try {
//    return ReflexContext.delete(uri,revision); deplicated
    return ReflexContext.deleteFeed(url);
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.delete() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.delete() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Deletes the folder entry and descendants with the specified url.
 * @param  {string} url
 * @returns  {feed} feed
 */
reflexContext.deleteFolder = function (uri) {

  try {
    return ReflexContext.deleteFolder(uri);
  } catch (e) {
    if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.deleteFolder() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.deleteFolder() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Sets the value to the ids(numbering data) with the specified url.
 * @param  {string} url - url
 * @param  {number} num - value to set
 */
reflexContext.setids = function (url,num) {

  try {
    ReflexContext.setids(url,''+num);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.setids() is called but not executed.');
    } else {
      console.log('reflexcontext.setids() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Adds the num value to the ids(numbering data) with the specified url.
 * @param  {string} url - url
 * @param  {number} num - number of additions
 * @returns {feed} - feed.title in results.
 */
reflexContext.addids = function (url,num) {

  try {
    return ReflexContext.addids(url,num);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.addids() is called but not executed.');
      return '0';
    } else {
      console.log('reflexcontext.addids() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Allocate the num value to the ids(numbering data) with the specified url.
 * @param  {string} url - url
 * @param  {number} num - number to allocate
 * @returns {feed} - feed.title in results.
 */
reflexContext.allocids = function (url,num) {

  try {
    return ReflexContext.allocids(url,num);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.allocids() is called but not executed.');
      return '0';
    } else {
      console.log('reflexcontext.allocids() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Sets the range of the ids(numbering data) with the specified url.
 * @param  {string} url - url
 * @param  {string} range - range
 */
reflexContext.rangeids = function (url,range) {

  try {
    ReflexContext.rangeids(url,range);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.rangeids() is called but not executed.');
    } else {
      console.log('reflexcontext.rangeids() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Returns the number of entry to the client by the specified url.
 * @param  {string} url - url
 * @returns  {number} - results
 */
reflexContext.count = function (url) {

  try {
    return ReflexContext.count(url);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.count() is called but not executed.');
      return 0;
    } else {
      console.log('reflexcontext.count() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the feed data for this request.
 * @returns  {feed} - request data
 */
reflexContext.getRequest = function () {

  try {
    return ReflexContext.getRequest();
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getRequest() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.getRequest() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the cookies for this request.
 * @returns  {feed} - cookies
 */
reflexContext.getCookies = function () {

  try {
    return ReflexContext.getCookies();
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getCookies() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getCookies() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the headers for this request.
 * @returns  {feed} - headers
 */
reflexContext.getHeaders = function () {

  try {
    return ReflexContext.getHeaders();
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getHeaders() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getHeaders() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Saves the files to the server with the specified props. This method is used simultaneously with file uploading. 
 * @param  {props} props - save files info.
 */
reflexContext.saveFiles = function (props) {

  try {
    ReflexContext.saveFiles(props);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.saveFiles() is called but not executed.');
    } else {
      console.log('reflexcontext.saveFiles() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the uid for this request. uid is a login user-specific code.
 * @returns  {string} - uid
 */
reflexContext.uid = function () {

  try {
    return ReflexContext.uid();
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.uid() is called but not executed.');
      return '0';
    } else {
      console.log('reflexcontext.uid() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the http method for this request.
 * @returns  {string} - httpmethod
 */
reflexContext.httpmethod = function () {

  try {
    return ReflexContext.httpmethod();
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.httpmethod() is called but not executed.');
      return 'GET';
    } else {
      console.log('reflexcontext.httpmethod() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the RXID
 * @returns  {string} - RXID
 */
reflexContext.RXID = function () {

  try {
    return ReflexContext.RXID();
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.RXID() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.RXID() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the setting value of the service(/_settings/properties) by the specified key.
 * @returns  {string} - setting value
 */
reflexContext.getSettingValue = function (key) {

  try {
    return ReflexContext.settingValue(key);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getSettingValue() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getSettingValue() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Returns the feed to the client by the specified feed and status_code.
 * @param  {feed} feed - feed to respond
 * @param  {int} status_code - http status code
 */
reflexContext.doResponse = function (feed,status_code) {

  try {
    if (status_code) {
      ReflexContext.doResponse(feed,status_code);
    } else {
      ReflexContext.doResponse(feed);      
    }
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.doResponse() is called but not executed.');
    } else {
      console.log('reflexcontext.doResponse() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the html content by the specified url.
 * @param  {string} url - url
 * @returns  {string} - html content
 */
reflexContext.getHtml = function (url) {

  try {
    return ReflexContext.content(url);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getHtml() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getHtml() : '+e.message);
      throw e;      
    }
  }
}

/**
 * @description Gets the content by the specified url.
 * @param  {string} url - url
 * @returns  {string} - content
 */
reflexContext.getContent = function (url) {

  try {
    return ReflexContext.contentbykey(url);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getContent() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getContent() : '+e.message);
      throw e;      
    }    
  }
  
}

/**
 * @description Gets the mail messages by the specified settings.
 * @param  {settings} settings - mail settings
 * @returns  {feed} - results
 */
reflexContext.getMail = function (settings) {

  try {
    return ReflexContext.getMail(settings);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getMail() is called but not executed.');
      return '{}';
    } else {
      console.log('reflexcontext.getMail() : '+e.message);
      throw e;      
    }    
  }
}

/**
 * @description Convert the csv data to the feed.
 * @param  {string[]} header - csv header
 * @param  {string[]} items - csv items
 * @param  {string} parent - parent item(e.g.'entry')
 * @param  {number} skip - number to skip rows
 * @param  {string} encoding - encoding type
 * @returns  {feed} - results
 */
reflexContext.getCsv = function (header,items,parent,skip,encoding) {

  try {
    return ReflexContext.getCsv(header,items,parent,skip,encoding);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.getCsv() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.getCsv() : '+e.message);
      throw e;      
    }        
  }
}

/**
 * @description Returns the csv data to the client using the specified value and filename.
 * @param  {string[]} value - csv rows
 * @param  {string} filename - output file's name
 */
reflexContext.doResponseCsv = function(value,filename) {

  try {
    return ReflexContext.doResponseCsv(value,filename);
  } catch (e) {
   if (e.message === 'ReflexContext is not defined') {
      console.log('ReflexContext.doResponseCsv() is called but not executed.');
      return '';
    } else {
      console.log('reflexcontext.doResponseCsv() : '+e.message);
      throw e;      
    }            
  }
}

module.exports = reflexContext; 
