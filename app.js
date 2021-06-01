const app = require('express')()
const { v4 } = require('uuid')

app.get('/api', (req, res) => {
  return "Yest"
})



app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params
  res.end(`Item: ${slug}`)
})

module.exports = app