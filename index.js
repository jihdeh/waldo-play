const axios = require('axios');
const xml2js = require('xml2js');
const ExifImage = require('exif').ExifImage;

const parser = new xml2js.Parser();
const BASE_URL = 'http://s3.amazonaws.com/waldo-recruiting';

function getStoreData() {
  const xmlData = axios.get(BASE_URL).then((response) => response.data);
  return xmlData;
};

getStoreData().then((xmlData) => {
  parser.parseString(xmlData, function(err, result) {
    getExifFromImg(result.ListBucketResult.Contents);
  });
});

function getExifFromImg(contents) {
  console.log(contents.length, '--length');
  return Promise.all(contents.map((content) => {
    return axios({
      method: 'get',
      url: `${BASE_URL}/${content.Key[0]}`,
      responseType: 'arraybuffer'
    }).then((response) => {
      extractExif(response.data);
    }).catch(error => console.log(
      `Error Fetching this one Image: {
        status: ${error.response.status},
        statusText: ${error.response.statusText},
        file: ${error.response.config.url}
      }`
    ));
  }));
};

function extractExif(image, imageIdentifier) {
  try {
    new ExifImage({ image, imageIdentifier }, (error, exifData) => {
      if (error)
        console.log('Error: ' + error.message);
      else
        console.log(exifData.exif);
    });
  } catch (error) {
    console.log('Error parsing images: ' + error.message);
  }
}
