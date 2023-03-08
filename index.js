const sharp = require('sharp');
const AWS = require('aws-sdk');

// get reference to S3 client
const s3 = new AWS.S3();

exports.handler = async(event) => {
  if(!event?.pathParameters?.proxy){
    return {
      headers: {
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 404,
      body: "Not Found.",
    };
  }
  var width = 0;
  var height = 0;
  
  if(event.queryStringParameters){
    width = event.queryStringParameters["w"]?event.queryStringParameters["w"]:0
    height = event.queryStringParameters["h"]?event.queryStringParameters["h"]:0
  }
  
  try {
    var path = event.pathParameters?.proxy;
    const params = {
      Bucket: "360food-staging",
      Key: path.replace(/^\/|\/$/g, ''),
    };
    var origimage = await s3.getObject(params).promise();
  } catch (error) {
    console.log("Error Log"+ error)
  }
  
  if(!origimage){
    return {
      headers: {
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 302,
      body: "Not Content.",
    };
  }
  
    var sharpImag = origimage.Body.toString('base64')
    
  //   // Use the sharp module to resize the image and save in a buffer.
  //   // var width = 200
  //   // var height = 200
    if(width!=0 || height!=0){
        let resize = {}
        if(width){
            resize = {...resize, width: parseFloat(width)}
        }
        if(height){
            resize = {...resize, height: parseFloat(height)}
        }
        // Sharpens the input and resizes it
        const oImg = await sharp(origimage.Body).resize(resize).toBuffer()
        sharpImag = Buffer.from(oImg, 'binary').toString('base64')
    }
  
  const response = {
      headers: {
        "Content-Type": "image/jpeg",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Cache-Control": "max-age=31536000,public",
        "Expires": "",
        "Last-Modified": origimage.LastModified
      },
      statusCode: 200,
      isBase64Encoded: true,
      body: sharpImag,
  };
  // const response = {
  //     headers: {
  //       "Access-Control-Allow-Methods": "GET",
  //       "Access-Control-Allow-Headers": "Content-Type, Authorization",
  //       "Access-Control-Allow-Origin": "*",
  //       "Access-Control-Allow-Credentials": true,
  //     },
  //     statusCode: 200,
  //     body: JSON.stringify(event),
  // };
  return response;
};
