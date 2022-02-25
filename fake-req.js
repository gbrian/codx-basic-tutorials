const busboy = require('busboy');

function test (req, res) {
    // console.log("read", req.read().toString("utf8"))
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, fileStream, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );
      fileStream.on('data', (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
      }).on('close', () => {
        console.log(`File [${name}] done`);
      });
    });
    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: %j`, val);
    });
    bb.on('close', () => {
      console.log('Done parsing form!');
      res.json({ "ok": true });
      res.end();
    });
    req.pipe(bb);
}

const res = {
    json (j) {
        console.log(j)
    },
    end () {}
}

const headers = {
    Host: "localhost",
    Authorization: "Bearer {{JWT}}",
    "User-Agent": "cyferd-tests/0.0.1",
    "content-type": 'multipart/form-data; boundary="XXX"',
    Host: "target-host.com"
}


const Readable = require('stream').Readable;
const req = new Readable();
req.headers = headers
req._read = () => {}; // redundant? see update below


test(req, res)
const b1 = '--XXX\r\nContent-Disposition: form-data; name="file"; filename="filename.csv"\r\nContent-Type: text/csv\r\n\r\nA,B,C\r\n1,1.1,name1\r\n2,2.2,name2\r\n\r\n--XXX--'
const b2 = `--XXX
Content-Disposition: form-data; name="size"

10
--XXX
Content-Disposition: form-data; name="extension"

txt
--XXX
Content-Disposition: form-data; name="expireDate"

2021-10-10T00:10:00Z
--XXX
Content-Disposition: form-data; name="file"; filename="my-filename.txt"

Esto es el contenido del fichero a subir.

--XXX--`.replace(/\n/mg, "\r\n")
console.log(JSON.stringify(b2))

req.emit('data', b2);
req.emit('end')

