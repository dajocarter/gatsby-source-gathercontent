const fetch = require('node-fetch')
const base64 = require('base-64')
const queryString = require('query-string')
const crypto = require('crypto')

exports.sourceNodes = async (
  { actions: { createNode }, createNodeId },
  { plugins, ...options }
) => {
  const apiUrl = `https://api.gathercontent.com`

  let statusesUrl = `${apiUrl}/projects/${options.project_id}/statuses`
  let itemsUrl = `${apiUrl}/items?project_id=${options.project_id}`
  let templatesUrl = `${apiUrl}/templates?project_id=${options.project_id}`

  const auth = base64.encode(`${options.auth.user}:${options.auth.key}`)
  const fetchOptions = {
    method: 'GET',
    headers: {
      Accept: `application/vnd.gathercontent.v0.5+json`,
      Authorization: `Basic ${auth}`,
    },
  }

  const statuses = await fetch(statusesUrl, fetchOptions)
  const statusesJSON = await statuses.json()

  statusesJSON.data.forEach(status => {
    createNode({
      ...status,
      id: createNodeId(`gathercontent-status-${status.id}`),
      parent: null,
      children: [],
      internal: {
        type: `GathercontentStatus`,
        content: JSON.stringify(status),
        contentDigest: crypto
          .createHash('md5')
          .update(JSON.stringify(status))
          .digest('hex'),
      },
    })
  })

  const items = await fetch(itemsUrl, fetchOptions)
  const itemsJSON = await items.json()

  itemsJSON.data.forEach(item => {
    item.created_at = new Date(item.created_at.date)
    item.updated_at = new Date(item.updated_at.date)
    createNode({
      ...item,
      id: createNodeId(`gathercontent-item-${item.id}`),
      parent: null,
      children: [],
      internal: {
        type: `GathercontentItem`,
        content: JSON.stringify(item),
        contentDigest: crypto
          .createHash('md5')
          .update(JSON.stringify(item))
          .digest('hex'),
      },
    })
  })

  const templates = await fetch(templatesUrl, fetchOptions)
  const templatesJSON = await templates.json()

  templatesJSON.data.forEach(template => {
    template.used_at = new Date(template.used_at)
    template.created_at = new Date(template.created_at * 1000)
    template.updated_at = new Date(template.updated_at * 1000)
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
  return
}
