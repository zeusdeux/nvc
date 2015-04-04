#! /usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
//var cp  = require('../src/cp');
var cp = require('ncp').ncp;
var args = process.argv.slice(2);
var nvc = path.resolve('.', '.nvc');


// type Path = String
// getCurrentSnapshotVersion :: Path -> String
function getNextSnapshotVersion(myVcsPath) {
  return (fs.readdirSync(myVcsPath).length).toString();
}

// snap :: IO ()
function snap() {
  var latestSnapshotVersion = getNextSnapshotVersion(nvc);
  var snapShotPath          = path.join(nvc, latestSnapshotVersion);

  cp('.', snapShotPath, function(err) {
    if (!err) console.log('Snapshot %d created', latestSnapshotVersion);
  });
}

// checkout :: Int -> IO ()
function checkout(snapshotNumber) {
  console.log(getNextSnapshotVersion());

  if (snapshotNumber >= getNextSnapshotVersion()) {
    console.log('Snapshot doesn\'t exist yet');
    process.exit(1);
  }

  var snapShotPath = path.join(nvc, snapshotNumber + '');

  cp(snapShotPath, './working', function(err){
    if (!err) console.log('Snapshot %d restored', snapshotNumber);
  });
}

// type Operation = String
// type Arg = String
// run :: Operation -> [Arg] -> IO ()
function run(operation, args) {
  console.log(operation, args);
  try {
    var stats = fs.statSync(nvc);

    if (stats.isDirectory()) perform(operation, args);
    else throw new Error('.nvc exists but is not a directory.');
  }
  catch (e) {
    switch (e.code) {
      case 'ENOENT':
        console.log('Creating repository..');

        //make directory since it doesn't exist
        fs.mkdirSync('./.nvc', '0755');

        // perform operation
        perform(operation, args);
        break;
      default:
        // chuck error out to default handler if it isn't ENOENT
        throw e;
    }
  }

}

function perform(operation, args) {
  switch (operation) {
    case 'snap':
    case 'backup':
      snap();
      break;
  case 'checkout':
    checkout(args[0]);
      break;
    case 'current':
      break;
    case 'log':
      break;
    case 'diff':
      break;
    case 'branch':
      break;
    default:
      console.log('Unrecognised command');
      process.exit(1);
  }
}

run(args.shift(), args);
