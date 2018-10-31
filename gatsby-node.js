const fetch = require('node-fetch')
const base64 = require('base-64')
const queryString = require('query-string')
const crypto = require('crypto')

exports.sourceNodes = async (
  { actions: { createNode }, createNodeId },
  { plugins, ...options }
) => {
  const apiUrl = `https://api.gathercontent.com/templates?${queryString.stringify(
    options.templates
  )}`
  const auth = base64.encode(`${options.auth.user}:${options.auth.key}`)
  const resp = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      Accept: `application/vnd.gathercontent.v0.5+json`,
      Authorization: `Basic ${auth}`,
    },
  })
  const response = await resp.json()

  response.data.forEach(template => {
    createNode({
      ...template,
      id: createNodeId(`gathercontent-template-${template.id}`),
      parent: null,
      children: [],
      internal: {
        type: `GathercontentTemplate`,
        content: JSON.stringify(template),
        contentDigest: crypto
          .createHash('md5')
          .update(JSON.stringify(template))
          .digest('hex'),
      },
    })
  })
}
