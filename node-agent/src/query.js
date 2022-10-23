'use strict'
/** @module query 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** Environment variables **/
const url = process.env.INFLUX_URL || 'http://influxdb:8086'
const token = process.env.INFLUX_TOKEN || 'myadmintoken'
const org = process.env.INFLUX_ORG || 'myorganization'




//Redis Connection
import express from 'express';
import redis from 'redis';
import crypto from 'crypto';
//const app = express()
const PORT = process.env.PORT || 9000
const REDIS_PORT = process.env.REDIS_PORT || 6379
const REDIS_URL = process.env.REDIS_URL || "redis"

//await client.connect();


var val = 'log_value';
var hash = crypto.createHash('md5').update(val).digest('hex');
var key;




//module.exports = app



/*
async function setRedis(key, val) {
  if (typeof val === 'object') {
   val = JSON.stringify(val)
  }
  //await client.connect();
  await client.set(key, val)
 }
*/





/**
 * Instantiate the InfluxDB client
 * with a configuration object.
 *
 * Get a query client configured for your org.
 **/
const queryApi = new InfluxDB({url, token}).getQueryApi(org)

/** To avoid SQL injection, use a string literal for the query. */
const fluxQuery = 'from(bucket: "mybucket") |> range(start: -10s) |> filter(fn: (r) => r["_measurement"] == "suricata") |> filter(fn: (r) => r["_field"] == "app_layer_flow_ssh") |> filter(fn: (r) => r["host"] == "host") |> filter(fn: (r) => r["thread"] == "total") |> last()'
const fluxObserver = {
  async next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    /*
    console.log(
      `${o._time} ${o._measurement} in ${o.region} (${o.sensor_id}): ${o._field}=${o._value}`)
      */
      
      val = `${o._time} ${o._measurement} : ${o._field}=${o._value}`;
      hash = crypto.createHash('md5').update(val).digest('hex');
      console.log("Key/Value pair added to Redis database: ", hash, " / ", val, )


      //await client.connect();
      //await client.set(hash,val);
      //await setRedis(hash,val);
      key = hash;
      
 


      //client.quit();



      /*
      client.get(key, function(err, result) {
            console.log("Value from key " + key + " : ", result.toString());
            process.exit();
        });
      */
      
    
  },
  error(error) {
    console.error(error)
    //console.log('\nFinished ERROR')
  },
  complete() {
    //console.log('\nFinished SUCCESS')
    //process.exit();
  }
}

// Execute query and collect result rows in a Promise.
// Use with caution, it copies the whole stream of results into memory.

const client = redis.createClient({
  legacyMode: true,
  docket: {
      port: REDIS_PORT + "/test",
      host: REDIS_URL
  }
});


client.on('connect', () => console.log(`Redis is connected on port ${REDIS_PORT}`));
client.on("error", (error) => console.error(error));

try {
  const data = await queryApi.collectRows(
    fluxQuery /*, you can specify a row mapper as a second arg */
  )
  data.forEach((x) => console.log(JSON.stringify(x)))
  data.forEach((x) => val = (JSON.stringify(x)))
  hash = crypto.createHash('md5').update(val).digest('hex');
  await client.connect();
  await client.set(hash,val)
  console.log("Key/Value pair added to Redis database: ", hash, " / ", val, )
  console.log('\nCollect ROWS SUCCESS')
  process.exit();
} catch (e) {
  console.error(e)
  console.log('\nCollect ROWS ERROR')
}






//const o = await queryApi.queryRaw(fluxQuery, fluxObserver)
//o = tableMeta.toObject(row)

/*
console.log(
  `${o._time} ${o._measurement} in ${o.region} (${o.sensor_id}): ${o._field}=${o._value}`)
console.log(o);

*/

/*
const client = redis.createClient({
  legacyMode: true,
  docket: {
      port: REDIS_PORT + "/test",
      host: REDIS_URL
  }
});


client.on('connect', () => console.log(`Redis is connected on port ${REDIS_PORT}`));
client.on("error", (error) => console.error(error));

await client.set(hash,val);
await client.get(key, function(err, result) {
console.log("Value from key " + key + " : ", val);
//process.exit();
});

*/






