function handler (data, serverless, options) {
  console.log('Received Stack Output', data)
  return {"API_URL": data.HttpApiUrl}
}

module.exports = { handler }