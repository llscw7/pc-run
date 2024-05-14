/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { join } from 'path';
var PROTO_PATH = join(__dirname, '..', 'python/capture/capture.proto');

import parseArgs from 'minimist';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
var packageDefinition = loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var capture_proto = loadPackageDefinition(packageDefinition).capture;


  var argv = parseArgs(process.argv.slice(2), {
    string: 'target'
  });
  var target;
  if (argv.target) {
    target = argv.target;
  } else {
    target = 'localhost:50051';
  }
  var client = new capture_proto.Greeter(target,
                                       credentials.createInsecure());
  // var user;
  // if (argv._.length > 0) {
  //   user = argv._[0];
  // } else {
  //   user = 'world';
  // }

//   client.SayHelloAgain({x: '0', y: '0', width: '1000', height: '1000'}, function(err, response) {
//     console.log('Greeting1:', response);
//   });
  client.SayHello({name: 'WORLD'}, function(err, response) {
    console.log('Greeting2:', response.message);
  });

export default client;