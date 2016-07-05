define({ "api": [  {    "type": "get/post",    "url": "https://track.atom-data.io/",    "title": "putEvent Send single data to Atom server",    "version": "1.0.1",    "group": "Atom",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "stream",            "description": "<p>Stream name for saving data in db table</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "data",            "description": "<p>Data for saving</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "method",            "description": "<p>POST or GET method for do request</p>"          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n   \"stream\": \"streamName\",\n   \"data\":  \"{\\\"name\\\": \\\"iron\\\", \\\"last_name\\\": \\\"Source\\\"}\"\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Null",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Response:",          "content": "HTTP 200 OK\n{\n   \"err\": null,\n   \"data\": \"success\"\n   \"status\": 200\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "type": "Object",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Error 4xx",            "type": "Null",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Error 4xx",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Error-Response:",          "content": "HTTP 401 Permission Denied\n{\n  \"err\": {\n    \"message\": \"Permission denied\",\n    \"status\": 401\n  },\n  \"data\": null,\n\n}",          "type": "json"        }      ]    },    "filename": "atom-sdk/src/atom.class.js",    "groupTitle": "Atom",    "name": "Get_postHttpsTrackAtomDataIo"  },  {    "type": "get/post",    "url": "https://track.atom-data.io/",    "title": "putEvent Send single data to Atom server",    "version": "1.0.0",    "group": "Atom",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "stream",            "description": "<p>Stream name for saving data in db table</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "data",            "description": "<p>Data for saving</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "method",            "description": "<p>POST or GET method for do request</p>"          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n   \"stream\": \"streamName\",\n   \"data\":  \"{\\\"name\\\": \\\"iron\\\", \\\"last_name\\\": \\\"Source\\\"}\"\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Null",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Response:",          "content": "HTTP 200 OK\n{\n   \"err\": null,\n   \"data\": \"success\"\n   \"status\": 200\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "type": "Object",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Error 4xx",            "type": "Null",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Error 4xx",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Error-Response:",          "content": "HTTP 401 Permission Denied\n{\n  \"err\": \"Target Stream\": \"Permission denied\",\n  \"data\": null,\n  \"status\": 401    \n}",          "type": "json"        }      ]    },    "filename": "atom-sdk/_apidoc.js",    "groupTitle": "Atom",    "name": "Get_postHttpsTrackAtomDataIo"  },  {    "type": "get/post",    "url": "https://track.atom-data.io/bulk",    "title": "putEvents Send multiple events data to Atom server",    "version": "1.0.1",    "group": "Atom",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "stream",            "description": "<p>Stream name for saving data in db table</p>"          },          {            "group": "Parameter",            "type": "Array",            "optional": false,            "field": "data",            "description": "<p>Multiple event data for saving</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "method",            "description": "<p>POST or GET method for do request</p>"          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n   \"stream\": \"streamName\",\n   \"data\":  [\"{\\\"name\\\": \\\"iron\\\", \\\"last_name\\\": \\\"Source\\\"}\",\n           \"{\\\"name\\\": \\\"iron2\\\", \\\"last_name\\\": \\\"Source2\\\"}\"]\n\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Null",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Response:",          "content": "HTTP 200 OK\n{\n   \"err\": null,\n   \"data\": \"success\"\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "type": "Object",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Error 4xx",            "type": "Null",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Error 4xx",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Error-Response:",          "content": "HTTP 401 Permission Denied\n{\n  \"err\": \n  {\n    \"message\": \"Error message\", \n    \"status\": 401 \n  },\n  \"data\": null\n}",          "type": "json"        }      ]    },    "filename": "atom-sdk/src/atom.class.js",    "groupTitle": "Atom",    "name": "Get_postHttpsTrackAtomDataIoBulk"  },  {    "type": "get/post",    "url": "https://track.atom-data.io/bulk",    "title": "putEvents Send multiple events data to Atom server",    "version": "1.0.0",    "group": "Atom",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "stream",            "description": "<p>Stream name for saving data in db table</p>"          },          {            "group": "Parameter",            "type": "Array",            "optional": false,            "field": "data",            "description": "<p>Multiple event data for saving</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "method",            "description": "<p>POST or GET method for do request</p>"          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n   \"stream\": \"streamName\",\n   \"data\":  [\"{\\\"name\\\": \\\"iron\\\", \\\"last_name\\\": \\\"Source\\\"}\",\n           \"{\\\"name\\\": \\\"iron2\\\", \\\"last_name\\\": \\\"Source2\\\"}\"]\n\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Null",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Response:",          "content": "HTTP 200 OK\n{\n   \"err\": null,\n   \"data\": \"success\"\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "type": "Object",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Error 4xx",            "type": "Null",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Error 4xx",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Error-Response:",          "content": "HTTP 401 Permission Denied\n{\n  \"err\": \"Error message\",\n  \"data\": null,\n  \"status\": 401\n}",          "type": "json"        }      ]    },    "filename": "atom-sdk/_apidoc.js",    "groupTitle": "Atom",    "name": "Get_postHttpsTrackAtomDataIoBulk"  },  {    "type": "post",    "url": "endpoint/bulk",    "title": "track Accumulate and send events to server",    "version": "1.1.0",    "group": "Atom",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "stream",            "description": "<p>Stream name for saving data in db table</p>"          },          {            "group": "Parameter",            "type": "All",            "optional": false,            "field": "data",            "description": "<p>Event data for saving</p>"          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n   \"stream\": \"streamName\",\n   \"data\": \"Some data\"\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Null",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Response:",          "content": "HTTP 200 OK\n{\n   \"err\": null,\n   \"data\": \"success\"\n   \"status\": 200\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "type": "Object",            "optional": false,            "field": "err",            "description": "<p>Server response error</p>"          },          {            "group": "Error 4xx",            "type": "Null",            "optional": false,            "field": "data",            "description": "<p>Server response data</p>"          },          {            "group": "Error 4xx",            "type": "String",            "optional": false,            "field": "status",            "description": "<p>Server response status</p>"          }        ]      },      "examples": [        {          "title": "Error-Response:",          "content": "HTTP 401 Permission Denied\n{\n  \"err\": {\"Target Stream\": \"Permission denied\",\n  \"data\": null,\n  \"status\": 401\n}",          "type": "json"        }      ]    },    "filename": "atom-sdk/src/tracker.class.js",    "groupTitle": "Atom",    "name": "PostEndpointBulk"  }] });
