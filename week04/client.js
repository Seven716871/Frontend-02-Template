const net = require('net')
const parser = require('./parser')

class Request {
    constructor(options) {
        this.method = options.method || 'GET'
        this.host = options.host
        this.port = options.port || 80
        this.path = options.path || '/'
        this.headers = options.headers || {}
        this.body = options.body || {}
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = "application/x-www-form-urlencoded"
        }

        if (this.headers['Content-Type'] === "application/json") {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }
        this.headers['Content-Length'] = this.bodyText.length
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n
${this.bodyText}`
    }

    send(connection) {
        return new Promise((resolve, reject) => {

            const parser = new ResponseParser
            if(connection) {
                connection.write(this.toString())
            } else {
                const connection = net.createConnection({
                    port: this.port,
                    host: this.host
                }, () => {
                    connection.write(this.toString())
                })
                connection.on('data', (data) => {
                    console.log(data.toString())
                    parser.receive(data.toString())
                    if (parser.isFilished) {
                        resolve(parser.response)
                        connection.end()
                    }
                })
    
                connection.on('error', (err) => {
                    console.log(err)
                    reject(err)
                    connection.end()
                })
            }
        })
    }
}

class ThunkBodyParser {
    constructor() {
        this.waiting_length = 0;
        this.waiting_length_line_end = 1;
        this.reading_thunk = 2;
        this.waiting_new_line = 3;
        this.waiting_new_line_end = 4;

        this.length = 0;
        this.content = [],
        this.isFilished = false;
        this.current = this.waiting_length
    }

    receiveChar(char) {
        if (this.current === this.waiting_length) {
            if(char === '\r') {
                if (this.length === 0) {
                    this.isFilished = true
                } 
                this.current = this.waiting_length_line_end
            } else {
                this.length *= 16
                    this.length += parseInt(char, 16)
            }
        } else if (this.current === this.waiting_length_line_end) {
            if (char === '\n') {
                this.current = this.reading_thunk
            }
        } else if (this.current === this.reading_thunk) {
            this.content.push(char)
            this.length--
            if (this.length === 0) {
                this.current = this.waiting_new_line
            }
        } else if (this.current === this.waiting_new_line) {
            if (char === '\r') {
                this.current = this.waiting_new_line_end
            }
        } else if (this.current === this.waiting_new_line_end) {
            if (char === '\n') {
                this.current = this.waiting_length
            }
        }
    }
}

class ResponseParser {
    constructor() {
        this.waiting_status_line = 0;
        this.waiting_status_line_end = 1;
        this.waiting_header_name = 2;
        this.waiting_header_space = 3;
        this.waiting_header_value = 4;
        this.waiting_header_line_end = 5;
        this.waiting_header_block_end = 6;
        this.waiting_body = 7;

        this.current = this.waiting_status_line
        this.statusLine = ''
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null
    }

    get isFilished() {
        return this.bodyParser && this.bodyParser.isFilished
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            header: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string) {
        for (let i=0; i<string.length;i++) {
            this.receiveChar(string.charAt(i))
        }
    }

    receiveChar(char) {
        if (this.current === this.waiting_status_line) {
            if (char === '\r') {
                this.current = this.waiting_status_line_end
            } else {
                this.statusLine += char
            }
        } else if (this.current === this.waiting_status_line_end) {
            if (char === '\n') {
                this.current = this.waiting_header_name
            }
        } else if (this.current === this.waiting_header_name) {
            if(char === ':') {
                this.current = this.waiting_header_space
            } else if (char === '\r') {
                this.current = this.waiting_header_block_end
                if(this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new ThunkBodyParser
                }
            } else {
                this.headerName += char
            }
        } else if (this.current === this.waiting_header_space) {
            if (char === ' ') {
                this.current = this.waiting_header_value
            }
        } else if (this.current === this.waiting_header_value) {
            if (char === '\r') {
                this.current = this.waiting_header_line_end
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.waiting_header_line_end) {
            if (char === '\n') {
                this.current = this.waiting_header_name
            }
        } else if (this.current === this.waiting_header_block_end) {
            if (char === '\n') {
                this.current = this.waiting_body
            }
        } else if(this.current === this.waiting_body) {
            this.bodyParser.receiveChar(char)
        }
    }
}

void async function () {
    const request = new Request({
        method: 'GET',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ['X-test']: 'custom'
        },
        body: {
            name: 'seven'
        }
    })
    let response = await request.send()
    console.log(response.body)
    parser.parseHTML(response.body)
}();