const app = require('express')()
const { v4 } = require('uuid')

app.get('/api', (req, res) => {
  res.send("Yeee!")
})



app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params
  res.end(`Item: ${slug}`)
})

module.exports = app