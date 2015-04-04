function traverseAndCopy(src, dest, cb) {
  // read current directory
  fs.readdir(src, function(err, files) {
    if (err) cb(err);

    files = files.map(function(fileName) {
      // __dirname,
      // '..' cuz __dirname is relative to where this file is so that is ./bin,
      // '.' cuz thats the param to readdir i.e., the current directory we are traversing
      // fileName we want to turn to a full path
      return {
        fileName: fileName,
        path: path.resolve(src, fileName)
      };
    });

    console.log(files);

    files.forEach(function(fileObj, i) {
      fs.stat(fileObj.path, function(err, stats) {
        var perms;

        if (err) cb(err);

        perms = '0' + (stats.mode & parseInt('777', 8)).toString(8);

        if (!stats.isDirectory()) {
          console.log(fileObj.fileName.split(path.resolve( __dirname, '..')));
          console.log('Copying %s to %s', fileObj.path, path.resolve(dest, fileObj.fileName));
          console.log('Filename is %s', fileObj.fileName);

          var rs = fs.createReadStream(fileObj.path);
          var ws = fs.createWriteStream(path.resolve(dest, fileObj.fileName), {
            mode: perms
          });

          rs.pipe(ws);
          cb(null, fileObj.path);
        }
        else {
          var newDest = path.resolve(myvcs, fileObj.fileName);

          if (fileObj.fileName.indexOf('myvcs') > -1) return;

          console.log('NEW DEST %s', newDest);

          fs.stat(newDest, function(err, stats) {
            if (err) {
              // create a dest folder with the name same as the dir your currently traversing
              fs.mkdir(newDest, perms, function(err) {
                if (err) cb(err);
                traverseAndCopy(fileObj.path, newDest, cb);
              });
            }
            else traverseAndCopy(fileObj.path, newDest, cb);
          });
        }
      });
    });
  });
}

module.exports = traverseAndCopy;
